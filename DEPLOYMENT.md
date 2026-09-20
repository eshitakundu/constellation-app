# Cloudflare Pages and AdSense

## Deploy the site

1. In Cloudflare, open **Workers & Pages**, create a **Pages** project, and connect `eshitakundu/constellation-app` on GitHub.
2. Select the `main` production branch and use:
   - Framework preset: **None**
   - Root directory: leave empty (repository root)
   - Build command: `exit 0`
   - Build output directory: `frontend`
3. Deploy. Open the supplied HTTPS `pages.dev` address and try a name, a single letter, a PNG download, and a shared link.
4. Check About, Privacy, Terms, and a nonexistent URL (which should show the custom 404 page).
5. Optionally add your domain from the project's Custom domains settings. Future pushes to `main` trigger deployments when Git integration is configured.

No Python server, Node build, API URL, environment variables, or secrets are needed. Only `frontend/` is published. The old Python backend is retained as a reference and is not deployed.

Reference: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/

## After the final public URL is known

- Check the published mobile and desktop site, including PNG downloads and clipboard behavior over HTTPS.
- Add canonical URLs and `og:url` to each HTML page using the final preferred domain. Add a sitemap containing the home, about, privacy, and terms URLs, and reference it in `robots.txt`. These are intentionally not filled with a guessed domain.
- Confirm the GitHub contact routes on About are suitable. A dedicated contact address or form is a useful later addition if you want private enquiries.
- Keep the privacy notice accurate if you enable Cloudflare analytics, other tracking, or additional hosting services.

## AdSense setup — owner account and live site required

The site is prepared for review, **not guaranteed approval**. Useful content, a working tool, and policy pages do not guarantee that Google will accept it. No advertising code, fake publisher ID, or placeholder ads.txt entry is shipped.

1. Publish the working site first. Create or use your own AdSense account and add the final website URL under Sites.
2. Complete Google's account tasks. For site ownership verification, use the exact verification method supplied by AdSense. If offered, its HTML meta tag can be placed in the home page's `<head>` without loading advertising JavaScript. Never commit account credentials.
3. If AdSense provides an ads.txt record, create `frontend/ads.txt` containing the **exact record from your account**. Confirm it is reachable at `https://YOUR-DOMAIN/ads.txt`. Do not use an invented publisher ID.
4. Before enabling advertising, update Privacy with the actual Google advertising data and cookie practices, links to Google's policies and user controls, and your consent choices. Do not leave the current “no advertising scripts” wording in place after enabling ads.
5. Configure a Google-certified consent management platform for EEA, UK, and Switzerland traffic, as required by Google. Google's Privacy & messaging tools are one route. Configure any other privacy messages required for your audience. A cosmetic cookie banner is not a replacement for consent integration.
6. Add the exact AdSense script and unit code from your account only after privacy and consent integration are ready. Prefer a clearly labelled **Advertisement** unit between the explanatory content sections. Keep ads away from Create, Download, Share, the canvas, and navigation. Do not place ads over the interactive experience or on the error page.
7. Request review and address any feedback in AdSense. Never click your own ads or ask visitors to click them. Check the live mobile placement and consent behavior before enabling broad ad delivery.

Do not pass names, entered phrases, or share fragments to advertising or analytics services. Review any new third-party script because it can access the page URL and its fragment.

Official references:

- Publisher policies: https://support.google.com/adsense/answer/10502938
- Site review status: https://support.google.com/adsense/answer/12170222
- ads.txt: https://support.google.com/adsense/answer/7532444
- Certified CMP requirement: https://support.google.com/adsense/answer/13554020

## Local verification

Run `python -m http.server 8080 --directory frontend`, then visit `http://localhost:8080`.
Run `node --test tests/constellation.test.cjs` for deterministic generation, Unicode, input limits, and connected-tree checks.
