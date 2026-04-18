import { SquareClient, SquareEnvironment } from "square";

export default async (req, context) => {
  const { SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT } = process.env;

  if (!SQUARE_ACCESS_TOKEN) {
    return Response.json(
      { error: "SQUARE_ACCESS_TOKEN not set" },
      { status: 500 }
    );
  }

  const client = new SquareClient({
    token: SQUARE_ACCESS_TOKEN,
    environment:
      SQUARE_ENVIRONMENT === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });

  // Phase 1: list catalog items + inventory counts, shape into the
  // product JSON the storefront renders. Returns empty until then so
  // the deploy is safe.
  return Response.json({ items: [] });
};

export const config = {
  path: "/api/catalog",
};
