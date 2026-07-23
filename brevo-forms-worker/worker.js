// Cloudflare Worker that proxies the nickkasmo.nl contact and newsletter
// forms to Brevo, so the Brevo API key never has to live in client-side code.
//
// Requires one secret set in the Cloudflare dashboard (Settings > Variables):
//   BREVO_API_KEY   (add as "Secret", not plain text)
//
// Non-secret config lives in wrangler.toml under [vars]:
//   BREVO_LIST_ID, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME, CONTACT_TO_EMAIL

const ALLOWED_ORIGINS = ["https://nickkasmo.nl", "https://www.nickkasmo.nl"];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return /^https?:\/\/localhost(:\d+)?$/.test(origin);
}

function corsHeaders(origin) {
  const headers = { Vary: "Origin" };
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return headers;
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (!isAllowedOrigin(origin)) {
      return json({ error: "Origin not allowed." }, 403, origin);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405, origin);
    }

    if (url.pathname === "/newsletter") {
      return handleNewsletter(request, env, origin);
    }
    if (url.pathname === "/contact") {
      return handleContact(request, env, origin);
    }

    return json({ error: "Not found." }, 404, origin);
  },
};

async function handleNewsletter(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Ongeldige aanvraag." }, 400, origin);
  }

  // Honeypot: real visitors never fill this hidden field.
  if (body.website) {
    return json({ ok: true }, 200, origin);
  }

  if (!isValidEmail(body.email)) {
    return json({ error: "Vul een geldig e-mailadres in." }, 400, origin);
  }

  const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: body.email,
      listIds: [Number(env.BREVO_LIST_ID)],
      updateEnabled: true,
    }),
  });

  if (!brevoResponse.ok && brevoResponse.status !== 204) {
    const errorData = await brevoResponse.json().catch(() => ({}));
    return json(
      { error: errorData.message || "Inschrijven is niet gelukt. Probeer het later opnieuw." },
      502,
      origin
    );
  }

  return json({ ok: true }, 200, origin);
}

async function handleContact(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Ongeldige aanvraag." }, 400, origin);
  }

  if (body.website) {
    return json({ ok: true }, 200, origin);
  }

  const voornaam = (body.voornaam || "").trim();
  const achternaam = (body.achternaam || "").trim();
  const bericht = (body.bericht || "").trim();
  const naam = `${voornaam} ${achternaam}`.trim();

  if (!voornaam || !achternaam || !bericht || !isValidEmail(body.email)) {
    return json({ error: "Vul je voornaam, achternaam, e-mail en bericht in." }, 400, origin);
  }

  // Best-effort: a CRM hiccup should never block the actual message from being sent.
  await createContactWithNote(env, { voornaam, achternaam, email: body.email, bericht }).catch(() => {});

  const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: env.BREVO_SENDER_NAME, email: env.BREVO_SENDER_EMAIL },
      to: [{ email: env.CONTACT_TO_EMAIL, name: "Nick Kasmo" }],
      replyTo: { email: body.email, name: naam },
      subject: `Nieuw bericht via nickkasmo.nl van ${naam}`,
      htmlContent: `<p><strong>Naam:</strong> ${escapeHtml(naam)}</p><p><strong>E-mail:</strong> ${escapeHtml(
        body.email
      )}</p><p><strong>Bericht:</strong><br>${escapeHtml(bericht).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!brevoResponse.ok) {
    const errorData = await brevoResponse.json().catch(() => ({}));
    return json(
      { error: errorData.message || "Versturen is niet gelukt. Probeer het later opnieuw." },
      502,
      origin
    );
  }

  return json({ ok: true }, 200, origin);
}

async function createContactWithNote(env, { voornaam, achternaam, email, bericht }) {
  const brevoHeaders = {
    "api-key": env.BREVO_API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const createResponse = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: brevoHeaders,
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: voornaam, LASTNAME: achternaam },
      updateEnabled: true,
    }),
  });

  if (!createResponse.ok && createResponse.status !== 204) {
    console.error("Brevo contact create failed", createResponse.status, await createResponse.text());
  }

  const contactResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
    headers: brevoHeaders,
  });

  if (!contactResponse.ok) {
    console.error("Brevo contact lookup failed", contactResponse.status, await contactResponse.text());
    return;
  }
  const contact = await contactResponse.json();
  if (!contact.id) return;

  const noteResponse = await fetch("https://api.brevo.com/v3/crm/notes", {
    method: "POST",
    headers: brevoHeaders,
    body: JSON.stringify({
      text: `<p><strong>Bericht via contactformulier nickkasmo.nl</strong></p><p>${escapeHtml(bericht).replace(
        /\n/g,
        "<br>"
      )}</p>`,
      contactIds: [contact.id],
    }),
  });

  if (!noteResponse.ok) {
    console.error("Brevo note create failed", noteResponse.status, await noteResponse.text());
  }
}
