import { VARIATIONS, squareFetch } from "../../lib/square.js";

const TTL_MS = 5 * 60 * 1000;
let cache = { at: 0, body: null };

// Returns live Square prices (in dollars) for each storefront product,
// in the same order as the storefront's `sizes` arrays:
//   { prices: { earth: [39, 49], ... } }
export default async (req, context) => {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    return Response.json({ error: "SQUARE_ACCESS_TOKEN not set" }, { status: 500 });
  }

  if (cache.body && Date.now() - cache.at < TTL_MS) {
    return Response.json(cache.body);
  }

  try {
    const data = await squareFetch("/v2/catalog/batch-retrieve", {
      method: "POST",
      body: { object_ids: Object.values(VARIATIONS).flat() },
    });
    const cents = new Map(
      (data.objects || []).map((o) => [
        o.id,
        o.item_variation_data?.price_money?.amount ?? null,
      ])
    );
    const prices = {};
    for (const [id, variationIds] of Object.entries(VARIATIONS)) {
      prices[id] = variationIds.map((v) =>
        cents.get(v) != null ? Number(cents.get(v)) / 100 : null
      );
    }
    cache = { at: Date.now(), body: { prices } };
    return Response.json(cache.body);
  } catch (err) {
    console.error("catalog error", err.message);
    return Response.json({ error: "Catalog unavailable" }, { status: 502 });
  }
};

export const config = {
  path: "/api/catalog",
};
