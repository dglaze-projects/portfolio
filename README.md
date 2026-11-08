# deannaglaze.com

Portfolio site for Deanna Glaze. Built with [Astro](https://astro.build),
styled with Newsreader and Inter, deployed on Vercel. Static pages with a server-backed contact form. Small client scripts handle project selection and contact-form feedback.

## Quick start

```bash
npm install     # once
npm run dev     # local dev server at http://localhost:4321
npm run build   # production build into dist/
npm run preview # preview the production build locally
```

## Project structure

```
├── public/                  # served as-is at the site root
│   ├── favicon.svg
│   └── images/              # all site images (see images/IMAGES-TODO.md)
├── src/
│   ├── styles/              # design system (tokens → theme → global)
│   ├── data/site.ts         # site name, nav, social links — edit once
│   ├── content/work/        # ★ case studies live here as Markdown
│   ├── components/          # header, footer, hero, cards, CTA
│   ├── layouts/             # page shell + case study template
│   └── pages/               # one file per route
├── DESIGN-SYSTEM.md         # how the token system works + how to retheme
└── astro.config.mjs
```

## Everyday tasks

### Add or edit a case study

Create/edit a Markdown file in `src/content/work/`. The filename is the URL
(`vp.md` → `/work/vp` — these match the old Squarespace slugs on purpose).
Frontmatter:

```yaml
---
title: 'Case study title'
tagline: 'One-sentence summary shown on cards and under the title.'
client: 'Company name'
role: 'Your role'
skills: [Design strategy, User research]
order: 3          # position on the Work page (lower = first)
cover: /images/work/example-cover.png   # optional
coverAlt: 'Description of the cover image'
draft: false      # true hides it from the site
---

## Section heading

Body copy in plain Markdown…
```

That's it — the Work index, the page itself, and navigation all update
automatically.

### Update nav / social links / site title

Everything lives in `src/data/site.ts`.

### Change colors, fonts, spacing

See `DESIGN-SYSTEM.md`. Short version: semantic tokens in
`src/styles/theme.css` control the look; you rarely need to touch anything
else.

### Replace placeholder images

See `public/images/IMAGES-TODO.md` — it lists every placeholder and the
original Squarespace CDN URL to download before the subscription ends.

## Deploying to Vercel

1. Push this folder to a Git repository (GitHub is easiest):
   ```bash
   git init && git add -A && git commit -m "Initial site"
   ```
   Then create a repo on github.com and follow its "push an existing
   repository" instructions.
2. In [vercel.com](https://vercel.com) → **Add New → Project**, import the
   repo. Vercel auto-detects Astro — accept the defaults and deploy. Every
   `git push` after that deploys automatically, with preview URLs for
   branches.

### Pointing deannaglaze.com at Vercel

1. In the Vercel project → **Settings → Domains**, add `deannaglaze.com`
   (and `www.deannaglaze.com`). Vercel shows you the DNS records it needs.
2. Where you make the DNS change depends on where the domain is registered
   (check Squarespace → Settings → Domains). If the domain is **registered
   through Squarespace**, either update its DNS records to Vercel's values or
   transfer the domain out to a registrar you prefer. If it's registered
   elsewhere and just pointed at Squarespace, update the A/CNAME records at
   that registrar to Vercel's values.
3. Wait for DNS to propagate (minutes to a few hours). Verify the new site is
   live, then cancel the Squarespace subscription — **after** downloading all
   images per `IMAGES-TODO.md`.

### Old URLs

Page paths were kept identical to the Squarespace site (`/work/vp`,
`/designresources`, …) so existing links and search engine results keep
working without redirects.

## November 2026 redesign launch

The reviewed redesign now uses the original public routes: `/`, `/about`, `/contact`, `/work`, and `/work/<slug>`. The contact endpoint at `/api/contact` is unchanged, including Resend delivery, validation, origin checks, and its honeypot. Keep `RESEND_API_KEY` configured in the existing Vercel project. Contact success and error pages support form submissions without JavaScript; the enhanced form preserves input after an error.

Shared navigation and metadata live in `PortfolioHeader.astro`, `PortfolioFooter.astro`, and `PageHead.astro`. The case-study template is `CaseStudyLayout.astro`. Case-study content remains in `src/content/work/`. Original-project thumbnail crops can be rebuilt with `node scripts/build-project-previews.mjs`.

Run `npm run build` followed by `node scripts/check-launch.mjs` before deployment. The check covers generated page links, local assets, metadata, and mocked contact delivery paths; it does not send email.

The pre-launch source and design experiments are saved locally in ignored `design-archive/`. The previous production deployment is also recoverable through Vercel. Production source before the redesign is commit `853677945111f869faedc2b5c8f131fd49679ee9`. Revert the launch commit through Git to restore the previous version, or use Vercel's rollback control for an immediate rollback.

### Password-protected Redshift Bio case study

`/work/redshift-bio` is rendered on request and does not emit a static case-study page. Its images are served only by `/api/redshift/[image]` after checking the same signed access cookie. Responses use `private, no-store` and `noindex`; the page is excluded from the sitemap. Access lasts eight hours, with a “Lock this case study” action to clear the browser cookie. Do not put these images under `public/` or route them through Astro's public image optimizer.

Set `REDSHIFT_ACCESS_CONFIG` in the existing Vercel project (Production and Preview). It is server-only JSON with a 16-byte hex `salt`, a 64-byte hex scrypt `hash`, and a random 32-byte hex `secret`. The local `.env` has the development value and is ignored by Git. Changing the password hash or secret invalidates existing access cookies. Never commit this setting or use a `PUBLIC_` prefix. Without valid configuration, access fails closed.

Checks: `node scripts/check-redshift.mjs`, `npm run build`, `node scripts/check-launch.mjs`. The endpoint includes best-effort per-instance attempt throttling; it is not a distributed rate limiter. Older project images already exist in the public repository, and the Squarespace original remains separately accessible: this gate protects access through the new site, not those earlier copies.
