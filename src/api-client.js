import {demoProducts, demoAppointments, demoSummary} from "./demo-data.js";
import {fromFeed, applyAvailability} from "./feed.js";

// The storefront reads the BoutiqueOS catalogue from data/catalog.json, which the
// sync workflow (tools/sync-catalog.mjs) writes at build time. When that file is
// absent (local development without a feed), the demo catalogue is used instead.
// data/site-config.json carries the public settings for the live stock check.
const DEMO_KEY = "sahasram-demo-state-v1";
const copy = (value) => JSON.parse(JSON.stringify(value));

function loadDemoState() {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || {}; }
  catch { return {}; }
}
function saveDemoState(next) { try { localStorage.setItem(DEMO_KEY, JSON.stringify(next)); } catch { /* private mode */ } }

async function getJson(url) {
  const response = await fetch(url, {cache: "no-cache"});
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

let catalogPromise = null;
function loadCatalog() {
  catalogPromise ??= getJson("data/catalog.json").then(feed => feed && {
    version: feed.catalog_version, generatedAt: feed.generated_at,
    products: (feed.products || []).map(fromFeed),
  }).catch(err => { console.error("Catalogue could not be read", err); throw err; });
  return catalogPromise;
}
let configPromise = null;
const loadSiteConfig = () => (configPromise ??= getJson("data/site-config.json").catch(() => null).then(c => c || {}));

function matches(p, {category, query}) {
  if (category && category !== "All pieces" && p.category !== category && p.subCategory !== category) return false;
  if (!query) return true;
  const q = query.toLowerCase().trim();
  return [p.name, p.sku, p.quickRef, p.category, p.subCategory, p.fabric, p.color, p.work, ...p.occasion, ...(p.descriptors || [])].join(" ").toLowerCase().includes(q);
}

export const api = {
  source: "demo",
  async getProducts(filter = {}) {
    const catalog = await loadCatalog();
    if (catalog) { this.source = "feed"; return catalog.products.filter(p => matches(p, filter)); }
    this.source = "demo";
    const state = loadDemoState();
    return copy(state.products || demoProducts).filter(p => p.onlineVisible && matches(p, filter));
  },
  async getProduct(id) { return (await this.getProducts()).find(p => p.id === id); },
  async getOffer() { return {id:"anniversary-2026",headline:"Sahasram turns one",endsAt:"2026-10-31T23:59:59+05:30",rules:[{type:"percent_off",buyQuantity:1,percent:20},{type:"buy_x_get_y",buyQuantity:2,freeQuantity:1}],automatic:true}; },
  async getExhibitions() { return []; },

  // Live stock from BoutiqueOS for up to 20 products per call, using the
  // publishable key (safe in the browser). Returns {id: liveEntry} or null
  // when the check is not configured or BoutiqueOS cannot be reached.
  async checkAvailability(ids) {
    const config = await loadSiteConfig();
    if (!config.apiBaseUrl || !config.publishableKey || !ids.length) return null;
    const unique = [...new Set(ids)], result = {};
    try {
      for (let i = 0; i < unique.length; i += 20) {
        const url = `${config.apiBaseUrl.replace(/\/$/, "")}/storefront/v1/availability?ids=${unique.slice(i, i + 20).map(encodeURIComponent).join(",")}`;
        const response = await fetch(url, {headers: {"X-Storefront-Key": config.publishableKey}, cache: "no-store"});
        if (!response.ok) throw new Error(`availability ${response.status}`);
        for (const entry of (await response.json()).products || []) result[entry.id] = entry;
      }
      return result;
    } catch (err) { console.warn("Live stock check failed", err); return null; }
  },
  applyAvailability,

  async createAppointment(payload) { const saved={...payload,id:`CALL-${Math.floor(105+Math.random()*900)}`,status:"New"}; const state=loadDemoState(); state.appointments=[saved,...(state.appointments||demoAppointments)]; saveDemoState(state); return saved; },
  async createOrder() { return {demo:true,orderNumber:`SAH-DEMO-${Date.now().toString().slice(-6)}`,message:"Checkout preview only. No payment was taken."}; },

  // Owner console (preview only, demo data).
  async getAdminProducts() { const state=loadDemoState(); return copy(state.products || demoProducts); },
  async setProductVisibility(id, onlineVisible) { const state=loadDemoState(); const products=copy(state.products||demoProducts); const item=products.find(p=>p.id===id); if(item) item.onlineVisible=onlineVisible; state.products=products; saveDemoState(state); return item; },
  async recordOfflineSale({id,size,quantity=1}) { const state=loadDemoState(); const products=copy(state.products||demoProducts); const item=products.find(p=>p.id===id); if(item){const stock=item.sizes.find(s=>s.label===size); if(stock){stock.available=Math.max(0,stock.available-quantity);if(item.sizes.every(s=>s.available===0)){item.stockStatus="sold_out";item.onlineVisible=false;}}} state.products=products; saveDemoState(state); return {ok:true,item}; },
  async getAppointments() { return copy(loadDemoState().appointments||demoAppointments); },
  async getSummary() { return copy(demoSummary); }
};
