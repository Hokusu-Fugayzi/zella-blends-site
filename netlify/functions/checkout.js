import crypto from "node:crypto";
import { VARIATIONS, BESPOKE_PRICE_CENTS, squareFetch } from "../../lib/square.js";

const MAX_LINES = 25;
const MAX_QTY = 20;

const clip = (s, n) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const names = (list) =>
  Array.isArray(list) ? list.map((x) => clip(x?.name, 60)).filter(Boolean).join(", ") : "";

function bespokeNote(recipe = {}) {
  return [
    `For: ${clip(recipe.recipientName, 80)} <${clip(recipe.recipientEmail, 120)}>`,
    `Blend: ${clip(recipe.blendName, 120)}`,
    `Intention: ${clip(recipe.intention, 200)}`,
    `Stones: ${names(recipe.stones)}`,
    `Oils: ${names(recipe.oils)}`,
  ]
    .join(" | ")
    .slice(0, 2000);
}

// Builds Square order line items from the storefront cart. Catalog prices
// come from Square, never from the browser.
function buildLineItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) {
    throw new Error("Cart is empty or too large");
  }
  return items.map((item) => {
    const qty = Number(item?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      throw new Error("Invalid quantity");
    }
    const id = String(item?.id ?? "");

    // Monthly lines (The Circle, subscribe-and-save) need Square subscription
    // plans and a separate checkout; refuse rather than charge them one time.
    if (item?.recurring || id === "circle") {
      throw new Error("Subscriptions are not available yet");
    }

    if (id.startsWith("bespoke")) {
      return {
        name: clip(`${item.recipe?.blendName || "Custom"} (Custom Blend, 10ml)`, 255),
        quantity: String(qty),
        base_price_money: { amount: BESPOKE_PRICE_CENTS, currency: "USD" },
        note: bespokeNote(item.recipe),
      };
    }

    const variationId = VARIATIONS[id]?.[Number(item.sizeIdx)];
    if (!variationId) throw new Error(`Unknown product: ${clip(id, 40)}`);
    return { catalog_object_id: variationId, quantity: String(qty) };
  });
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID } = process.env;
  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return Response.json({ error: "Square credentials not configured" }, { status: 500 });
  }

  let lineItems;
  try {
    const body = await req.json();
    lineItems = buildLineItems(body?.items);
  } catch (err) {
    return Response.json({ error: err.message || "Invalid cart" }, { status: 400 });
  }

  // Behind Fly's proxy the request arrives as http; trust the forwarded scheme.
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const origin = process.env.PUBLIC_URL || `${proto}://${url.host}`;
  const shippingCents = Number(process.env.SQUARE_SHIPPING_FEE_CENTS) || 0;

  const checkoutOptions = {
    ask_for_shipping_address: true,
    redirect_url: `${origin}/?order=complete`,
  };
  if (shippingCents > 0) {
    checkoutOptions.shipping_fee = {
      name: "Shipping",
      charge: { amount: shippingCents, currency: "USD" },
    };
  }

  try {
    const data = await squareFetch("/v2/online-checkout/payment-links", {
      method: "POST",
      body: {
        idempotency_key: crypto.randomUUID(),
        order: {
          location_id: SQUARE_LOCATION_ID,
          line_items: lineItems,
          pricing_options: {
            auto_apply_taxes: process.env.SQUARE_AUTO_APPLY_TAXES === "true",
          },
        },
        checkout_options: checkoutOptions,
      },
    });
    return Response.json({ url: data.payment_link.url });
  } catch (err) {
    console.error("checkout error", err.message);
    return Response.json({ error: "Could not start checkout" }, { status: 502 });
  }
};

export const config = {
  path: "/api/checkout",
};
