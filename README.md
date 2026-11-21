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

## Demo data and backend connection

The storefront ships with a 61-piece synthetic preview catalogue across kurta sets, kurtas, sarees, and kidswear, plus sample appointment and report data from `src/demo-data.js`. The added assortment is for browsing and search demonstrations; it is not a stock-sheet import and does not represent confirmed Sahasram inventory. Nothing here charges a payment method, sends a WhatsApp message, or creates an actual order.

Set `window.SAHASRAM_CONFIG = { API_BASE_URL: "https://your-api.example.com" }` before `src/api-client.js` loads to use the backend adapter. When an API base URL is present, read operations call the documented endpoints in `src/api-client.js`; requests include JSON and same-origin credentials. Write operations remain in demo mode until a backend endpoint is explicitly wired in the adapter.

`src/contracts.ts` defines the initial API shapes for products, stock, offers, appointments, orders, and report summaries. The contract is intentionally provider-neutral so payment, shipping, WhatsApp Business, and GST invoice vendors can be chosen later.

## MVP implementation boundaries

- The customer-facing store includes category browsing, search, product details, size selection, bag, offer calculation, a checkout preview, appointment requests, customization, exhibitions, FAQs, and WhatsApp links.
- The owner console includes inventory visibility, stock counts, a quick-bill interaction, appointment queue, and summary reports.
- All seeded products are illustrative. Replace them with the flagged stock-sheet import before accepting orders.
- Store policies and privacy/returns content are clearly marked as drafts for Sharanya and legal review.
- Payment capture, OTP, GST invoice generation, shipping labels, account persistence, and WhatsApp templates require backend integrations.

## Useful API routes to implement

`GET /api/products`, `GET /api/products/:id`, `GET /api/categories`, `GET /api/offers/current`, `POST /api/appointments`, `POST /api/orders`, `GET /api/orders/:orderNumber`, `GET /api/admin/summary`, `PATCH /api/admin/products/:id/visibility`, and `POST /api/admin/sales/offline`.

