# Sahasram Online

Mobile-first storefront and owner-console prototype for Sahasram, built with HTML, CSS, browser JavaScript, and TypeScript contracts.

## Run locally

Run `npm run build`, then open `dist/index.html` through any static web server. The site has no build-time dependencies. `src/` contains the editable source; `dist/` is the generated static site and is not committed.

## Deploy

Every push to `main` publishes the storefront to GitHub Pages through `.github/workflows/pages.yml`. The workflow runs `npm run build:public`, which leaves out the owner console (`admin.html`, `styles.css`, `src/admin.js`) because it has no login yet.

All links are relative, so the site works at a sub-path such as `username.github.io/sahasram/` or on a custom domain.

## Storefront design

The storefront (`index.html`, `store.css`, `src/app.js`) follows the Sahasram design boards: the mobile web prototype and the shopper-storefront wireframes. The owner console (`admin.html`) still uses `styles.css`.

Photos load by name from `assets/products/` and `assets/home/`. Until a file exists, its slot shows a tonal placeholder in the garment's colour. See `assets/README.md` for the list of file names.

The anniversary offer (bar, hero slide, offer prices, bag discount) appears only while `endsAt` in `api.getOffer()` is in the future. After that the site switches to a plain free-shipping bar.

Routes: `#shop/<kurta-sets|sarees|kurtas|kids|anarkalis|new|window|handpicked|offers|all>`, `#shop/style/<anarkali|ajrakh|pin-tuck|kutch|embroidered|silk|kaftan>`, `#shop/occasion/<name>`, `#shop/price/<min>-<max>`, `#shop/size/<label>`, `#product/<id>`, `#search/<query>`, `#page/<key>`.

## Catalogue from BoutiqueOS

Products, prices, sizes, stock and photos come from the BoutiqueOS Storefront Feed (see the PRD "BoutiqueOS Storefront Feed for the Sahasram Website"). Nothing in this repo needs editing when stock changes.

- `tools/sync-catalog.mjs` fetches `/storefront/v1/manifest` and `/catalog` with the client ID and secret, validates them, and writes `data/catalog.json`, `data/manifest.json` and `data/site-config.json` into the build. It refuses to deploy when the feed fails validation, cannot be reached after three tries, or the product count falls by more than half.
- `.github/workflows/pages.yml` runs the sync on every push, by hand, on the BoutiqueOS `boutiqueos-catalog-changed` event, and every 10 minutes (deploying only when the catalogue version changed). A failed sync opens a `catalog-sync` issue and leaves the last good site live.
- `src/feed.js` maps feed products to the page code. Style and occasion menus are built from the feed's own values.
- Photos use the feed's renditions (`srcset`), focal point (crop), dominant colour and blurred placeholder.
- The bag and checkout check live stock with `/storefront/v1/availability` using the publishable key.

Settings (GitHub → Settings → Secrets and variables → Actions): secret `BOUTIQUEOS_CLIENT_SECRET`; variables `BOUTIQUEOS_BASE_URL`, `BOUTIQUEOS_CLIENT_ID`, `BOUTIQUEOS_PUBLISHABLE_KEY`. Until `BOUTIQUEOS_BASE_URL` is set, the site uses the demo catalogue in `src/demo-data.js`.

Local development: `npm run sync:sample` loads the BoutiqueOS sample responses (from `../../boutiqueERP-storefront/docs/storefront/samples`) into `data/`, then `npm run build`. Delete `data/` to go back to the demo catalogue. Checkout is still a preview: no payment is taken and no order is created.

## MVP implementation boundaries

- The customer-facing store includes category browsing, search, product details, size selection, bag, offer calculation, a checkout preview, appointment requests, customization, exhibitions, FAQs, and WhatsApp links.
- The owner console includes inventory visibility, stock counts, a quick-bill interaction, appointment queue, and summary reports.
- All seeded products are illustrative. Replace them with the flagged stock-sheet import before accepting orders.
- Store policies and privacy/returns content are clearly marked as drafts for Sharanya and legal review.
- Payment capture, OTP, GST invoice generation, shipping labels, account persistence, and WhatsApp templates require backend integrations.

## Useful API routes to implement

`GET /api/products`, `GET /api/products/:id`, `GET /api/categories`, `GET /api/offers/current`, `POST /api/appointments`, `POST /api/orders`, `GET /api/orders/:orderNumber`, `GET /api/admin/summary`, `PATCH /api/admin/products/:id/visibility`, and `POST /api/admin/sales/offline`.

