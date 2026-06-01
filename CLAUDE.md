# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install Express CMS dependencies.
- `npm start` (alias for `node server.js`) — run the local Express CMS at `http://localhost:3000`. Public site at `/`, admin panel at `/admin`.
- No build step, no test suite, no linter. The site itself is hand-authored static HTML/CSS/JS.

The Express server requires `.env` with `SMTP_USER`, `SMTP_PASS`, and optionally `CONTACT_RECEIVER` (Gmail account used by `/api/contact`). It is only needed when working on the admin CMS locally — production does not use it.

## Architecture

The repo simultaneously supports **two deployment modes** that share the same HTML/CSS/JS. Understanding which mode owns which feature is critical before changing anything.

### 1. Production: static site (GitHub Pages + Netlify)

- The site is published from the repo root. `CNAME` points to `zampabridge.org`.
- `_config.yml` enables Jekyll with `permalink: pretty`, so navigation uses extensionless URLs (`/about`, `/blog`, `/episodes`, `/contact`). `_redirects` + `netlify.toml` provide the equivalent on Netlify, including a SPA-style fallback to `index.html`.
- All page content is static in the `.html` files. `script.js` only handles nav state and the mobile menu — the dynamic `loadLatestContent()` block is **intentionally commented out** under "BACKEND DISABLED". Do not re-enable it without restoring a backend.
- Blog is the one exception to "fully static": `blog.html` and `blog-post.html` fetch `blog-posts.json` at runtime and render cards/posts client-side. **`blog-posts.json` is the source of truth for blog content** — edit it directly to add or change posts; do not hand-edit blog HTML.
- The contact form on `contact.html` submits directly to **Formspree** (`https://formspree.io/f/mjgkpzvw`). It does not hit the Express `/api/contact` route.

### 2. Local CMS: Express server (`server.js`)

- `server.js` serves the same static files and adds an admin-only CMS at `/admin` (see `admin.html`).
- The CMS reads/writes `data/content.json` via `GET`/`POST /api/content`, uploads images to `public/images/uploads/` via `POST /api/upload` (Multer), and sends contact email via `POST /api/contact` (Nodemailer + Gmail).
- **`data/content.json` is not wired to the live site.** Only `admin.html` fetches `/api/content`. The public pages do not, so changes made in the admin panel are not visible on the deployed site. The schema (`journey`, `episodes`, `blog`) is a remnant of the previously dynamic homepage.

### 3. Netlify Functions (disabled)

`netlify/functions-disabled/` contains four serverless equivalents of the Express endpoints (`content.js`, `contact.js`, `upload.js`, `image.js`) that use `@netlify/blobs` for storage. They are **not deployed** — `netlify.toml` points at `netlify/functions/` which does not exist. To revive backend-driven content on Netlify, rename `functions-disabled` → `functions` and restore the fetch calls in `script.js`.

## When making changes

- Adding/editing blog posts: edit `blog-posts.json`. The `id` field is referenced by `blog-post.html?id=…`; keep it unique. Place images under `images/`.
- Adding pages: create `foo.html` at the root; link to it as `/foo` (Jekyll/Netlify resolve the pretty URL). Match the existing header/footer markup so nav-link active-state in `script.js` works.
- Header active state: `script.js` matches `link.getAttribute('href')` against `currentPath.split('/').pop()`. Pretty URLs like `/about` work because the trailing segment matches the `href`.
- Do not edit content in the admin panel and expect it to appear on the live site — the public site is static. Either restore the dynamic fetches or update the HTML/JSON directly.
- `.env`, `server.log`, and `node_modules/` should not be committed (no `.gitignore` exists currently, so be deliberate when staging).
