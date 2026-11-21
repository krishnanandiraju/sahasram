/** API contracts for Sahasram Online. Keep provider identifiers out of customer-facing payloads. */
export type Category = "Kurta Sets" | "Sarees" | "Customization" | "Kids" | "Kurtas" | "Anarkalis";
export type StockStatus = "in_stock" | "reserved" | "sold_out";

export interface ProductSize {
  label: string;
  available: number;
  stockByLocation?: Record<string, number>;
}

export interface ProductLabel {
  kind: "bestseller" | "window" | "handpicked" | "last_piece" | "wishlist" | "video_call" | "new";
  text: string;
  href?: string;
  activeUntil?: string;
}

export interface Product {
  id: string;
  sku: string;
  quickRef: string;
  name: string;
  shortDescription: string;
  category: Category;
  subCategory: string;
  price: number;
  mrp?: number;
  currency: "INR";
  taxInclusive: true;
  fabric: string;
  color: string;
  work: string;
  occasion: string[];
  /** Search vocabulary imported or curated for a backend catalog. */
  descriptors?: string[];
  /** Customer-facing dispatch estimate, e.g. "2–4 working days". */
  shipsIn?: string;
  /** Contents of a coordinated outfit, where applicable. */
  setPieces?: string[];
  sizes: ProductSize[];
  imageUrls: string[];
  onlineVisible: boolean;
  location: string;
  stockStatus: StockStatus;
  labels: ProductLabel[];
  createdAt: string;
}

export interface Offer {
  id: string;
  headline: string;
  startsAt: string;
  endsAt: string;
  rules: Array<{ type: "percent_off" | "buy_x_get_y"; buyQuantity?: number; freeQuantity?: number; percent?: number }>;
  automatic: boolean;
}

export interface AppointmentRequest {
  id?: string;
  purpose: "shopping" | "customization" | "fitting" | "studio_visit";
  mode: "WhatsApp video" | "Google Meet" | "Studio visit";
  date: string;
  slot: string;
  customerName: string;
  whatsapp: string;
  productIds: string[];
  notes?: string;
  status?: "new" | "scheduled" | "done" | "declined";
}

export interface Exhibition {
  id: string;
  name: string;
  city: string;
  venue: string;
  startDate: string;
  endDate: string;
  openingTime: string;
  closingTime: string;
  stall?: string;
  directionsUrl?: string;
}

export interface CartLine {
  productId: string;
  size: string;
  quantity: number;
}

export interface OrderDraft {
  customer: { name: string; mobile: string; email?: string; gstin?: string };
  delivery: "ship" | "studio_pickup";
  address?: { line1: string; city: string; state: string; pinCode: string };
  paymentMethod: "upi" | "card" | "netbanking" | "emi";
  lines: CartLine[];
}

export interface StoreSummary {
  grossSales: number;
  bills: number;
  piecesSold: number;
  averageBill: number;
  sellThroughPct: number;
  onlineStock: number;
  appointmentsPending: number;
}

