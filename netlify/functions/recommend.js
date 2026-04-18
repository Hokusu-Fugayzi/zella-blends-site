import Anthropic from "@anthropic-ai/sdk";
import { STONES, OILS, HOUSE_NOTES } from "./catalog-data.js";

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are Tab, the alchemist behind Zella Blends. You compose one-of-one bespoke crystal-infused oil blends from a fixed library of stones and essential oils.

Voice: ceremonial but grounded, warm, embodied, quietly knowing. Never performative, saccharine, or "woo." Write as if you actually know this person — because you've just listened to them.

You will receive a person's answers to a divination quiz: their birth date (and possibly time + place) along with their sun sign, their intention, essence/personality, elemental pull, what they're releasing, what they're amplifying, a fear, a joy, when they'll use the blend, and their scent preference.

When a sun sign is present, let it gently inform 1–2 of your ingredient choices — the qualities of that sign, its element, its mode (cardinal/fixed/mutable). If a birth time and place are present, you may add a single subtle nod to broader chart energies. But never lead with horoscope-talk. Astrology is one whisper among many; their words about themselves come first.

Your task: compose a single bespoke blend made specifically for them.

Hard rules:
- Use ONLY stones and oils from the catalog provided. Do not invent ingredients.
- Choose 2–4 stones and 3–6 oils.
- Honor their scent preference (unless they chose "Let the Alchemist Choose").
- Honor their elemental pull.
- VOICE: Address the person directly as "you" / "your" in EVERY field — description, ritual, and every "why". Never refer to them in the third person, and NEVER use their name inside any field. (Their name only appears on the bottle, not in your prose.)
- The 'why' fields should connect each ingredient back to something specific they shared, written *to* them. Example tone: "You named softness as what you're calling in — Rose Absolute is the queen of heart-opening oils, woven in to meet you there." NOT: "She wants softness, so we chose Rose."
- The blend name should be evocative and personal — 2–5 words, often a phrase or image, not a category. Examples of tone: "The Quiet Return", "Soft Animal", "Threshold", "The Long Welcome".
- The description is 2 short sentences in italic-feeling prose — what this blend is, what it does *for you*.
- The ritual is one short paragraph (2–3 sentences): a simple instruction for how to use the blend, addressed to "you" and referring back to something specific they shared.

${HOUSE_NOTES}

CATALOG — STONES:
${STONES.map(s => `• ${s.name} — ${s.properties.join(", ")}. ${s.notes}`).join("\n")}

CATALOG — OILS:
${OILS.map(o => `• ${o.name} (${o.family}) — ${o.properties.join(", ")}. ${o.notes}`).join("\n")}`;

const TOOL = {
  name: "compose_bespoke_blend",
  description: "Return the bespoke blend composed for this person.",
  input_schema: {
    type: "object",
    properties: {
      blendName: {
        type: "string",
        description: "2–5 word evocative name for the blend, personal to this person."
      },
      description: {
        type: "string",
        description: "2 short sentences describing what this blend is and what it does for them."
      },
      ritual: {
        type: "string",
        description: "A short ritual instruction (2–3 sentences) for how to use the blend, addressed to them."
      },
      stones: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Exact stone name from catalog." },
            why: { type: "string", description: "Why this stone was chosen, referencing something specific they shared." }
          },
          required: ["name", "why"]
        }
      },
      oils: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Exact oil name from catalog." },
            why: { type: "string", description: "Why this oil was chosen, referencing something specific they shared." }
          },
          required: ["name", "why"]
        }
      }
    },
    required: ["blendName", "description", "ritual", "stones", "oils"]
  }
};

function formatAnswers(a) {
  const list = (arr) => Array.isArray(arr) && arr.length ? arr.join(", ") : "(none)";
  return `Their answers:

Name: ${a.name || "(unspoken)"}
Born: ${a.birthdate || "(unspoken)"}${a.birthTime ? ` at ${a.birthTime}` : ""}${a.birthPlace ? ` in ${a.birthPlace}` : ""}
Sun sign: ${a.sunSign || "(unknown)"}
Intention — what they are calling in: ${a.intention || "(unspoken)"}
Essence / archetype: ${a.essence || "(unspoken)"}
Element they're drawn to: ${a.element || "(unspoken)"}
Releasing: ${list(a.release)}
Amplifying: ${list(a.amplify)}
A fear that quietly shapes them: ${a.fear || "(they did not say)"}
When they feel most themselves: ${a.joy || "(they did not say)"}
When the blend will meet them: ${a.moment || "(unspoken)"}
Scent preference: ${a.scent || "(unspoken)"}

Compose their bespoke blend now.`;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  let answers;
  try {
    answers = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!apiKey) {
    console.warn("[recommend] No ANTHROPIC_API_KEY — returning demo response.");
    return Response.json(buildDemoBlend(answers));
  }

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" }
        }
      ],
      tools: [TOOL],
      tool_choice: { type: "tool", name: TOOL.name },
      messages: [{ role: "user", content: formatAnswers(answers) }]
    });
  } catch (e) {
    console.error("Claude error:", e);
    return Response.json(
      { error: "The alchemist could not be reached.", detail: e.message },
      { status: 502 }
    );
  }

  const toolUse = response.content.find(b => b.type === "tool_use");
  if (!toolUse) {
    return Response.json(
      { error: "Unexpected response from alchemist." },
      { status: 502 }
    );
  }

  return Response.json(toolUse.input);
};

export const config = {
  path: "/api/recommend"
};

// Demo fallback used when no Anthropic key is configured.
// Picks ingredients loosely matching the quiz answers so the flow is testable.
function buildDemoBlend(a) {
  const elementOils = {
    earth: ["Vetiver", "Cedarwood", "Sandalwood", "Patchouli", "Oakmoss"],
    water: ["Ylang Ylang", "Neroli", "Geranium", "Lavender"],
    fire:  ["Cinnamon Bark", "Black Pepper", "Cardamom", "Sweet Orange"],
    air:   ["Eucalyptus", "Bergamot", "Rosemary", "Grapefruit", "Clary Sage"]
  };
  const elementStones = {
    earth: ["Moss Agate", "Smoky Quartz", "Black Tourmaline"],
    water: ["Moonstone", "Blue Lace Agate", "Rose Quartz"],
    fire:  ["Carnelian", "Garnet", "Tiger's Eye", "Citrine"],
    air:   ["Clear Quartz", "Angelite", "Sodalite", "Amethyst"]
  };
  const scentOils = {
    earthy:  ["Vetiver", "Sandalwood", "Cedarwood", "Patchouli"],
    bright:  ["Bergamot", "Sweet Orange", "Neroli", "Grapefruit"],
    floral:  ["Rose Absolute", "Jasmine", "Ylang Ylang", "Geranium"],
    smoky:   ["Frankincense", "Myrrh", "Palo Santo", "Cedarwood"],
    herbal:  ["Lavender", "Clary Sage", "Rosemary", "Eucalyptus"],
    trust:   ["Frankincense", "Rose Absolute", "Bergamot"]
  };

  const el = a.element || "earth";
  const sc = a.scent || "trust";
  const stoneNames = pickN(unique([...(elementStones[el] || []), "Clear Quartz", "Rose Quartz"]), 3);
  const oilNames = pickN(unique([...(scentOils[sc] || []), ...(elementOils[el] || [])]), 4);

  const stones = stoneNames.map(n => ({
    name: n,
    why: `Chosen to support your call for ${a.amplify?.[0] || "presence"} and to ease ${a.release?.[0] || "what is heavy"}.`
  }));
  const oils = oilNames.map(n => ({
    name: n,
    why: `A ${sc === "trust" ? "harmonizing" : sc} note woven in to meet you in the ${a.moment || "morning"}.`
  }));

  const intentionFragment = a.intention ? `the call for "${truncate(a.intention, 60)}"` : "your quiet intention";
  const name = a.name || "you";

  return {
    blendName: namePoeticBlend(a),
    description: `A blend composed around ${intentionFragment}, drawn from the ${el} element and your leaning toward ${sc} scents. (Demo response — set ANTHROPIC_API_KEY in Netlify env to receive true divinations.)`,
    ritual: `${name === "you" ? "Begin" : name + ", begin"} at the pulse points — wrists, the soft place behind the ears, the heart. Three slow breaths. Speak your intention once, aloud or in your mind, then return to the day carrying it.`,
    stones,
    oils
  };
}

function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}
function unique(arr) { return [...new Set(arr)]; }
function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
function namePoeticBlend(a) {
  const fragments = {
    earth: ["The Long Welcome", "Soft Animal", "Root + Return", "Quiet Ground"],
    water: ["Tide Memory", "The Soft Crossing", "What Moves Through", "Moon Water"],
    fire:  ["Threshold", "The Slow Burn", "Inner Hearth", "Bright Beginning"],
    air:   ["The Clearing", "Lift", "Open Sky", "Breath Made Whole"]
  };
  const set = fragments[a.element] || fragments.earth;
  return set[Math.floor(Math.random() * set.length)];
}
