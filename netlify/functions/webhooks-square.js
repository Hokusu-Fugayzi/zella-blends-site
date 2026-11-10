import crypto from "node:crypto";

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { SQUARE_WEBHOOK_SIGNATURE_KEY } = process.env;
  const publicUrl = process.env.PUBLIC_URL || process.env.URL;

  if (!SQUARE_WEBHOOK_SIGNATURE_KEY || !publicUrl) {
    return new Response("Webhook key or PUBLIC_URL not configured", { status: 500 });
  }

  const signature = req.headers.get("x-square-hmacsha256-signature");
  const body = await req.text();
  const notificationUrl = `${publicUrl}/api/webhooks/square`;

  const expected = crypto
    .createHmac("sha256", SQUARE_WEBHOOK_SIGNATURE_KEY)
    .update(notificationUrl + body)
    .digest("base64");

  if (!signature || signature.length !== expected.length) {
    return new Response("Invalid signature", { status: 401 });
  }
  const valid = crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);

  // Phase 3: dispatch on event.type
  //   payment.updated      → if status COMPLETED, fire Meta CAPI Purchase
  //   inventory.count.updated → optional: invalidate any catalog cache
  console.log("square webhook", event.type, event.event_id);

  return new Response("ok", { status: 200 });
};

export const config = {
  path: "/api/webhooks/square",
};
