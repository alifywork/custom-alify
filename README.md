# custom-alify
# custom-alify — static prototype

Marketing site for Alify: 34 static pages, plain HTML + Bootstrap 5 layout, GSAP for motion.
Everything is local (no build step). Open `index.html` or run `python3 -m http.server 8000`.

## Page map

| Page | Notes |
| --- | --- |
| `index.html` | Home: hero, clients, 9 services, about, projects, process, industries, why Alify, case highlight, testimonials, pricing, journal, FAQ |
| `about-us.html` | Story, pillars, stats, team, working style, reach, tools, testimonials |
| `services.html` | 9-service catalogue (homepage cards), journey, industries, pricing, FAQ |
| `web-development.html` | Flagship web development service (bespoke copy) |
| `service-wordpress.html`, `service-shopify.html`, `service-ui-ux.html`, `service-seo.html`, `service-digital-marketing.html`, `service-content-writing.html`, `service-logo-designing.html`, `service-ai-automation.html` | Static service detail pages (one per catalogue service) |
| `templates/single-service.html` | Off-site service template (`noindex`, not linked, not in the sitemap); personalises through `?service=…`. Asset paths are `../`-prefixed so it only works inside `templates/` |
| `portfolio.html`, `single-project.html` | Work index (filter sidebar) + project template |
| `industries.html` | Six sectors: bento grid, challenges/solutions switcher (`?industry=technology\|ecommerce\|health\|finance\|education\|travel` deep-links a panel), proof, stats |
| `industry-technology.html`, `industry-ecommerce.html`, `industry-health.html`, `industry-finance.html`, `industry-education.html`, `industry-travel.html` | Industry detail pages (one per sector): sector overview, what we build, proof, reviews slider, FAQ, related services. Share the service-page shell, CSS and JSON-LD pattern |
| `case-studies.html`, `single-case-study.html` | Case index (two dropdown filters) + case template |
| `blog.html`, `single-blog-post.html` | Journal archive (search + dropdown) + article |
| `pricing.html`, `process.html`, `faq.html`, `testimonials.html` | Supporting pages |
| `contact-us.html`, `lets-get-started.html`, `get-a-quote.html`, `book-a-call.html`, `thank-you.html` | Enquiry flow |
| `legal.html` | Privacy policy (`#privacy`) and terms (`#terms`) — footer links land here |
| `404.html` | Not found (noindex) |
| `work.html` | Redirect stub to `portfolio.html` (noindex) |
| `brand-design.html` | Redirect stub to `service-logo-designing.html` (noindex, merged into the identity page) |
| `digital-growth.html` | Redirect stub to `service-seo.html` (noindex, merged into SEO + marketing) |
| `ecommerce.html` | Redirect stub to `service-shopify.html` (noindex, merged into Shopify) |
| `robots.txt` | Crawl rules; disallows the stubs, thank-you, 404 and `templates/`, points at the sitemap |
| `sitemap.xml` | 34 indexable URLs (stubs, `thank-you`, `404` and `templates/` excluded) |

## CSS structure

* `variables.css`, `fonts.css`, `utility.css`, `buttons.css`, `arrow-buttons.css` — tokens and primitives.
* `style.css` — header, footer shell, drawers; `nav-menus.css` — desktop dropdowns + mobile accordion.
* `advanced-pages.css` — shared page blocks (home, about, industries, filter shell, global refinements). Loaded everywhere.
* `advanced-pages-editorial.css` — blog, article, journal, FAQ directory, testimonials.
* `advanced-pages-work.css` — portfolio, work cards, case studies, project galleries.
* `advanced-pages-services.css` — service templates, journey, process, pricing, quote/call/contact flows.
* `forms.css` (only on pages with forms or form components) and `legal.css` (legal page only).
* `responsive.css` — loaded **last on every page**: one spacing/width scale for all sections
  (72/54/42/36px vertical rhythm at 991/767/575/400px, container gutters, hero heights,
  section-head wrapping, card gaps, table scrolling, mobile form buttons, FAB safe areas).
  It only normalises layout values; component skins stay in their own files.

The three `advanced-pages-*` files are split by selector ownership; a page loads only the groups whose class prefixes it uses, so adding a page means adding the matching `<link>`s.

## JavaScript modules

`assets/js/main.js` (≈35 KB) holds the shared shell: hero videos, lazy loading, header, nav dropdowns, drawers,
active nav, scroll reveals, counters, forms, the service quote slider (`[data-quote-slider]`,
one review per view with arrow keys and a live counter), the floating scroll-to-top (`#backToTop`) and
scroll-to-bottom (`#scrollToBottom`) controls, filters shared by several pages.
Both floating controls share the `.back-to-top` skin; the down variant adds `.back-to-top--down`
(down arrow shows in the first 200px of scroll, up arrow after 400px, never both at once).

Page-specific behaviour lives in `assets/js/modules/` and is only loaded where its hooks exist:

| Module | Loaded on | Hooks |
| --- | --- | --- |
| `forms-flow.js` | get-a-quote, book-a-call | `data-quote-wizard`, `data-call-calendar` |
| `editorial.js` | blog, single-blog-post, faq, testimonials | `data-blog-archive`, `data-faq-directory`, `data-review-archive`, article TOC/share |
| `work-grid.js` | portfolio, case-studies, single-project, single-case-study, testimonials | `data-portfolio-grid`, `data-case-filters`, `data-gallery`, `data-video-modal` |
| `sliders.js` | home, about, services | `data-service-slider`, `data-case-highlight`, `data-testimonial-track`, `data-featured-project` |
| `service-detail.js` | `templates/single-service.html` | `?service=` personalisation |

## Motion

`initSectionReveals()` (main.js) animates **every top-level `<section>` on every page** as it scrolls
into view: the section's blocks fade up 26px with a 0.07s stagger, card grids animate card by card,
and the hero (`.home-hero` / `.inner-hero`) runs an entrance timeline on load. Each section uses one
GSAP timeline with a ScrollTrigger that fires `once`.

Guards worth knowing before editing markup:

* Nothing is hidden in CSS — if GSAP fails to load, every section is simply visible. Transforms are
  cleared after each timeline so `position: sticky` cards keep working.
* Targets containing sticky elements (`.featured-project-card`, `.filter-shell__side`) and
  module-managed nodes (`[data-case-highlight]`, `[data-testimonial-track]`, `[data-service-slider]`,
  `[data-gallery]`, `[data-video-modal]`) are skipped.
* `prefers-reduced-motion: reduce` disables the whole routine; add `data-no-anim` to a section (or
  `data-no-section-anim` to `<html>`) to opt out locally or page-wide.

## Forms

Contact, book-a-call, get-a-quote and let's-get-started post through `initAjaxForms()`; the blog newsletter uses
`initForms()`. With no endpoint configured they run in preview mode: fields are validated, the button shows a
sending state, and the submission is stored in `localStorage` under `alify:submissions` (last 25) before the
honest "no mail server connected" panel appears.

To connect a real backend, add `data-endpoint="https://…"` to the `<form>` (or set `action` to a non-`#` URL).
The handler `POST`s `FormData` with `Accept: application/json` and expects any 2xx response.

## SEO

Every page carries a canonical URL, Open Graph + Twitter card tags and a JSON-LD `@graph`
(Organization, WebSite, WebPage or BlogPosting, BreadcrumbList). The host is hard-coded as
`https://alify.studio` in the markup — change it in one place per page when the production domain is known.
Social preview image: `assets/images/social/og-default.png` (1200×630).

## Performance

* Background videos are already compressed (1280px wide, no audio, CRF 30, `+faststart`). The whole
  `assets/images/background-videos/` folder is 4.1 MB, down from 46 MB:

| File | Size |
| --- | --- |
| `home-hero.mp4` | 886 KB |
| `inner-hero.mp4` | 1.29 MB |
| `footer-cta.mp4` | 2.0 MB |

* Every video has a poster frame (`home-hero-poster.jpg` 39 KB, `inner-hero-poster.jpg` 10 KB,
  `footer-cta-poster.jpg` 45 KB) so the first paint shows artwork instead of black.
* Videos stay lazy anyway: `preload="none"`, the real `src` moves to `data-src`, and `initLazyVideos()`
  swaps it in through an `IntersectionObserver` (250px margin).
* Re-encode commands (sources stay in `assets/images/background-videos/`):

```bash
ffmpeg -i IN.mp4 -vf "scale=1280:-2" -an -c:v libx264 -crf 30 -preset medium -movflags +faststart -y OUT.mp4
ffmpeg -ss 1 -i OUT.mp4 -frames:v 1 -q:v 4 -y OUT-poster.jpg
```

## Icons

All icons come from the supplied brand mark (navy circle `#0F3473`, white triangle):

| File | Use |
| --- | --- |
| `favicon.ico` | 16/32/48 multi-size fallback for `/favicon.ico` |
| `favicon-32x32.png` | browser tabs |
| `favicon-192x192.png` | Android home screen / PWA |
| `apple-touch-icon.png` | 180×180, round mark flattened onto navy `#0F3473` (iOS masks transparency to black) |
| `favicon-512x512.png` | store listings, docs |

The mark is the white hollow triangle inside a navy `#0F3473` circle, transparent outside the circle
with a 2–3% margin so browser chrome never clips it. Re-generate from the source (625×625 PNG) with
PIL: crop to the circle's alpha bounding box, compose on a transparent square at 97% (98% for the
32px), downscale with LANCZOS, and keep the 180px touch icon composited on navy. Icon links carry
`?v=2` so returning visitors drop the previous cached favicon.

## Placeholders to replace before launch

* Phone number (`+92 300 123 4567`), social profile URLs and `hello@alify.studio`.
* Legal copy — reviewed by a lawyer for the operating jurisdiction.
* Project names, metrics and testimonials are illustrative stand-ins — swap in real client work before publishing.
* Forms run in preview mode until `data-endpoint` is set (see **Forms**); only then will a submission reach a mailbox.
