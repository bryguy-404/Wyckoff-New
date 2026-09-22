# Wyckoff Consulting — Marketing Site

Static Astro site for wyckoffconsulting.com, built for Cloudflare Pages.

- **Frozen design source:** `design/index.html` — do not edit; it is the visual source of truth.
- **Stack:** Astro (static output, strict TypeScript), Tailwind CSS 4 (Vite plugin), MDX.
- Design tokens live in `src/lib/theme.config.ts` and as CSS custom properties in `src/styles/global.css`. Tailwind is imported **without preflight** on purpose — the design relies on browser default margins.

## Commands

| Command           | Action                                     |
| :---------------- | :----------------------------------------- |
| `npm install`     | Install dependencies                       |
| `npm run dev`     | Dev server at `localhost:4321`             |
| `npm run build`   | Production build to `./dist/`              |
| `npm run preview` | Preview the production build locally       |
| `npx astro check` | Type-check the project                     |

## Deploying to Cloudflare Pages

| Setting                | Value           |
| :--------------------- | :-------------- |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | *(repo root)*   |

No Cloudflare adapter or Wrangler config is needed — the site is fully static.

### Scheduled Insights

Future Insights are stored with `draft: false` and a future `publishedAt` date.
The production build excludes them until that date arrives. Because the site is
static, `.github/workflows/publish-scheduled-insights.yml` triggers a fresh
Cloudflare Pages build on each approved publication date.

The workflow requires one GitHub Actions repository secret:

| Secret | Value |
| :----- | :---- |
| `CLOUDFLARE_DEPLOY_HOOK_URL` | A Cloudflare Pages deploy hook for the `main` branch |

Create the hook in Cloudflare under **Workers & Pages → the Pages project →
Settings → Builds → Deploy Hooks**. Treat the hook URL as a password and never
commit it to the repository.

### Contact form

The contact form posts to `/api/contact`, implemented as a Cloudflare Pages
Function in `functions/api/contact.ts`. It sends mail through the Resend REST
API via native `fetch`. Set these environment variables in the Cloudflare Pages
dashboard (Settings → Environment variables, Production **and** Preview):

| Variable            | Purpose                                                    |
| :------------------ | :--------------------------------------------------------- |
| `RESEND_API_KEY`    | Resend API key                                             |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `Wyckoff <hello@wyckoffconsulting.com>` |
| `CONTACT_TO_EMAIL`  | Comma-separated recipient inboxes (up to 50)               |

Until these are set, the form returns "The contact form is not configured yet."

Note: Pages Functions only run on Cloudflare — `npm run preview` serves the
static site without the `/api/contact` endpoint.

## Pages CMS

The root `.pages.yml` connects six existing-content editors to the rendered site.
See [the Pages CMS setup and editing guide](docs/pages-cms.md) for connection steps,
the complete content inventory, protected publishing settings, image guidance,
verification commands, and recovery. After the setup's production deployment,
select `main` in Pages CMS. Content saves publish when Cloudflare's build succeeds;
use a separate review branch for temporary tests.
