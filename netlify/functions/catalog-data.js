// ============================================================================
// ZELLA BLENDS — INGREDIENT & STONE CATALOG
// ----------------------------------------------------------------------------
// This is the source of truth the Bespoke Blend wizard uses to compose
// recommendations. Edit freely — Claude reads this verbatim.
//
// Tip: Be expressive in `properties` and `notes`. The richer each entry,
// the more poetic and accurate the bespoke blends will be.
// ============================================================================

export const STONES = [
  { name: "Rose Quartz",        properties: ["self-love", "heart healing", "tenderness", "softening"],
    notes: "The stone of unconditional love. Soothes grief and invites gentleness toward the self." },
  { name: "Clear Quartz",       properties: ["clarity", "amplification", "intention", "focus"],
    notes: "Master amplifier. Magnifies the intentions held alongside it." },
  { name: "Amethyst",           properties: ["intuition", "calm", "spiritual sight", "rest"],
    notes: "Quiets mental noise; opens the third eye and crown." },
  { name: "Citrine",            properties: ["abundance", "joy", "creative spark", "confidence"],
    notes: "Sun-stone of vitality and prosperity. Burns through stagnation." },
  { name: "Black Tourmaline",   properties: ["protection", "grounding", "boundary", "release"],
    notes: "Forms an energetic shield; transmutes anxiety and external heaviness." },
  { name: "Carnelian",          properties: ["passion", "courage", "creativity", "sacral fire"],
    notes: "Stokes the inner flame; medicine for those who feel dimmed." },
  { name: "Moonstone",          properties: ["intuition", "feminine flow", "dreaming", "cycles"],
    notes: "Lunar guidance; honors the body's tides and inner knowing." },
  { name: "Tiger's Eye",        properties: ["confidence", "willpower", "discernment", "grounded power"],
    notes: "Roots vision into action; helps the seeker stand in their authority." },
  { name: "Moss Agate",         properties: ["grounding", "earth connection", "growth", "renewal"],
    notes: "The gardener's stone. Roots scattered energy back into the body." },
  { name: "Blue Lace Agate",    properties: ["calm communication", "throat clarity", "soothing"],
    notes: "Cools fevered minds; helps truth move through the throat softly." },
  { name: "Labradorite",        properties: ["transformation", "magic", "psychic shielding"],
    notes: "Stone of becoming; for those crossing thresholds." },
  { name: "Smoky Quartz",       properties: ["grounding", "release", "shadow integration"],
    notes: "Anchors the body and gently composts what no longer belongs." },
  { name: "Angelite",           properties: ["peace", "communication with the unseen", "lift"],
    notes: "Soft sky-blue; opens channels to higher guidance." },
  { name: "Garnet",             properties: ["devotion", "passion", "vitality", "root strength"],
    notes: "Deep red fire; reignites commitment to self and craft." },
  { name: "Sodalite",           properties: ["truth", "intellect", "intuitive logic"],
    notes: "Marries head and heart; clarifies confused thinking." },
  { name: "Lepidolite",         properties: ["anxiety relief", "transition", "deep rest"],
    notes: "Lithium-bearing; nature's sedative for the nervous system." }
];

export const OILS = [
  { name: "Rose Absolute",        family: "floral",   properties: ["heart opening", "tenderness", "feminine"],
    notes: "Queen of oils. Soft, romantic, profoundly healing for grief." },
  { name: "Jasmine",              family: "floral",   properties: ["sensuality", "joy", "confidence"],
    notes: "Heady, intoxicating; for reclaiming pleasure and presence." },
  { name: "Ylang Ylang",          family: "floral",   properties: ["softening", "sensuality", "release"],
    notes: "Sweet and lush; loosens the grip of perfectionism." },
  { name: "Geranium",             family: "floral",   properties: ["balance", "hormonal harmony", "uplift"],
    notes: "Bright rosy-green; equalizing for moody waters." },
  { name: "Lavender",             family: "herbal",   properties: ["calm", "rest", "soothing"],
    notes: "The gentlest medicine; ease for an overstimulated nervous system." },
  { name: "Clary Sage",           family: "herbal",   properties: ["intuition", "release", "feminine cycles"],
    notes: "Deeply herbal; cuts through emotional fog." },
  { name: "Rosemary",             family: "herbal",   properties: ["clarity", "memory", "focus"],
    notes: "Sharp and clean; for the mind that needs to think clearly again." },
  { name: "Eucalyptus",           family: "herbal",   properties: ["breath", "expansion", "clearing"],
    notes: "Opens the chest; cools an overheated system." },
  { name: "Bergamot",             family: "citrus",   properties: ["uplift", "lightness", "letting go"],
    notes: "Bittersweet citrus; lifts the heart without forcing cheer." },
  { name: "Sweet Orange",         family: "citrus",   properties: ["joy", "warmth", "playfulness"],
    notes: "Sun in a bottle; for those who've forgotten how to be silly." },
  { name: "Neroli",               family: "citrus",   properties: ["serenity", "self-acceptance", "softening"],
    notes: "Orange blossom; rare and luminous, calming to the heart." },
  { name: "Grapefruit",           family: "citrus",   properties: ["energy", "lift", "fresh start"],
    notes: "Bright and clean; cuts through heaviness." },
  { name: "Frankincense",         family: "resin",    properties: ["sacred presence", "meditation", "stillness"],
    notes: "Ancient ceremonial oil; deepens breath and prayer." },
  { name: "Myrrh",                family: "resin",    properties: ["grounding", "grief tending", "ancient"],
    notes: "Warm bitter resin; for tending to old wounds." },
  { name: "Palo Santo",           family: "resin",    properties: ["clearing", "blessing", "uplift"],
    notes: "Holy wood; sweet smoky lift and energetic cleansing." },
  { name: "Sandalwood",           family: "earthy",   properties: ["grounding", "devotion", "sensual presence"],
    notes: "Creamy, meditative; for sustained inner attention." },
  { name: "Vetiver",              family: "earthy",   properties: ["deep grounding", "rooting", "calm"],
    notes: "Smoky earth; the most grounding oil there is." },
  { name: "Cedarwood",            family: "earthy",   properties: ["strength", "steadiness", "sanctuary"],
    notes: "Forest-warm; builds an inner shelter." },
  { name: "Patchouli",            family: "earthy",   properties: ["sensuality", "abundance", "rooted"],
    notes: "Rich and dark; an old soul's oil." },
  { name: "Oakmoss",              family: "earthy",   properties: ["ancient", "forest", "memory"],
    notes: "Damp green earth; deep magical undertone." },
  { name: "Cinnamon Bark",        family: "spice",    properties: ["passion", "warmth", "vitality"],
    notes: "Use sparingly; ignites the sacral and solar plexus." },
  { name: "Black Pepper",         family: "spice",    properties: ["courage", "movement", "stamina"],
    notes: "Dispels stagnation; for those who need to move forward." },
  { name: "Cardamom",             family: "spice",    properties: ["expansion", "warmth", "creative spark"],
    notes: "Sweet, spicy lift; opens the chest and creative throat." }
];

// Optional: extra context Claude should know about Zella's house style.
export const HOUSE_NOTES = `
Every Zella blend pairs 2-4 stones with 3-6 essential oils carried in a base of
fractionated coconut oil. Blends are roller-bottle (10ml) format unless noted.
Tone: ceremonial, embodied, warm, never preachy. Speak as the alchemist Tab —
quietly knowing, never performative.
`.trim();
