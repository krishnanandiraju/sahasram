import {demoProducts, demoAppointments, demoSummary} from "./demo-data.js";

const config = window.SAHASRAM_CONFIG || {};
const baseUrl = (config.API_BASE_URL || "").replace(/\/$/, "");
const DEMO_KEY = "sahasram-demo-state-v1";

function loadDemoState() {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || {}; }
  catch { return {}; }
}
function saveDemoState(next) { localStorage.setItem(DEMO_KEY, JSON.stringify(next)); }
async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {credentials:"same-origin",headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
  if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
  return response.status === 204 ? null : response.json();
}
const copy = (value) => JSON.parse(JSON.stringify(value));

export const api = {
  get demoMode() { return !baseUrl; },
  async getProducts({category, query} = {}) {
    if (baseUrl) { const params=new URLSearchParams({...(category?{category}:{}),...(query?{q:query}:{})}); return request(`/api/products${params.toString()?`?${params}`:""}`); }
    const state = loadDemoState();
    let items = copy(state.products || demoProducts).filter(p=>p.onlineVisible);
    if(category && category!=="All pieces") items=items.filter(p=>p.category===category || p.subCategory===category);
    if(query) { const q=query.toLowerCase().trim(); items=items.filter(p=>[p.name,p.sku,p.quickRef,p.category,p.subCategory,p.fabric,p.color,p.work,...p.occasion,...(p.descriptors||[])].join(" ").toLowerCase().includes(q)); }
    return items;
  },
  async getProduct(id) { if(baseUrl) return request(`/api/products/${encodeURIComponent(id)}`); return (await this.getProducts()).find(p=>p.id===id); },
  async getOffer() { if(baseUrl) return request("/api/offers/current"); return {id:"anniversary-2026",headline:"Sahasram turns one",endsAt:"2026-10-31T23:59:59+05:30",rules:[{type:"percent_off",buyQuantity:1,percent:20},{type:"buy_x_get_y",buyQuantity:2,freeQuantity:1}],automatic:true}; },
  async getExhibitions() { if(baseUrl) return request("/api/exhibitions?upcoming=true"); return []; },
  async createAppointment(payload) { if(baseUrl) return request("/api/appointments",{method:"POST",body:JSON.stringify(payload)}); const saved={...payload,id:`CALL-${Math.floor(105+Math.random()*900)}`,status:"New"}; const state=loadDemoState(); state.appointments=[saved,...(state.appointments||demoAppointments)]; saveDemoState(state); return saved; },
  async createOrder(payload) { if(baseUrl) return request("/api/orders",{method:"POST",body:JSON.stringify(payload)}); return {demo:true,orderNumber:`SAH-DEMO-${Date.now().toString().slice(-6)}`,message:"Checkout preview only. No payment was taken."}; },
  async getAdminProducts() { if(baseUrl) return request("/api/admin/products"); const state=loadDemoState(); return copy(state.products || demoProducts); },
  async setProductVisibility(id, onlineVisible) { if(baseUrl) return request(`/api/admin/products/${encodeURIComponent(id)}/visibility`,{method:"PATCH",body:JSON.stringify({onlineVisible})}); const state=loadDemoState(); const products=copy(state.products||demoProducts); const item=products.find(p=>p.id===id); if(item) item.onlineVisible=onlineVisible; state.products=products; saveDemoState(state); return item; },
  async recordOfflineSale({id,size,quantity=1,channel="Boutique"}) { if(baseUrl) return request("/api/admin/sales/offline",{method:"POST",body:JSON.stringify({productId:id,size,quantity,channel})}); const state=loadDemoState(); const products=copy(state.products||demoProducts); const item=products.find(p=>p.id===id); if(item){const stock=item.sizes.find(s=>s.label===size); if(stock){stock.available=Math.max(0,stock.available-quantity);if(item.sizes.every(s=>s.available===0)){item.stockStatus="sold_out";item.onlineVisible=false;}}} state.products=products; saveDemoState(state); return {ok:true,item}; },
  async getAppointments() { if(baseUrl) return request("/api/admin/appointments"); return copy(loadDemoState().appointments||demoAppointments); },
  async getSummary() { if(baseUrl) return request("/api/admin/summary"); return copy(demoSummary); }
};

