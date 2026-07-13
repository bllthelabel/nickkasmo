// Minimal GitHub OAuth proxy for Decap CMS, deployed as a Cloudflare Worker.
// Implements the postMessage handshake Decap CMS expects from a "github" backend.
//
// Requires two secrets set in the Cloudflare dashboard (Settings > Variables):
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET   (add as "Secret", not plain text)

export default {
  async fetch(request, rawEnv) {
    const url = new URL(request.url);
    const env = {
      GITHUB_CLIENT_ID: (rawEnv.GITHUB_CLIENT_ID || "").trim(),
      GITHUB_CLIENT_SECRET: (rawEnv.GITHUB_CLIENT_SECRET || "").trim(),
    };

    if (url.pathname === "/auth") {
      return handleAuth(url, env);
    }
    if (url.pathname === "/callback") {
      return handleCallback(request, url, env);
    }
    return new Response("NickKasmo.nl CMS auth proxy is running.", { status: 200 });
  },
};

function handleAuth(url, env) {
  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/callback`;

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo,user");
  authorizeUrl.searchParams.set("state", state);

  const headers = new Headers({ Location: authorizeUrl.toString() });
  headers.append(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );

  return new Response(null, { status: 302, headers });
}

async function handleCallback(request, url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookieState = cookieHeader.match(/oauth_state=([^;]+)/)?.[1];

  if (!code || !state || state !== cookieState) {
    return new Response("Ongeldige of verlopen loginpoging. Ga terug naar /admin en probeer opnieuw.", {
      status: 400,
    });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return new Response(
      `Inloggen mislukt: ${tokenData.error_description || tokenData.error || "onbekende fout"}`,
      { status: 400 }
    );
  }

  const message = `authorization:github:success:${JSON.stringify({
    token: tokenData.access_token,
    provider: "github",
  })}`;

  const html = `<!doctype html>
<html>
  <body>
    <p>Inloggen gelukt. Dit venster kan gesloten worden.</p>
    <script>
      (function () {
        function receiveMessage(e) {
          window.opener.postMessage(${JSON.stringify(message)}, e.origin);
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
