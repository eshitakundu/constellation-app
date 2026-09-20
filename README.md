# Your Constellation

A browser-only star art generator. Turn a name or phrase into a deterministic constellation, download a 1080 × 1350 portrait PNG, or share a link that recreates it.

## Run locally

```sh
python -m http.server 8080 --directory frontend
```

Open http://localhost:8080. There is no frontend build or backend dependency.

## Features

- Deterministic character-to-star mapping and minimum spanning tree connections.
- Native Canvas rendering with no external scripts, fonts, or runtime packages.
- Single-character and Unicode support, bounded input, and whitespace validation.
- Full-screen constellation reveals, portrait PNG exports, and share links using URL fragments.
- Two-person cosmic compatibility with repeatable scores and original quotes, explicitly framed as entertainment.
- Invitation links let a second person add their name to discover a shared sky.
- Responsive, scrollable layout; labelled controls, keyboard access, live status, reduced-motion support, and an animation toggle.
- Explanations, examples, FAQ, About/contact, Privacy, Terms, robots.txt, custom 404, and Cloudflare security headers.
- Animation pauses when the tab is hidden; a motion toggle and reduced-motion preferences are respected.

## Deployment and advertising

See [DEPLOYMENT.md](DEPLOYMENT.md) for Cloudflare Pages settings and the remaining owner steps for AdSense. Publish `frontend` with build command `exit 0` and framework preset None.

No advertising or analytics code is enabled. AdSense requires a live site, your account-specific details, appropriate consent integration, and Google's review. Approval is not guaranteed.

## Code

- `frontend/index.html`: generator and explanatory content.
- `frontend/constellation.js`: pure generation algorithm.
- `frontend/sketch.js`: full-screen Canvas reveals, downloads, and sharing.
- `frontend/compatibility.js`: symmetric name-based entertainment scores and quotes.
- `frontend/style.css`: responsive styling.
- `tests/constellation.test.cjs`: generator behavior checks.
- `backend/`: original FastAPI implementation retained for reference; not needed or published by the static deployment.

Run checks with `node --test tests/*.test.cjs`.

Patterns are decorative art, not astronomical charts, astrological readings, or unique identifiers.
