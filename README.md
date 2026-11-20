# custom-alify
# custom-alify — static prototype

Marketing site for Alify: 26 static pages, plain HTML + Bootstrap 5 layout, GSAP for motion.
Everything is local (no build step). Open `index.html` or run `python3 -m http.server 8000`.

## Page map

| Page | Notes |
| --- | --- |
| `index.html` | Home: hero, clients, 9 services, about, projects, process, industries, why Alify, case highlight, testimonials, pricing, journal, FAQ |
| `about-us.html` | Story, pillars, stats, team, working style, reach, tools, testimonials |
| `services.html` | 9-service catalogue (homepage cards), journey, industries, pricing, FAQ |
| `web-development.html`, `brand-design.html`, `digital-growth.html`, `ecommerce.html` | Service detail template |
| `single-service.html` | Generic service detail driven by `?service=web-development\|wordpress\|shopify\|ui-ux\|seo\|digital-marketing\|content-writing\|logo-designing\|ai-automation` |
| `portfolio.html`, `single-project.html` | Work index (filter sidebar) + project template |
| `industries.html` | Six sectors, `?industry=technology\|ecommerce\|health\|finance\|education\|travel` deep-links a panel |
| `case-studies.html`, `single-case-study.html` | Case index (two dropdown filters) + case template |
| `blog.html`, `single-blog-post.html` | Journal archive (search + dropdown) + article |
| `pricing.html`, `process.html`, `faq.html`, `testimonials.html` | Supporting pages |
| `contact-us.html`, `lets-get-started.html`, `get-a-quote.html`, `book-a-call.html`, `thank-you.html` | Enquiry flow |
| `legal.html` | Privacy policy (`#privacy`) and terms (`#terms`) — footer links land here |
| `404.html` | Not found (noindex) |
| `work.html` | Redirect stub to `portfolio.html` (noindex) |

## CSS structure

* `variables.css`, `fonts.css`, `utility.css`, `buttons.css`, `arrow-buttons.css` — tokens and primitives.
* `style.css` — header, footer shell, drawers; `nav-menus.css` — desktop dropdowns + mobile accordion.
* `advanced-pages.css` — shared page blocks (home, about, industries, filter shell, global refinements). Loaded everywhere.
* `advanced-pages-editorial.css` — blog, article, journal, FAQ directory, testimonials.
* `advanced-pages-work.css` — portfolio, work cards, case studies, project galleries.
* `advanced-pages-services.css` — service templates, journey, process, pricing, quote/call/contact flows.
* `forms.css` (only on pages with forms or form components) and `legal.css` (legal page only).

The three `advanced-pages-*` files are split by selector ownership; a page loads only the groups whose class prefixes it uses, so adding a page means adding the matching `<link>`s.

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

* Background videos are lazy: `preload="none"` and the real `src` moves to `data-src`; `initLazyVideos()` swaps it
  in through an `IntersectionObserver` (250px margin). First paint no longer downloads the 45 MB of MP4s.
* Compress the originals once with ffmpeg before launch (sources stay in `assets/images/background-videos/`):

```bash
ffmpeg -i home-hero.mp4 -vf "scale=1280:-2" -an -c:v libx264 -crf 30 -preset slow -movflags +faststart home-hero-web.mp4
ffmpeg -i inner-hero.mp4 -vf "scale=1280:-2" -an -c:v libx264 -crf 30 -preset slow -movflags +faststart inner-hero-web.mp4
ffmpeg -i footer-cta.mp4 -vf "scale=1280:-2" -an -c:v libx264 -crf 30 -preset slow -movflags +faststart footer-cta-web.mp4
```

## Placeholders to replace before launch

* Phone number (`+92 300 123 4567`), social profile URLs and `hello@alify.studio`.
* Legal copy — reviewed by a lawyer for the operating jurisdiction.
* Project names, metrics and testimonials are illustrative.
