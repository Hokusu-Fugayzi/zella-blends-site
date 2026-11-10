// Shared Square config: storefront product id -> Square catalog variation ids.
// Index in each array matches the `sizes` index in assets/site.js PRODUCTS.
export const VARIATIONS = {
  earth: ["63NAN4YZWRUGQR3SUDR6C2T4", "NUAIPXWWIALCM5ZLEU6OS5ZE"],
  water: ["I3NGPLXUP46VF5PGISVHRQFT", "NUKBCXPZWSHAGNC5W6RGLKQL"],
  fire: ["ONZMNUBZWQP34GUIRWYNXZ2J", "S3W6FR5TLNOFQ4MKW6JHIF7Z"],
  air: ["KYRZH4MBJBJSHLHONNOV3PU5", "UGDVCBSTZ5GMEYQYG6RFEMBL"],
  "elemental-bundle": ["C3WME4JW37YIAJ453CIVIT2U", "CIOL45R6G37TBUWS7Q5MIO7V"],
  signature: ["V3BNSZ46UO4VPHYXNR4PMD7H", "DWRNLQTWLBCWY54E6EH2TEAF"],
  "signature-bundle": ["RE3A7VRVCBKCCM7PR24XHSH5", "WKY3QS7N7W4ZPDM6RQFARQEN"],
  "body-oil": ["LWO7BQL27KB3T7GMU6GZVY6V"],
  spray: ["M4QVARPZK5B266LXQZIW3QOG"],
  diffuser: ["2LUQSBOLJFYBM7OQDRJPXVN3", "C6NT4PPVO77K2VZYDWEOHJSL"],
  halloween: [
    "3LPXL4V4QJCLGJYC2KLOGRS2",
    "LFRZTHKUVVZ5B52YMPVSER7S",
    "67AZZTF2K3RTTEW5AV5Z6Z34",
  ],
  yuletide: ["ALSKIPEWYSJH5NRHZCEUGYUM"],
  "spiced-fir": ["NPVTDPUJPF37YGPR7YEPSHOQ"],
  experience: ["OKQIYO7TKF3HO4UUZT3HIHMT", "S3K444FVCIHOK5OX64T2RM2L"],
};

// Custom blends are one-of-one, so they are sold as an ad hoc line item.
export const BESPOKE_PRICE_CENTS = 8900;

const SQUARE_VERSION = "2025-01-23";

export function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export async function squareFetch(path, { method = "GET", body } = {}) {
  const res = await fetch(squareBaseUrl() + path, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.errors?.map((e) => e.detail || e.code).join("; ");
    throw new Error(`Square ${method} ${path} failed (${res.status}): ${detail}`);
  }
  return data;
}
