import {api} from "./api-client.js";

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = (n) => new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 0}).format(n);
const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const WA = "917337221100";
const wa = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ } },
};
const CART = "sahasram-cart-v1", WISH = "sahasram-wishes-v1";
const state = {products: [], offer: null, offerActive: false, cart: store.get(CART, []), wishes: store.get(WISH, []), selectedSize: "", callIds: []};
const SVG_HEART = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9-9a4.6 4.6 0 0 1 9-2 4.6 4.6 0 0 1 9 2c-2 4.6-9 9-9 9z"/></svg>`;
const byId = (id) => state.products.find(p => p.id === id);
const has = (p, kind) => (p.labels || []).some(l => l.kind === kind);
const available = (p) => p.sizes.filter(s => s.available > 0);

/* ---------- product presentation ---------- */
const photo = (p, i = 0, alt = p.name, eager = false) =>
  `<span class="ph" style="--sw:${esc(p.swatch || "#CDB79A")}">${p.imageUrls?.[i] ? `<img src="${esc(p.imageUrls[i])}" alt="${esc(alt)}" ${eager ? "" : `loading="lazy"`} />` : ""}</span>`;
function badge(p) {
  const l = (p.labels || []).find(x => ["handpicked", "bestseller", "new", "last_piece"].includes(x.kind));
  if (!l) return "";
  const text = l.kind === "new" ? "New" : l.kind === "last_piece" ? "Last piece" : l.text;
  return `<span class="badge">${esc(text)}</span>`;
}
function stockNote(p) {
  const open = available(p);
  if (!open.length) return "Sold out";
  if (has(p, "last_piece")) return open.length === 1 && p.sizes.length > 1 ? `Last piece · ${open[0].label.replace(" / ", "/")}` : "Last piece";
  if (p.sizes.length > 1 && open.length === 1) return `Only ${open[0].label.replace(" / ", "/")} left`;
  return "";
}
const offerPrice = (p) => Math.round(p.price * 0.8);
const offerNote = (p) => state.offerActive ? `${money(offerPrice(p))} with anniversary offer` : p.price >= 2999 ? "Free shipping" : "";
const subLine = (p) => p.category === p.subCategory ? p.category : `${p.category} · ${p.subCategory}`;
function priceHTML(p) {
  return `<div class="price"><b>${money(p.price)}</b>${p.mrp > p.price ? `<del>${money(p.mrp)}</del><span class="off">${Math.round((1 - p.price / p.mrp) * 100)}% off</span>` : ""}</div>`;
}
function card(p, {sub = true, offer = true} = {}) {
  const saved = state.wishes.includes(p.id);
  const stock = stockNote(p), on = offer ? offerNote(p) : "";
  return `<article class="card">
    <div class="card-media"><a href="#product/${esc(p.id)}" aria-label="${esc(p.name)}">${photo(p)}</a>${badge(p)}
      <button class="heart ${saved ? "saved" : ""}" data-action="wish" data-id="${esc(p.id)}" aria-pressed="${saved}" aria-label="${saved ? "Remove from" : "Save to"} wishlist: ${esc(p.name)}">${SVG_HEART}</button></div>
    ${sub ? `<span class="card-sub">${esc(subLine(p))}</span>` : ""}
    <a class="card-name" href="#product/${esc(p.id)}">${esc(p.name)}</a>
    ${priceHTML(p)}
    ${on ? `<span class="card-offer">${esc(on)}</span>` : ""}
    ${stock ? `<span class="card-stock">${esc(stock)}</span>` : ""}
  </article>`;
}

/* ---------- collections ---------- */
const CATS = {"kurta-sets": "Kurta Sets", "kurtas": "Kurtas", "sarees": "Sarees", "kids": "Kids"};
const STYLE_NAMES = {anarkali: "Anarkali sets", ajrakh: "Block print & ajrakh", "pin-tuck": "Pin-tuck & pleats", kutch: "Mirror & Kutch work", embroidered: "Embroidered sets", silk: "Silk & occasion", kaftan: "Kaftans & dresses", kids: "Kids’ ethnic sets"};
function collection(path) {
  const [kind, ...rest] = path.split("/");
  const arg = rest.join("/");
  const all = state.products;
  if (CATS[kind]) return {title: CATS[kind], crumb: CATS[kind], items: all.filter(p => p.category === CATS[kind])};
  switch (kind) {
    case "anarkalis": return {title: "Anarkalis", crumb: "Anarkalis", items: all.filter(p => p.subCategory === "Anarkalis" || (p.styles || []).includes("anarkali"))};
    case "new": return {title: "New Arrivals", crumb: "New Arrivals", intro: "Fresh from our latest buying trip.", items: [...all].filter(p => has(p, "new")).sort((a, b) => b.createdAt.localeCompare(a.createdAt))};
    case "window": return {title: "In Our Window", crumb: "In our window", intro: "On display at the studio this week.", items: all.filter(p => has(p, "window"))};
    case "handpicked": return {title: "Handpicked by Sharanya", crumb: "Handpicked", intro: "The founder’s favourites from the current collection.", items: all.filter(p => has(p, "handpicked"))};
    case "offers": return {title: "Anniversary Offers", crumb: "Offers", intro: state.offerActive ? "Buy 1, get 20% off · Buy 2, get 1 free — applied automatically in your bag." : "The anniversary offer has ended. Here’s everything in the studio.", items: all};
    case "style": return {title: STYLE_NAMES[arg] || arg, crumb: STYLE_NAMES[arg] || arg, items: all.filter(p => (p.styles || []).includes(arg) || (arg === "kids" && p.category === "Kids"))};
    case "occasion": return {title: arg, crumb: arg, intro: `Pieces for ${arg.toLowerCase()}, chosen one at a time.`, items: all.filter(p => p.occasion.includes(arg))};
    case "price": { const [lo, hi] = arg.split("-").map(Number); return {title: hi > 99999 ? `${money(lo)} & above` : lo === 0 ? `Under ${money(hi + 1)}` : `${money(lo)} – ${money(hi)}`, crumb: "Shop by price", items: all.filter(p => p.price >= lo && p.price <= hi)}; }
    case "size": return {title: `Size ${arg.replace(" / ", "/")}`, crumb: "Shop by size", items: all.filter(p => p.sizes.some(s => s.label === arg && s.available > 0))};
    default: return {title: "All Pieces", crumb: "All pieces", intro: "Small-batch finds, selected with care.", items: all};
  }
}

/* ---------- views ---------- */
const home = $("#homeView"), pageView = $("#pageView");
function showPage(html) { home.hidden = true; pageView.hidden = false; pageView.innerHTML = html; window.scrollTo(0, 0); }
function showHome() { pageView.hidden = true; pageView.innerHTML = ""; home.hidden = false; }

function renderHome() {
  const ps = state.products;
  const arrivals = ps.filter(p => has(p, "new") && p.imageUrls.length).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  $("#newArrivals").innerHTML = arrivals.filter(p => p.category !== "Sarees").slice(0, 6).map(p => card(p, {sub: false, offer: false})).join("");
  $("#windowItems").innerHTML = ps.filter(p => has(p, "window")).slice(0, 4).map(p => card(p, {sub: false})).join("");
  $("#handpicked").innerHTML = ps.filter(p => has(p, "handpicked")).slice(0, 4).map(p => card(p)).join("");
  renderLoved($("#lovedChips .on")?.dataset.loved || "all");
  const sarees = ps.filter(p => p.category === "Sarees").slice(0, 3);
  if (sarees.length) {
    const [f, ...rest] = sarees;
    const sareeCard = (p, cls = "", idx = 0) => `<a class="saree-card ${cls}" href="#product/${esc(p.id)}">${photo(p, idx)}<span class="cap"><b>${esc(p.name)}</b><small>${money(p.price)}${cls ? " · SHOP THE LOOK" : ""}</small></span></a>`;
    $("#sareeEdit").innerHTML = `
      <div class="saree-copy"><span class="kicker">NEW AT SAHASRAM</span><h2>The Saree Edit</h2>
        <p>Zari-bordered silks for the festive season and hand-tied bandhani for everything in between — draped and photographed in our Hyderabad studio. Blouse stitching and fall-pico done in-house.</p>
        <div class="btn-row"><a href="#shop/sarees" class="btn btn-gold">Shop sarees</a><a href="#page/customization" class="btn btn-ghost-light">Blouse stitching</a></div></div>
      ${sareeCard(f, "feature")}${rest.map(p => sareeCard(p)).join("")}`;
    // desktop: feature first, then copy; mobile: copy first then cards
    if (matchMedia("(min-width: 960px)").matches) $("#sareeEdit").prepend($("#sareeEdit .feature"));
  }
  syncCounts();
}
function renderLoved(filter) {
  const loved = state.products.filter(p => has(p, "bestseller") || has(p, "last_piece") || has(p, "handpicked"))
    .filter(p => filter === "all" || p.category === filter)
    .sort((a, b) => Number(has(b, "bestseller")) - Number(has(a, "bestseller"))).slice(0, 4);
  $("#mostLoved").innerHTML = loved.length ? loved.map(p => card(p)).join("") : `<p class="muted">More coming to the studio soon.</p>`;
}

function renderShop(path) {
  const c = collection(path);
  const styles = [...new Set(c.items.flatMap(p => p.styles || []))].filter(s => STYLE_NAMES[s]);
  const featured = c.items.filter(p => has(p, "handpicked") || has(p, "window"));
  showPage(`<section class="wrap page">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a> / ${esc(c.crumb)}</nav>
    <h1 class="page-title">${esc(c.title)}</h1>
    ${c.intro ? `<p class="page-intro">${esc(c.intro)}</p>` : ""}
    ${styles.length > 1 ? `<div class="chips shelf-chips" role="tablist" aria-label="Refine"><button class="chip on" data-refine="">All</button>${styles.map(s => `<button class="chip" data-refine="${esc(s)}">${esc(STYLE_NAMES[s])}</button>`).join("")}</div>` : ""}
    <div class="toolbar"><span class="count" id="shopCount">${c.items.length} piece${c.items.length === 1 ? "" : "s"}</span>
      <label>SORT <select id="shopSort"><option value="featured">Featured</option><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
    ${featured.length >= 3 ? `<div class="shelf-row"><div class="shelf-head"><b>Sharanya’s shelf</b><span>arranged by Sharanya</span></div><div class="rail">${featured.slice(0, 8).map(p => card(p, {sub: false, offer: false})).join("")}</div><div class="shelf-plank" aria-hidden="true"></div></div>` : ""}
    <h2 class="shelf-grid-title">All ${esc(c.title.toLowerCase())}</h2>
    <div class="grid grid-4" id="shopGrid"></div>
    ${c.items.length ? "" : `<div class="empty"><p class="h">Nothing on the rack just yet.</p><p>Ask Sharanya and we’ll help you find something close.</p><button class="btn pri" data-action="book-call">Book a video call</button></div>`}
  </section>`);
  let refine = "", sort = "featured";
  const draw = () => {
    let list = c.items.filter(p => !refine || (p.styles || []).includes(refine));
    if (sort === "new") list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "featured") list = [...list].sort((a, b) => Number(!!b.imageUrls.length) - Number(!!a.imageUrls.length));
    $("#shopGrid").innerHTML = list.map(p => card(p)).join("");
    $("#shopCount").textContent = `${list.length} piece${list.length === 1 ? "" : "s"}`;
  };
  $("#shopSort").addEventListener("change", e => { sort = e.target.value; draw(); });
  $$("[data-refine]").forEach(b => b.addEventListener("click", () => { $$("[data-refine]").forEach(x => x.classList.toggle("on", x === b)); refine = b.dataset.refine; draw(); }));
  draw();
}

function renderProduct(id) {
  const p = byId(id);
  if (!p) return renderShop("all");
  state.selectedSize = available(p).length === 1 ? available(p)[0].label : "";
  const saved = state.wishes.includes(p.id);
  const imgs = p.imageUrls.length ? p.imageUrls : [""];
  const look = state.products.filter(x => x.id !== p.id && x.occasion.some(o => p.occasion.includes(o)) && x.category !== p.category && x.imageUrls.length).slice(0, 6);
  const alike = state.products.filter(x => x.id !== p.id && ((x.styles || []).some(s => (p.styles || []).includes(s)) || x.subCategory === p.subCategory) && x.imageUrls.length).slice(0, 8);
  const sizeBtns = p.sizes.map(s => `<button class="size ${s.label === state.selectedSize ? "on" : ""}" data-size="${esc(s.label)}" ${s.available ? "" : "disabled"} aria-pressed="${s.label === state.selectedSize}">${esc(s.label.replace(" / ", "/"))}</button>`).join("");
  const stock = stockNote(p);
  showPage(`<section class="wrap page">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a> / <a href="#shop/${esc(Object.keys(CATS).find(k => CATS[k] === p.category) || "all")}">${esc(p.category)}</a> / ${esc(p.name)}</nav>
    <div class="pdp">
      <div>
        <div class="pdp-gallery" id="pdpGallery">${imgs.map((_, i) => photo(p, i, i ? `${p.name}, detail ${i}` : `${p.name}, front`, i === 0)).join("")}</div>
        ${imgs.length > 1 ? `<div class="pdp-dots" id="pdpDots">${imgs.map((_, i) => `<span class="${i ? "" : "on"}"></span>`).join("")}</div>` : ""}
      </div>
      <div class="pdp-info">
        <span class="eyebrow">${esc(p.subCategory)} · ${p.setPieces?.length > 1 ? `${p.setPieces.length} pieces · ` : ""}${esc(p.sku)}</span>
        <h1>${esc(p.name)}</h1>
        <div class="pdp-price"><b>${money(p.price)}</b>${p.mrp > p.price ? `<del>${money(p.mrp)}</del>` : ""}<small>incl. of all taxes</small></div>
        ${state.offerActive ? `<div class="offer-box"><b>${money(offerPrice(p))} with Buy 1, get 20% off</b><br/>Buy 2, get 1 free · till 31 Oct · free shipping above ₹2,999</div>` : p.price >= 2999 ? `<div class="offer-box">Free shipping on this piece · ships from our Hyderabad studio</div>` : ""}
        <div><div class="size-head"><span>SIZE</span><button class="text-link" data-action="size-guide">Size guide</button></div>
          <div class="sizes">${sizeBtns}</div>${stock ? `<p class="stock-note">${esc(stock)}</p>` : ""}</div>
        <div class="buy-row only-desktop"><button class="btn pri" data-action="add" data-id="${esc(p.id)}" ${available(p).length ? "" : "disabled"}>${available(p).length ? "Add to bag" : "Sold out"}</button><button class="btn wish-btn ${saved ? "saved" : ""}" data-action="wish" data-id="${esc(p.id)}" aria-label="Save to wishlist">${saved ? "♥" : "♡"}</button></div>
        <div class="pdp-actions">
          <button class="btn" data-action="book-call" data-id="${esc(p.id)}">See it on a video call</button>
          <a class="btn btn-green" href="${wa(`Hi Sahasram, could you tell me more about ${p.name} (${p.sku})?`)}" target="_blank" rel="noopener">Ask on WhatsApp</a>
        </div>
        <div>
          <details open><summary>DETAILS</summary><p>${esc(p.shortDescription)}.${p.setPieces?.length > 1 ? ` Comes with: ${esc(p.setPieces.join(", ").toLowerCase())}.` : ""} Work: ${esc(p.work.toLowerCase())}.</p></details>
          <details><summary>FABRIC &amp; CARE</summary><p>Fabric: ${esc(p.fabric === "To confirm" ? "to be confirmed by the studio" : p.fabric)}. Gentle hand wash or dry clean; dry in shade.</p></details>
          <details><summary>SHIPPING &amp; RETURNS</summary><p>Ships from our KPHB studio in 2–4 working days, or pick up from the studio. Returns and exchanges follow our store policy.</p></details>
        </div>
        <p class="pdp-meta">${esc(p.location)} · Tag ${esc(p.sku)}</p>
        ${look.length ? `<div><div class="mini-rail-title"><span>COMPLETE THE LOOK</span></div><div class="rail">${look.map(x => card(x, {sub: false, offer: false})).join("")}</div></div>` : ""}
        ${alike.length ? `<div><div class="mini-rail-title"><span><small>FEATURED IN ${esc(p.subCategory.toUpperCase())}</small>MORE LIKE THIS</span><a class="more" href="#shop/${(p.styles || [])[0] ? `style/${esc(p.styles[0])}` : "all"}">View all</a></div><div class="rail">${alike.map(x => card(x, {sub: false, offer: false})).join("")}</div></div>` : ""}
      </div>
    </div>
  </section>
  <div class="sticky-buy"><button class="btn wish-btn ${saved ? "saved" : ""}" data-action="wish" data-id="${esc(p.id)}" aria-label="Save to wishlist">${saved ? "♥" : "♡"}</button><button class="btn pri" data-action="add" data-id="${esc(p.id)}" ${available(p).length ? "" : "disabled"}>${inBag(p.id) ? "In your bag ✓" : available(p).length ? "Add to bag" : "Sold out"}</button></div>`);
  document.body.classList.add("has-sticky-buy");
  const g = $("#pdpGallery"), dots = $$("#pdpDots span");
  if (dots.length) g.addEventListener("scroll", () => { const i = Math.round(g.scrollLeft / g.clientWidth); dots.forEach((d, j) => d.classList.toggle("on", i === j)); }, {passive: true});
  document.title = `${p.name} — Sahasram`;
}

const PAGES = {
  customization: {t: "Made for your fit.", i: "A little adjustment can make a favourite feel like yours.", b: "Tell us what you have in mind — alterations, blouse stitching, fall-pico, made-to-measure pieces or matching kids’ sets. We’ll talk it through and share a quote on WhatsApp.", c: "Book a fitting", draft: "Customization prices are still to be confirmed by Sharanya."},
  exhibitions: {t: "Catch us out there.", i: "A little Sahasram, wherever the next gathering takes us.", b: "There are no upcoming exhibitions listed right now. Leave your number in Stay in Touch and we’ll tell you when we add one.", c: "Remind me on WhatsApp"},
  "track-order": {t: "Your order, in view.", i: "Track your Sahasram parcel.", b: "Order tracking will connect to courier updates once shipping is set up. For help with an existing order, message the studio.", c: "Ask about my order"},
  "about-us": {t: "A studio in Hyderabad.", i: "A Hyderabad clothing studio, chosen piece by piece.", b: "Sahasram opened its doors in Hyderabad in October 2025. Every kurta, set and kids’ outfit is picked by hand — for the print, the fall of the fabric and how it will feel to wear through a long, warm day. Most pieces come in a single size and colour, so what you take home is truly yours.", c: "Visit the studio"},
  shipping: {t: "Shipping, with care.", i: "Every order starts its journey from our KPHB studio.", b: "Free shipping above ₹2,999. Timelines and charges for smaller orders will be confirmed before launch.", c: "Ask about shipping", draft: "Shipping fee under ₹2,999 is still to be confirmed."},
  returns: {t: "Returns & exchanges.", i: "We want you to feel good about what you choose.", b: "Please message us before purchasing if you have any questions about fit or colour — we’re happy to show the piece on video first.", c: "Ask us first", draft: "Draft — the return and exchange policy needs Sharanya’s and legal review before launch."},
  privacy: {t: "Your details stay yours.", i: "We use your contact details only to help with your order and appointments.", b: "This privacy notice will be reviewed against India’s DPDP Act, 2023 before launch.", c: "Ask a privacy question", draft: "Draft for legal review."},
  terms: {t: "A few clear terms.", i: "Shared openly, in plain words.", b: "Sahasram’s final terms will be published after review with the owner and legal counsel.", c: "Contact Sahasram", draft: "Draft for legal review."},
  "store-policies": {t: "How our studio works.", i: "A few practical details.", b: "No cash on delivery at launch. Pay by UPI, card or net banking. Studio pickup is available at KPHB Colony, all days 11 AM – 10 PM.", c: "Ask about a policy"},
  measure: {t: "Find your fit.", i: "A few careful measurements make all the difference.", b: "Measure over light clothing with a soft tape. Compare with a favourite piece you already own, and if you’re between sizes, book a fitting.", c: "Book a fitting", list: ["Bust", "Waist", "Hip", "Shoulder", "Armhole", "Sleeve length", "Sleeve round", "Kurta length", "Neck depth (front)", "Neck depth (back)", "Pant waist", "Pant length", "Thigh round", "Knee round", "Ankle round", "Blouse length", "Under-bust", "Height"]},
  "book-appointment": {t: "A time for you.", i: "Visit the studio or shop on a relaxed video call.", b: "Choose a time and Sharanya will confirm your appointment on WhatsApp. Open all days, 11 AM – 10 PM.", c: "Choose a time"},
  contact: {t: "We’re easy to reach.", i: "Call or WhatsApp +91 73372 21100.", b: "The studio is open every day, 11 AM – 10 PM, on the 1st floor of Krishna Teja Classic, Road No. 45, KPHB Colony, opposite Prajay Megapolis.", c: "Message the studio"},
  faqs: {t: "Good to know.", i: "Answers to the questions we hear most.", b: "Yes, you can see any piece on a WhatsApp video call before you buy. Yes, we have kids’ ethnic wear for ages 0–8 and up. No cash on delivery at launch.", c: "Ask us anything"},
  account: {t: "My account.", i: "Sign in with your mobile number.", b: "Orders, wishlist and recently viewed pieces will live here once OTP sign-in is connected. Your wishlist is saved on this device for now.", c: "Talk to the studio"},
};
function renderPage(key) {
  const pg = PAGES[key];
  if (!pg) return renderShop("all");
  showPage(`<section class="wrap simple">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a> / ${esc(pg.t.replace(/\.$/, ""))}</nav>
    <h1>${esc(pg.t)}</h1><h2>${esc(pg.i)}</h2><p>${esc(pg.b)}</p>
    ${pg.list ? `<ol class="measure-list">${pg.list.map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}
    ${pg.draft ? `<p class="draft">${esc(pg.draft)}</p>` : ""}
    <div class="btn-row"><button class="btn pri" data-action="book-call">${esc(pg.c)}</button><a class="btn" href="#shop/all">Browse the collection</a></div>
  </section>`);
}

function renderSearch(q) {
  const t = q.toLowerCase().trim();
  const items = state.products.filter(p => [p.name, p.sku, p.quickRef, p.category, p.subCategory, p.fabric, p.color, p.work, ...p.occasion, ...(p.descriptors || [])].join(" ").toLowerCase().includes(t))
    .sort((a, b) => Number(!!b.imageUrls.length) - Number(!!a.imageUrls.length));
  showPage(`<section class="wrap page">
    <nav class="crumbs"><a href="#home">Home</a> / Search</nav>
    <h1 class="page-title">“${esc(q)}”</h1><p class="page-intro">${items.length} piece${items.length === 1 ? "" : "s"} found</p>
    <div class="chips shelf-chips">${["anarkali", "ajrakh", "silk", "kids", "pin-tuck", "saree"].map(s => `<a class="chip" href="#search/${s}">${s}</a>`).join("")}</div>
    <div class="grid grid-4" style="margin-top:22px">${items.map(p => card(p)).join("")}</div>
    ${items.length ? "" : `<div class="empty"><p class="h">We don’t see that exact piece.</p><p>Sharanya may know where to look — ask on WhatsApp or book a video call.</p><button class="btn pri" data-action="book-call">Talk to Sharanya</button></div>`}
  </section>`);
}

/* ---------- router ---------- */
function route() {
  closeDrawer();
  $("#searchBar").classList.remove("open");
  document.body.classList.remove("has-sticky-buy");
  document.title = "Sahasram — Clothing Studio, Hyderabad";
  let raw = location.hash.slice(1);
  try { raw = decodeURIComponent(raw); } catch { /* malformed link — use it as typed */ }
  const [head, ...rest] = raw.split("/");
  const tail = rest.join("/");
  let tab = "home";
  if (head === "shop") { renderShop(tail || "all"); tab = "shop"; }
  else if (head === "category") { renderShop(Object.keys(CATS).find(k => CATS[k] === tail) || "all"); tab = "shop"; }
  else if (head === "product") { renderProduct(tail); tab = "shop"; }
  else if (head === "search") renderSearch(tail);
  else if (head === "page") renderPage(tail);
  else if (PAGES[head]) renderPage(head);
  else {
    showHome();
    if (head && head !== "home" && document.getElementById(head)) requestAnimationFrame(() => document.getElementById(head).scrollIntoView());
    else if (head === "home") window.scrollTo(0, 0);
  }
  $$(".tabbar [data-tab]").forEach(t => t.classList.toggle("on", t.dataset.tab === tab));
}

/* ---------- bag & offer ---------- */
const inBag = (id) => state.cart.some(l => l.productId === id);
function syncCounts() {
  const n = state.cart.reduce((s, l) => s + l.quantity, 0);
  $$("[data-bag-count]").forEach(el => { el.textContent = n; });
  $$("[data-wish-count]").forEach(el => { el.textContent = state.wishes.length; el.hidden = !state.wishes.length; });
  store.set(CART, state.cart); store.set(WISH, state.wishes);
}
function totals() {
  const rows = state.cart.map(line => ({line, p: byId(line.productId)})).filter(x => x.p);
  const subtotal = rows.reduce((s, x) => s + x.p.price * x.line.quantity, 0);
  const count = rows.reduce((s, x) => s + x.line.quantity, 0);
  let discount = 0, label = "";
  if (state.offerActive && count) {
    if (count >= 3) { discount = Math.min(...rows.map(x => x.p.price)); label = "Buy 2, get 1 free"; }
    else { discount = Math.round(subtotal * 0.2); label = "Anniversary offer (20%)"; }
  }
  const shipping = subtotal - discount >= 2999 || !count ? 0 : null;
  return {rows, subtotal, count, discount, label, shipping, total: Math.max(0, subtotal - discount)};
}
function addToBag(id) {
  const p = byId(id);
  if (!p) return;
  if (!state.selectedSize) { toast("Choose a size to add this piece."); $(".sizes")?.scrollIntoView({block: "center", behavior: "smooth"}); return; }
  if (!state.cart.some(l => l.productId === id && l.size === state.selectedSize)) state.cart.push({productId: id, size: state.selectedSize, quantity: 1});
  syncCounts();
  $$(`[data-action="add"][data-id="${CSS.escape(id)}"]`).forEach(b => { b.textContent = "In your bag ✓"; });
  openBag();
}

/* ---------- drawers ---------- */
const overlay = $("#overlay");
let lastFocus = null;
function openDrawer(html) {
  lastFocus = document.activeElement;
  $("#drawerContent").innerHTML = html;
  overlay.classList.add("open"); overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  setTimeout(() => $("#drawer").querySelector("input, select, button:not(.drawer-close), a")?.focus({preventScroll: true}), 60);
}
function closeDrawer() {
  if (!overlay.classList.contains("open")) return;
  overlay.classList.remove("open"); overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  lastFocus?.focus?.({preventScroll: true});
}
function openBag() {
  const t = totals();
  if (!t.rows.length) return openDrawer(`<h2 class="dt" id="drawerTitle">Your Bag</h2><div class="empty"><p class="h">Your bag is taking a little pause.</p><p>Find a piece that feels like you.</p><a class="btn pri" href="#shop/all">Explore the collection</a></div>`);
  const nudge = state.offerActive ? (t.count >= 3 ? "<b>Buy 2, get 1 free applied</b> — your lowest-priced piece is free" : `<b>Anniversary offer applied</b> — 20% off${t.count === 2 ? " · add 1 more for Buy 2, get 1 free" : ""}`) : t.shipping === 0 ? "<b>Free shipping</b> on this order" : `Add ${money(2999 - t.total)} more for <b>free shipping</b>`;
  openDrawer(`<h2 class="dt" id="drawerTitle">Your Bag (${t.count})</h2>
    <div class="stack">
      <div class="offer-box">${nudge}</div>
      ${t.rows.map(({line, p}) => `<div class="bag-line">${photo(p)}<div><a class="card-name" href="#product/${esc(p.id)}">${esc(p.name)}</a><span class="meta">${esc(line.size.replace(" / ", "/"))} · ${esc(p.sku)}</span><b>${money(p.price)}</b>
        <span class="acts"><button class="text-link" data-action="bag-to-wish" data-id="${esc(p.id)}" data-size="${esc(line.size)}">Move to wishlist</button><button class="text-link" data-action="remove" data-id="${esc(p.id)}" data-size="${esc(line.size)}">Remove</button></span></div></div>`).join("")}
      <div class="totals"><div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
        ${t.discount ? `<div><span>${esc(t.label)}</span><span class="save">− ${money(t.discount)}</span></div>` : ""}
        <div><span>Shipping</span><span class="${t.shipping === 0 ? "save" : ""}">${t.shipping === 0 ? "Free" : "At checkout"}</span></div>
        <div class="grand"><span>To pay</span><span>${money(t.total)}</span></div></div>
      <button class="btn pri full" data-action="checkout">Checkout</button>
      <button class="btn full" data-action="book-call" data-source="bag">Show me these on a video call</button>
    </div>`);
}
function openCheckout() {
  const t = totals();
  if (!t.rows.length) return openBag();
  openDrawer(`<h2 class="dt" id="drawerTitle">Checkout</h2>
    <form id="checkoutForm" class="stack">
      <div class="seg" role="tablist"><button type="button" class="on" data-seg="guest">GUEST</button><button type="button" data-seg="otp">LOG IN (OTP)</button></div>
      <label class="field">Mobile number (for OTP &amp; WhatsApp updates)<input name="mobile" type="tel" inputmode="tel" required placeholder="+91 98xxx xxxxx" autocomplete="tel" /></label>
      <label class="field">Full name<input name="name" required autocomplete="name" /></label>
      <div><span class="choice-label">DELIVERY</span><div class="chips wrap-chips"><button type="button" class="chip on" data-delivery="ship">Deliver to me</button><button type="button" class="chip" data-delivery="studio_pickup">Pick up at studio</button></div></div>
      <div id="addr" class="stack" style="margin:0">
        <label class="field">Address<input name="line1" required autocomplete="street-address" placeholder="House, street and area" /></label>
        <div class="two"><label class="field">City<input name="city" required autocomplete="address-level2" /></label><label class="field">PIN code<input name="pinCode" required inputmode="numeric" pattern="[0-9]{6}" autocomplete="postal-code" /></label></div>
      </div>
      <div><span class="choice-label">PAY WITH</span><div class="chips wrap-chips"><button type="button" class="chip on" data-pay="upi">UPI</button><button type="button" class="chip" data-pay="card">Card</button><button type="button" class="chip" data-pay="netbanking">Net banking</button></div></div>
      <label class="field">GSTIN (optional, for a business invoice)<input name="gstin" /></label>
      <div class="totals"><div class="grand"><span>To pay</span><span>${money(t.total)}</span></div></div>
      <p class="warn">Preview checkout — no payment will be taken. Online payment, OTP and GST invoices connect when the backend is live.</p>
      <button class="btn pri full" type="submit" id="payBtn">Pay ${money(t.total)} with UPI</button>
    </form>`);
  const form = $("#checkoutForm");
  form.dataset.delivery = "ship"; form.dataset.pay = "upi";
  form.addEventListener("click", e => {
    const b = e.target.closest("[data-seg],[data-delivery],[data-pay]");
    if (!b) return;
    const key = b.dataset.seg ? "seg" : b.dataset.delivery ? "delivery" : "pay";
    $$(`[data-${key}]`, form).forEach(x => x.classList.toggle("on", x === b));
    form.dataset[key] = b.dataset[key];
    if (key === "delivery") { const pick = b.dataset.delivery === "studio_pickup"; $("#addr").hidden = pick; $$("#addr input").forEach(i => { i.required = !pick; i.disabled = pick; }); }
    if (key === "pay") $("#payBtn").textContent = `Pay ${money(t.total)} with ${b.textContent}`;
    if (key === "seg" && b.dataset.seg === "otp") toast("OTP sign-in connects when the backend is live — continue as guest for now.");
  });
}
function openCall(id, source) {
  const fromBag = source === "bag" ? state.cart.map(l => l.productId) : [];
  const fromWish = source === "wishlist" ? state.wishes : [];
  state.callIds = [...new Set([...(id ? [id] : []), ...fromBag, ...fromWish])].slice(0, 10);
  const items = state.callIds.map(byId).filter(Boolean);
  const now = new Date(), slots = [];
  for (let d = 0; d < 3 && slots.length < 6; d++) for (let h = 11; h < 22 && slots.length < 6; h++) {
    const s = new Date(now); s.setDate(now.getDate() + d); s.setHours(h, 0, 0, 0);
    if (s - now < 45 * 60000) continue;
    const day = d === 0 ? "Today" : d === 1 ? "Tomorrow" : s.toLocaleDateString("en-IN", {weekday: "short"});
    const fmt = (x) => `${((x + 11) % 12) + 1}${x >= 12 ? " pm" : " am"}`;
    slots.push({label: `${day} ${fmt(h)}–${fmt(h + 1)}`, date: s.toISOString().slice(0, 10), slot: fmt(h)});
  }
  openDrawer(`<h2 class="dt" id="drawerTitle">Book a video call</h2>
    <p class="dsub">Sharanya will show ${items.length ? "these" : "your picks"} on WhatsApp video — colour in daylight, embroidery up close.</p>
    <form id="callForm" class="stack">
      <div class="tray">${items.map(p => photo(p)).join("")}<a class="tray-add" href="#shop/all">+ add</a></div>
      <div><span class="choice-label">PICK A TIME</span><div class="chips">${slots.map((s, i) => `<button type="button" class="chip ${i ? "" : "on"}" data-slot="${i}">${esc(s.label)}</button>`).join("")}</div></div>
      <div><span class="choice-label">HOW SHALL WE MEET?</span><div class="chips wrap-chips"><button type="button" class="chip on" data-mode="WhatsApp video">WhatsApp video</button><button type="button" class="chip" data-mode="Google Meet">Google Meet</button><button type="button" class="chip" data-mode="Studio visit">Studio visit</button></div></div>
      <label class="field">Your name<input name="customerName" required autocomplete="name" /></label>
      <label class="field">Your WhatsApp number<input name="whatsapp" type="tel" required inputmode="tel" autocomplete="tel" placeholder="+91" /></label>
      <button class="btn pri full" type="submit">Send request</button>
      <p class="note">Open all days, 11 AM – 10 PM. We’ll confirm on WhatsApp.</p>
    </form>`);
  const form = $("#callForm");
  form.dataset.slot = "0"; form.dataset.mode = "WhatsApp video";
  form._slots = slots;
  form.addEventListener("click", e => {
    const b = e.target.closest("[data-slot],[data-mode]");
    if (!b) return;
    const key = b.dataset.slot !== undefined ? "slot" : "mode";
    $$(`[data-${key}]`, form).forEach(x => x.classList.toggle("on", x === b));
    form.dataset[key] = b.dataset[key];
  });
}
function openWishlist() {
  const items = state.wishes.map(byId).filter(Boolean);
  openDrawer(`<h2 class="dt" id="drawerTitle">Wishlist</h2>${items.length
    ? `<div class="stack"><button class="btn pri full" data-action="book-call" data-source="wishlist">See these on a video call</button></div><div class="wish-grid">${items.map(p => card(p, {sub: false})).join("")}</div>`
    : `<div class="empty"><p class="h">A little room for a favourite.</p><p>Tap the heart on any piece to save it here.</p><a class="btn pri" href="#shop/all">Browse the collection</a></div>`}`);
}
function openMenu() {
  openDrawer(`<h2 class="dt" id="drawerTitle">Menu</h2><nav class="menu-links">
    ${[["#shop/kurta-sets", "KURTA SETS"], ["#shop/sarees", "SAREES"], ["#page/customization", "CUSTOMIZATION"], ["#shop/kids", "KIDS"], ["#shop/kurtas", "KURTAS"], ["#shop/anarkalis", "ANARKALIS"]].map(([h, t]) => `<a href="${h}">${t}<span>›</span></a>`).join("")}
    <a href="#shop/new" class="accent">NEW ARRIVALS<span>›</span></a>${state.offerActive ? `<a href="#shop/offers" class="accent">OFFERS<span>›</span></a>` : ""}
    <a href="#studio">VISIT THE STUDIO<span>›</span></a><a href="#page/account">SIGN IN<span>›</span></a></nav>`);
}
const SIZE_GUIDE = `<h2 class="dt" id="drawerTitle">Size guide</h2><div class="stack">
  <table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="text-align:left;border-bottom:1px solid var(--stone)"><th style="padding:8px 0">Size</th><th>Bust (in)</th><th>Waist (in)</th><th>Hip (in)</th></tr></thead>
  <tbody>${[["S/36", 36, 30, 38], ["M/38", 38, 32, 40], ["L/40", 40, 34, 42], ["XL/42", 42, 36, 44], ["XXL/44", 44, 38, 46]].map(r => `<tr style="border-bottom:1px solid var(--stone)"><td style="padding:8px 0">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody></table>
  <p class="note">Garment measurements vary slightly by piece. Between sizes? Book a fitting or ask on WhatsApp — we’ll measure the piece for you.</p>
  <a class="btn full" href="#page/measure">How to measure</a></div>`;

/* ---------- toast ---------- */
const toastEl = $("#toast");
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove("show"), 2600); }

/* ---------- hero carousel ---------- */
function initHero() {
  const track = $("#heroTrack"), dotsEl = $("#heroDots");
  const slides = () => $$(".hero-slide", track).filter(s => !s.hidden);
  const draw = () => {
    const list = slides();
    dotsEl.innerHTML = list.map((_, i) => `<button role="tab" aria-label="Slide ${i + 1}" data-i="${i}"></button>`).join("");
    mark();
  };
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const mark = () => $$("button", dotsEl).forEach((d, i) => d.setAttribute("aria-selected", String(i === current())));
  const go = (i) => { const n = slides().length; track.scrollTo({left: ((i + n) % n) * track.clientWidth}); };
  track.addEventListener("scroll", () => requestAnimationFrame(mark), {passive: true});
  dotsEl.addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) go(+b.dataset.i); });
  document.addEventListener("click", e => { const a = e.target.closest("[data-action^='hero-']"); if (a) go(current() + (a.dataset.action === "hero-next" ? 1 : -1)); });
  let paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
  ["mouseenter", "focusin", "touchstart"].forEach(ev => track.parentElement.addEventListener(ev, () => { paused = true; }, {passive: true}));
  setInterval(() => { if (!paused && !home.hidden && !document.hidden) go(current() + 1); }, 6000);
  draw();
  return draw;
}

/* ---------- offer + countdown ---------- */
function applyOffer() {
  const ends = new Date(state.offer?.endsAt || 0);
  state.offerActive = ends > new Date();
  $$("[data-offer]").forEach(el => { el.hidden = !state.offerActive; });
  $$("[data-no-offer]").forEach(el => { el.hidden = state.offerActive; });
  if (!state.offerActive) return;
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const r = Math.max(0, ends - new Date());
    const set = (k, v) => { const el = $(`[data-cd="${k}"]`); if (el) el.textContent = pad(v); };
    set("d", Math.floor(r / 864e5)); set("h", Math.floor(r % 864e5 / 36e5)); set("m", Math.floor(r % 36e5 / 6e4)); set("s", Math.floor(r % 6e4 / 1e3));
  };
  tick(); setInterval(tick, 1000);
}

/* ---------- exhibitions ---------- */
function renderExhibitions(list) {
  const section = $("#exhibitions");
  section.hidden = !list.length;
  if (!list.length) return;
  $("#exhibitionCards").innerHTML = list.map((ev, i) => {
    const s = new Date(ev.startDate + "T12:00:00"), e = new Date(ev.endDate + "T12:00:00");
    const ymd = (d) => d.toISOString().slice(0, 10).replaceAll("-", "");
    const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.name)}&dates=${ymd(s)}/${ymd(e)}&location=${encodeURIComponent(`${ev.venue}, ${ev.city}`)}`;
    return `<article class="event"><div class="event-top"><div class="event-date"><b>${s.toLocaleDateString("en-IN", {day: "2-digit"})}</b><small>${s.toLocaleDateString("en-IN", {month: "short"}).toUpperCase()}</small></div>
      <div><span class="kick">${i ? "COMING SOON" : "NEXT UP"}</span><span class="city">${esc(ev.city)}</span></div></div>
      <div class="event-body"><b>${esc(ev.name)}</b><span>${esc(ev.venue)}<br/>${s.toLocaleDateString("en-IN", {day: "numeric", month: "short"})}–${e.toLocaleDateString("en-IN", {day: "numeric", month: "short"})} · ${esc(ev.openingTime || "")}–${esc(ev.closingTime || "")}${ev.stall ? ` · Stall ${esc(ev.stall)}` : ""}</span>
      <span>Bringing new kurta sets, sarees and kids’ festive wear. Pick pieces online and we’ll keep them ready at the stall.</span>
      <div class="btn-row"><a class="btn pri" href="${wa(`Please remind me about ${ev.name} in ${ev.city}.`)}" target="_blank" rel="noopener">Remind me on WhatsApp</a><a class="btn" href="${cal}" target="_blank" rel="noopener">Add to calendar</a>${ev.directionsUrl ? `<a class="btn" href="${esc(ev.directionsUrl)}" target="_blank" rel="noopener">Directions</a>` : ""}</div></div></article>`;
  }).join("");
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const sizeBtn = e.target.closest(".size[data-size]");
  if (sizeBtn && !sizeBtn.disabled) { $$(".size").forEach(x => { x.classList.toggle("on", x === sizeBtn); x.setAttribute("aria-pressed", String(x === sizeBtn)); }); state.selectedSize = sizeBtn.dataset.size; return; }
  const loved = e.target.closest("[data-loved]");
  if (loved) { $$("[data-loved]").forEach(x => x.classList.toggle("on", x === loved)); renderLoved(loved.dataset.loved); return; }
  const b = e.target.closest("[data-action]");
  if (!b) { if (!e.target.closest(".nav-more")) $("#mega")?.classList.remove("open"); return; }
  const {action, id} = b.dataset;
  switch (action) {
    case "close": closeDrawer(); break;
    case "menu": openMenu(); break;
    case "more": $("#mega").classList.toggle("open"); break;
    case "search": $("#searchBar").classList.add("open"); $("#searchInput").focus(); break;
    case "search-close": $("#searchBar").classList.remove("open"); break;
    case "bag": openBag(); break;
    case "wishlist": openWishlist(); break;
    case "checkout": openCheckout(); break;
    case "book-call": openCall(id, b.dataset.source); break;
    case "size-guide": openDrawer(SIZE_GUIDE); break;
    case "add": addToBag(id); break;
    case "remove": state.cart = state.cart.filter(l => !(l.productId === id && l.size === b.dataset.size)); syncCounts(); openBag(); break;
    case "bag-to-wish":
      state.cart = state.cart.filter(l => !(l.productId === id && l.size === b.dataset.size));
      if (!state.wishes.includes(id)) state.wishes.push(id);
      syncCounts(); openBag(); break;
    case "wish": {
      e.preventDefault();
      const on = !state.wishes.includes(id);
      state.wishes = on ? [...state.wishes, id] : state.wishes.filter(x => x !== id);
      syncCounts();
      $$(`[data-action="wish"][data-id="${CSS.escape(id)}"]`).forEach(x => {
        x.classList.toggle("saved", on); x.setAttribute("aria-pressed", String(on));
        if (x.classList.contains("wish-btn")) x.textContent = on ? "♥" : "♡";
      });
      toast(on ? "Saved to your wishlist." : "Removed from your wishlist.");
      break;
    }
  }
});
overlay.addEventListener("click", e => { if (e.target === overlay) closeDrawer(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeDrawer(); $("#searchBar").classList.remove("open"); $("#mega")?.classList.remove("open"); } });
$("#searchBar").addEventListener("submit", e => { e.preventDefault(); const q = $("#searchInput").value.trim(); if (q) location.hash = `search/${encodeURIComponent(q)}`; });
document.addEventListener("submit", async e => {
  const f = e.target;
  if (f.id === "newsletterForm") { e.preventDefault(); toast("Thank you! WhatsApp updates connect when the store goes live."); f.reset(); }
  if (f.id === "callForm") {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(f));
    const slot = f._slots[+f.dataset.slot] || {};
    try {
      const saved = await api.createAppointment({...data, purpose: "Shopping", mode: f.dataset.mode, date: slot.date, slot: slot.slot, productIds: state.callIds, products: state.callIds.map(id => byId(id)?.name).filter(Boolean)});
      openDrawer(`<div class="done"><span class="tick">✓</span><h2 class="dt" id="drawerTitle" style="padding:0">Request sent</h2><p>Your request <b>${esc(saved.id)}</b> for <b>${esc(slot.label || "")}</b> is with Sharanya. We’ll confirm on WhatsApp.</p><button class="btn pri full" data-action="close">Continue shopping</button></div>`);
    } catch { toast("We couldn’t save that request — please message us on WhatsApp."); }
  }
  if (f.id === "checkoutForm") {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const result = await api.createOrder({customer: {name: d.name, mobile: d.mobile, gstin: d.gstin}, delivery: f.dataset.delivery, paymentMethod: f.dataset.pay, address: f.dataset.delivery === "ship" ? {line1: d.line1, city: d.city, pinCode: d.pinCode} : undefined, lines: state.cart});
    state.cart = []; syncCounts();
    openDrawer(`<div class="done"><span class="tick">✓</span><h2 class="dt" id="drawerTitle" style="padding:0">Thank you!</h2><p>Order <b>${esc(result.orderNumber)}</b> is recorded.<br/>${esc(result.message || "")}</p><a class="btn pri full" href="#home">Continue shopping</a></div>`);
  }
});
window.addEventListener("hashchange", route);
const setHeaderH = () => document.documentElement.style.setProperty("--header-h", `${$(".site-header").offsetHeight}px`);
window.addEventListener("resize", setHeaderH, {passive: true});

/* ---------- start ---------- */
async function start() {
  setHeaderH();
  const [products, offer, exhibitions] = await Promise.all([api.getProducts(), api.getOffer(), api.getExhibitions()]);
  state.products = products; state.offer = offer;
  applyOffer();
  const redrawHero = initHero();
  redrawHero();
  renderHome();
  renderExhibitions(exhibitions);
  route();
  setHeaderH();
}
start().catch(err => { console.error(err); toast("The catalogue could not be loaded."); });
