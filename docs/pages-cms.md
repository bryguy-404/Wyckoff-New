# Pages CMS editing guide

Repository: `bryguy-404/Wyckoff-New`  
Review branch: `codex/pages-cms-setup`  
Branch preview: https://codex-pages-cms-setup.wyckoff-new.pages.dev

This setup is for editing existing content. Nothing has been merged into `main`.
Pages CMS saves Git commits to the selected branch; Cloudflare builds that branch.
Keep `codex/pages-cms-setup` selected while reviewing. Saving on `main` after a future
approved merge would publish to the production site.

## Connect the repository, one step at a time

Complete one numbered step and check its result before moving to the next.

1. Open [Pages CMS](https://app.pagescms.org/) and sign in with your GitHub account.
   If already signed in, stay in that account. You should reach the repository list.
2. If **bryguy-404 / Wyckoff-New** is absent, use the option to install/configure the
   Pages CMS GitHub App. Choose the repository owner **bryguy-404**, select **Only
   select repositories**, and grant access to **Wyckoff-New**. The repository owner
   should complete GitHub's permission approval. If the repository is already
   listed, skip this step; there is no need to reinstall.
3. Open **Wyckoff-New** and select branch **codex/pages-cms-setup**. The existing
   `.pages.yml` on that branch supplies the configuration. Do not create a new
   configuration, switch to `main`, or replace the supplied YAML. If prompted to
   configure the repository, check the selected branch and refresh first.
4. Confirm the six editor entries below appear. Open **Home**, then the Hero group.
   The current headline should begin “The EBITDA you want next year”.
5. For a first trial, make one small copy change, save it, wait for the Cloudflare
   check on that commit to succeed, and reload the branch preview. Restore the
   original copy and save again. The save is a real commit on the selected branch.
6. Try a replacement image using an existing image field. Upload/select the image,
   save the content entry, and inspect both desktop and mobile preview. Restore
   the original selection afterward. Uploading a file alone does not select it in
   a page. Keep original image files so restoring a selection remains easy.
7. Review and approve the branch separately before any merge to `main`. Client
   access can be arranged after this review; no client invitations are sent by
   this setup. A developer should retain responsibility for publication scheduling,
   configuration, repository permissions, and production rollout.

If working through this with Codex, stop after each step and report what you see.
The [official quick start](https://pagescms.org/docs/quick-start/) describes the
GitHub App connection flow.

## Editable-content inventory

| Editor | Content you can change | Stored in |
| --- | --- | --- |
| Shared · business, header, footer & contact | Business name, shared portrait and alt text, LinkedIn link, default social image and alt text; header/footer navigation labels and destinations; mobile menu copy; footer tagline; contact invitation, field labels, submit label, privacy note, and browser status messages | `src/data/pages/shared.json` |
| Home | Search title/description, hero headline lines, supporting text, CTA link, fallback photo/video poster; moving tagline; premise; city photo and caption; client logos/alt text; inflection introduction; experience statistics; biography/facts; background photo and growth statement; ten existing recommendations | `src/data/pages/home.json` |
| About | Search title/description; hero and experience proof; perspective and principle; twenty industries; leadership copy; eight expectations; speaking photo/alt text, keynote link, university logos; existing 2023–2025 result values, labels and descriptions | `src/data/pages/about.json` |
| Inflection Points | Search title/description, hero/index/table copy, CTA labels; all eight titles, challenges and needs (also update Home); all detailed strategy paragraphs, service descriptions, lists and callouts; accordion labels and return link | `src/data/pages/inflectionPoints.json` |
| Insights · listing & article labels | Listing search metadata, heading, count/empty-state labels, featured/card links' text, article back link, byline/update labels, related-reading heading/link | `src/data/pages/insights.json` |
| Insights · existing articles | All 21 existing articles: title, description, author, categories, tags, featured image/alt text, Markdown body text, inline images and links | Existing `src/content/insights/*.md` |

Article URLs derive from their unchanged filenames. Cards, the featured article,
related reading, social tags, and article structured data read the same article
metadata. The listing continues to feature the newest eligible article.

The shared portrait is used on Home and About. The contact invitation is shared
by Home, Inflection Points, and article pages. Navigation links are shared by
desktop/mobile headers and footers. The copyright year remains automatic.

## What stays protected

- Creation, renaming, and deletion are disabled on **every content file and the
  article collection** using `operations: {create: false, rename: false, delete: false}`.
- Regular pages use fixed named slots, not repeatable page-builder lists. Clients
  cannot add, remove, reorder, or change the type of page sections or strategy blocks.
- Publication and legacy keys are omitted from the editor: `publishedAt`,
  `updatedAt`, `draft`, `featured`, `featuredImageWidth`, `featuredImageHeight`,
  `legacyId`, `legacyPath`, and `sourceUrl`. `settings.content.merge: true`
  preserves these keys when managed fields are saved. Do not turn merge off.
- Inflection anchors, result years/IDs, layout flags, dimensions, component styles,
  brand masks/favicon, hero video, source code, redirect rules, and workflows are
  outside the content forms. The settings screen is hidden.
- Contact endpoint, field names/types, revenue options, validation, honeypot,
  delivery recipients, and Resend environment variables remain developer-managed.
  The endpoint is still `/api/contact`.

These are CMS editor restrictions, not GitHub permission restrictions. Someone
with repository write/admin access can still edit code through GitHub. The image
library supports uploads for replacements; Pages CMS's content `operations` flags
do not lock media-library file operations. Keep existing media files and select
replacement uploads through the content fields instead of renaming/deleting
shared assets. This limitation is separate from the disabled page/article operations.

## Images and links

Images are saved beneath `public/images`; the CMS writes public `/images/...`
paths. It accepts JPG, JPEG, PNG, WebP, SVG, and AVIF. Select/upload within image
fields; keep original assets when replacing a reference. No external image-host
account is required. Use lowercase filenames without spaces (upload names are
normalized by the CMS).

The build reads actual image dimensions with Astro's image metadata utility.
Replacing an image never requires editing hidden width/height fields. Missing or
invalid image paths fail the build rather than silently deploying broken images.
Existing crop, object-fit, and responsive CSS remain in place:

| Placement | Best replacement shape / behavior |
| --- | --- |
| Shared portrait | Square or near-square, with face centered; the existing portrait frame crops it |
| Home hero fallback / video poster | Wide image, roughly 3:2 or wider; covers the full hero. Video still plays for visitors without reduced motion |
| City / growth-statement background | Wide landscape with room to crop at mobile sizes |
| Speaking photo | Landscape; displayed at its natural ratio inside the existing width limit |
| Client / university logos | Transparent asset with comfortable internal margins; natural proportions retained |
| Insight feature | Landscape, preferably 3:2; cards crop to their existing 16:10 frame, while article features preserve their natural proportions and existing desktop limit |
| Article inline images | Selected in the rich-text editor; constrained by the existing article body styles |
| Default social share image | Prefer 1200×630; output metadata follows the actual replacement dimensions |

Link fields accept full `https://...` URLs, site paths such as `/about`, anchors
such as `#contact`, and `mailto:`/`tel:` destinations. Internal navigation/CTA
changes do not create new site routes. Keep headline lengths near the originals;
fixed heading-line fields preserve the design's typography.

## Scheduled Insights

`src/lib/insights.ts`, `src/content.config.ts`, the article route, and
`.github/workflows/publish-scheduled-insights.yml` retain their existing behavior:

- Production includes an article only when `draft` is false and `publishedAt` is
  at or before the build time.
- The approved date workflow triggers the existing Cloudflare **main-branch**
  deploy hook. Its schedule and secret were not changed.
- `INSIGHTS_PREVIEW=true` remains a developer-only build override for drafts and
  future articles. Do not set it in production. The review preview uses normal
  publication gates unless Cloudflare already supplies that override.
- Editing a future article does not publish it early. New schedules, publication
  dates, or new articles require a developer change and review.

## Developer verification and recovery

```sh
npm ci
npx astro check
npm run build
npm run check:cms
npm run test:cms
```

`check:cms` checks the configuration/content contract and production article gates.
`test:cms` backs up content to a printed temporary directory, replaces every
editable page text/link/image and every existing article's main fields/body,
builds with previews enabled, verifies rendered markers/dimensions, and restores
all source files byte-for-byte in `finally`. It then rebuilds with normal
publication gates. Run it with no concurrent CMS edits. If interrupted by a hard
process kill, restore files from the printed backup directory before committing.
The fixture upload is removed automatically in normal completion/failure paths.

For local browser checks, start `npx astro dev --background`, then use the URL it
prints (the port can vary). Use `npx astro dev status`, `logs`, and `stop` to manage
it. Cloudflare is required to exercise the contact Pages Function.

Normal CMS saves are recoverable through Git history. Restore the prior content
commit or image reference on the review branch and let Cloudflare rebuild. Do not
force-push or reset `main` to undo a trial edit.

Initial validation: all 35 generated HTML routes (20 pages plus 15 redirects)
retained baseline visible text; styles and non-form client scripts are unchanged.
All 647 regular-page editor fields passed content checks; replacement tests
verified 612 text/link fields, 31 image fields, four numeric fields, and all 21
article bodies/main fields/images. The three conditional listing labels are
connected in source. On September 22, 2026, 16 articles are publishable and five
remain scheduled. All test content was restored. The root configuration was also
validated against the current upstream Pages CMS configuration schema.

Authenticated Home editing was verified on September 22, 2026: Pages CMS commit
`260427e` saved a temporary Hero kicker change, and Cloudflare deployed and rendered
it successfully. The test wording was then restored on the setup branch. Pages
CMS removes blank optional fields when saving; the statistics renderer and checks
accept omitted suffixes, and numeric statistics remain required. Article tests
simulate the documented merge behavior; a hosted article-editor save has not
been performed.

Configuration references: [fields](https://pagescms.org/docs/configuration/content/fields/),
[operations](https://pagescms.org/docs/configuration/content/operations/),
[merge settings](https://pagescms.org/docs/configuration/settings/),
[media](https://pagescms.org/docs/configuration/media/).
