# NickKasmo.nl

Statische website voor `nickkasmo.nl`, gehost via GitHub Pages.

## Lokaal bekijken

Start een lokale server vanuit de projectmap:

```bash
python3 -m http.server 4173
```

Open daarna `http://localhost:4173`.

## GitHub Pages instellingen

Gebruik deze instellingen in GitHub:

- Repository: `bllthelabel/nickkasmo`
- Branch: `main`
- Folder: `/ (root)`
- Custom domain: `nickkasmo.nl`
- HTTPS: `Enforce HTTPS` aanzetten zodra GitHub dit toestaat

De `CNAME` file bewaart het custom domain bij nieuwe deploys.

## DNS voor nickkasmo.nl

Voor het hoofddomein staan deze A-records bij de DNS-provider:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Optioneel kan `www` als CNAME naar `bllthelabel.github.io` wijzen.

## Publiceren

Maak wijzigingen lokaal, controleer ze, commit en push naar `main`:

```bash
git status
git add .
git commit -m "Update NickKasmo website"
git push
```

GitHub Pages publiceert daarna automatisch de nieuwste versie.

## SEO en onderhoud

Bij nieuwe pagina's of blogposts:

- Voeg een duidelijke `<title>` en meta description toe.
- Voeg een canonical URL toe.
- Voeg Open Graph en Twitter Card tags toe.
- Voeg de pagina toe aan `sitemap.xml`.
- Gebruik logische headings: een `h1`, daarna `h2` en `h3`.
- Gebruik beschrijvende alt-teksten voor echte afbeeldingen.

Aanwezige SEO-bestanden:

- `robots.txt`
- `sitemap.xml`
- `CNAME`

## Veiligheid

Zet nooit API-keys, wachtwoorden, tokens of persoonlijke exports in deze repository. Alles in deze repo kan publiek zichtbaar zijn zodra de repository openbaar is.
