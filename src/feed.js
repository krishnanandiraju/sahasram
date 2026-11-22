// Maps BoutiqueOS Storefront Feed v1 products (see the PRD "Data contract")
// into the product shape the page code uses. Keep every feed assumption here.

const LABEL_TEXT = {new: "New arrival", handpicked: "Handpicked", window: "In our window this week", bestseller: "Bestseller"};

// Friendly names for style and occasion values. Anything not listed is shown
// title-cased, so new tags added in BoutiqueOS appear without a code change.
export const STYLE_LABELS = {
  anarkali: "Anarkali sets", ajrakh: "Block print & ajrakh", printed: "Printed sets", "pin-tuck": "Pin-tuck & pleats",
  kutch: "Mirror & Kutch work", embroidered: "Embroidered sets", silk: "Silk & occasion", kaftan: "Kaftans & dresses",
  straight: "Straight kurtas", "a-line": "A-line kurtas", angrakha: "Angrakha styles",
};
const titleCase = (s) => String(s).replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
export const styleLabel = (slug) => STYLE_LABELS[slug] || titleCase(slug);

// Feed size labels are "M / 38"; one-size items have no variant.
const sizeFrom = (s) => ({label: s.label, available: s.status === "available" ? Math.max(1, Number(s.available) || 0) : 0, status: s.status, variantId: s.variant_id, sku: s.sku});

const ROLE_ORDER = {front: 0, model: 1, back: 2, detail: 3, flatlay: 4};

export function fromFeed(p) {
  const tags = p.tags || [];
  const labels = tags.filter(t => LABEL_TEXT[t]).map(t => ({kind: t, text: LABEL_TEXT[t]}));
  const status = p.stock?.status || "in_stock";
  if (status === "last_piece") labels.push({kind: "last_piece", text: "Last piece"});
  const images = [...(p.images || [])].sort((a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9));
  const styles = p.styles || [];
  const occasion = p.occasions || [];
  return {
    id: p.id, slug: p.slug, sku: p.sku, quickRef: p.sku, name: p.name,
    shortDescription: (p.description || "").replace(/\.$/, ""),
    category: p.category, subCategory: p.sub_category || p.category,
    price: p.price.amount, mrp: p.price.mrp || p.price.amount, currency: p.price.currency, taxInclusive: p.price.tax_inclusive,
    fabric: p.fabric || "", color: p.color?.name || "", swatch: p.color?.hex || images[0]?.dominant_color || "#CDB79A",
    work: p.work || "", setPieces: p.set_pieces || [], occasion, styles,
    sizes: (p.sizes || []).map(sizeFrom), stockStatus: status,
    labels, images, imageUrls: images.map(img => bestUrl(img)),
    createdAt: p.arrived_at || p.published_at || p.updated_at || "",
    version: p.version, onlineVisible: true,
    descriptors: [p.category, p.sub_category, p.fabric, p.color?.name, p.work, ...occasion, ...styles.map(styleLabel), ...tags].filter(Boolean),
  };
}

// Largest JPEG (always present per the contract), else the largest rendition.
export function bestUrl(img) {
  const r = img.renditions || [];
  const jpeg = r.filter(x => x.format === "jpeg").sort((a, b) => b.width - a.width)[0];
  return (jpeg || [...r].sort((a, b) => b.width - a.width)[0])?.url || "";
}

// Applies a live /availability answer to a product in place.
export function applyAvailability(product, live) {
  if (!live) return;
  if (live.found === false) { product.stockStatus = "sold_out"; product.sizes.forEach(s => { s.available = 0; s.status = "sold_out"; }); return; }
  product.stockStatus = live.stock?.status || product.stockStatus;
  if (live.sizes) product.sizes = live.sizes.map(sizeFrom);
  product.labels = product.labels.filter(l => l.kind !== "last_piece");
  if (product.stockStatus === "last_piece") product.labels.push({kind: "last_piece", text: "Last piece"});
}
