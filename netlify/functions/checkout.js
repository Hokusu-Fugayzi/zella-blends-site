import { SquareClient, SquareEnvironment } from "square";

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT } =
    process.env;

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return Response.json(
      { error: "Square credentials not configured" },
      { status: 500 }
    );
  }

  // Phase 2:
  //   1. Parse cart line items + payment token from Web Payments SDK
  //   2. Create Square Order via Orders API at SQUARE_LOCATION_ID
  //   3. Charge via Payments API with the source_id from the SDK
  //   4. Return { paymentId, orderId, receiptUrl } for the success screen

  return Response.json({ error: "Not implemented yet" }, { status: 501 });
};

export const config = {
  path: "/api/checkout",
};
