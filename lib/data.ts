/* Curated reference data for Payir. Every figure is from tonight's research;
   sources are noted per table. Verify against the official notification
   before relying on a deadline — dates change, prices don't lie. */

export interface MspRow {
  cropEn: string;
  cropTa: string;
  msp: number; // ₹ per quintal, KMS 2026-27
  increase: number; // ₹ increase over 2025-26
  margin: number | null; // % margin over cost of production
  group: "Cereals" | "Pulses" | "Oilseeds" | "Commercial";
}

/* Source: PIB press release, 13 May 2026 — CCEA approves MSP for 14 kharif
   crops for Marketing Season 2026-27. */
export const MSP_2026_27: MspRow[] = [
  { cropEn: "Paddy (Common)", cropTa: "நெல் (சாதாரண)", msp: 2441, increase: 72, margin: 50, group: "Cereals" },
  { cropEn: "Paddy (Grade A)", cropTa: "நெல் (A தரம்)", msp: 2461, increase: 72, margin: null, group: "Cereals" },
  { cropEn: "Jowar (Hybrid)", cropTa: "சோளம்", msp: 4023, increase: 324, margin: 50, group: "Cereals" },
  { cropEn: "Bajra", cropTa: "கம்பு", msp: 2900, increase: 125, margin: 56, group: "Cereals" },
  { cropEn: "Ragi", cropTa: "கேழ்வரகு", msp: 5205, increase: 319, margin: 50, group: "Cereals" },
  { cropEn: "Maize", cropTa: "மக்காச்சோளம்", msp: 2410, increase: 10, margin: 56, group: "Cereals" },
  { cropEn: "Tur / Arhar", cropTa: "துவரை", msp: 8450, increase: 450, margin: 54, group: "Pulses" },
  { cropEn: "Moong", cropTa: "பச்சைப்பயறு", msp: 8780, increase: 12, margin: 61, group: "Pulses" },
  { cropEn: "Urad", cropTa: "உளுந்து", msp: 8200, increase: 400, margin: 51, group: "Pulses" },
  { cropEn: "Groundnut", cropTa: "நிலக்கடலை", msp: 7517, increase: 254, margin: 50, group: "Oilseeds" },
  { cropEn: "Sunflower seed", cropTa: "சூரியகாந்தி", msp: 8343, increase: 622, margin: 50, group: "Oilseeds" },
  { cropEn: "Soybean (Yellow)", cropTa: "சோயா", msp: 5708, increase: 380, margin: 50, group: "Oilseeds" },
  { cropEn: "Sesamum", cropTa: "எள்", msp: 10346, increase: 500, margin: 50, group: "Oilseeds" },
  { cropEn: "Nigerseed", cropTa: "பயறுவகை", msp: 10052, increase: 515, margin: 50, group: "Oilseeds" },
  { cropEn: "Cotton (Medium staple)", cropTa: "பருத்தி", msp: 8267, increase: 557, margin: 50, group: "Commercial" },
];

/* Match a free-text ledger plot crop ("Paddy", "Samba paddy", "cotton Bt")
   to its MSP table row. Shared by the ledger's break-even badge and the
   price board's cost-of-production verdict — one matcher, one behaviour. */
export function mspForCrop(cropName: string): MspRow | undefined {
  const first = cropName.trim().toLowerCase().split(" ")[0];
  if (!first) return undefined;
  return MSP_2026_27.find((m) => m.cropEn.toLowerCase().includes(first));
}

export interface SeasonBand {
  id: string;
  nameEn: string;
  nameTa: string;
  cropEn: string;
  sow: [number, number]; // month indexes 0-11
  harvest: [number, number];
  noteEn: string;
  noteTa: string;
}

/* Source: eAgri / TN agriculture department season tables. Month 0 = January. */
export const SEASONS: SeasonBand[] = [
  { id: "kuruvai", nameEn: "Kuruvai", nameTa: "குறுவை", cropEn: "Paddy", sow: [5, 6], harvest: [9, 10], noteEn: "Early paddy. Needs assured canal water or borewell.", noteTa: "முந்தைய நெல். கால்வாய் அல்லது கிணற்று நீர் தேவை." },
  { id: "early-samba", nameEn: "Early Samba", nameTa: "முன் சம்பா", cropEn: "Paddy", sow: [6, 7], harvest: [11, 0], noteEn: "130–135 day varieties.", noteTa: "130–135 நாள் ரகங்கள்." },
  { id: "samba", nameEn: "Samba", nameTa: "சம்பா", cropEn: "Paddy", sow: [7, 7], harvest: [0, 1], noteEn: "The main paddy season of Tamil Nadu.", noteTa: "தமிழ்நாட்டின் முக்கிய நெல் பருவம்." },
  { id: "late-samba", nameEn: "Late Samba", nameTa: "பின் சம்பா", cropEn: "Paddy", sow: [8, 9], harvest: [0, 1], noteEn: "Where kuruvai harvest ran late.", noteTa: "குறுவை அறுவடை தாமதமான இடங்களில்." },
  { id: "thaladi", nameEn: "Thaladi", nameTa: "தாளடி", cropEn: "Paddy", sow: [8, 9], harvest: [0, 1], noteEn: "Pishanam belt (Thirunelveli, Kanyakumari).", noteTa: "பிசானம் பகுதி (திருநெல்வேலி, கன்னியாகுமரி)." },
  { id: "late-thaladi", nameEn: "Late Thaladi", nameTa: "பின் தாளடி", cropEn: "Paddy", sow: [9, 10], harvest: [1, 2], noteEn: "115–120 day varieties, delta districts.", noteTa: "115–120 நாள் ரகங்கள், டெல்டா மாவட்டங்கள்." },
  { id: "navarai", nameEn: "Navarai", nameTa: "நவரை", cropEn: "Paddy", sow: [11, 0], harvest: [2, 3], noteEn: "Short-duration summer paddy with irrigation.", noteTa: "நீர்ப்பாசனத்துடன் குறுகிய கால கோடை நெல்." },
  { id: "sornavari", nameEn: "Sornavari", nameTa: "சொர்ணவாரி", cropEn: "Paddy", sow: [3, 4], harvest: [7, 8], noteEn: "Chengalpattu–Arcot belt.", noteTa: "செங்கல்பட்டு–ஆற்காடு பகுதி." },
  { id: "kar", nameEn: "Kar", nameTa: "கார்", cropEn: "Paddy", sow: [4, 5], harvest: [7, 8], noteEn: "Kannipoo season, southern districts.", noteTa: "கன்னிப்பூ பருவம், தென் மாவட்டங்கள்." },
  { id: "cotton-winter", nameEn: "Winter cotton", nameTa: "குளிர் பருத்தி", cropEn: "Cotton", sow: [7, 8], harvest: [1, 2], noteEn: "Irrigated winter sowing.", noteTa: "நீர்ப்பாசன குளிர்கால விதைப்பு." },
  { id: "cotton-summer", nameEn: "Summer cotton", nameTa: "கோடை பருத்தி", cropEn: "Cotton", sow: [1, 2], harvest: [6, 7], noteEn: "Summer sowing; also rice-fallow Jan–Feb.", noteTa: "கோடை விதைப்பு; நெல் தரிசிலும் ஜன–பிப்." },
  { id: "cane-early", nameEn: "Sugarcane (early)", nameTa: "கரும்பு (முன்)", cropEn: "Sugarcane", sow: [11, 0], harvest: [10, 11], noteEn: "12-month crop; highest recovery.", noteTa: "12 மாதப் பயிர்; அதிக சர்க்கரை மீட்பு." },
  { id: "cane-mid", nameEn: "Sugarcane (mid)", nameTa: "கரும்பு (நடு)", cropEn: "Sugarcane", sow: [1, 2], harvest: [0, 1], noteEn: "12-month crop.", noteTa: "12 மாதப் பயிர்." },
  { id: "cane-late", nameEn: "Sugarcane (late)", nameTa: "கரும்பு (பின்)", cropEn: "Sugarcane", sow: [3, 4], harvest: [2, 3], noteEn: "Lower recovery than early season.", noteTa: "முன் பருவத்தை விட குறைந்த மீட்பு." },
];

export interface DoctorCrop {
  id: string;
  nameEn: string;
  nameTa: string;
  parts: { id: string; en: string; ta: string }[];
}

export const DOCTOR_CROPS: DoctorCrop[] = [
  { id: "paddy", nameEn: "Paddy", nameTa: "நெல்", parts: [
    { id: "leaf", en: "Leaf", ta: "இலை" }, { id: "stem", en: "Stem / tiller", ta: "தண்டு" },
    { id: "panicle", en: "Panicle / grain", ta: "கதிர்" }, { id: "whole", en: "Whole plant", ta: "முழுச் செடி" } ] },
  { id: "cotton", nameEn: "Cotton", nameTa: "பருத்தி", parts: [
    { id: "leaf", en: "Leaf", ta: "இலை" }, { id: "boll", en: "Boll / flower", ta: "காய் / பூ" },
    { id: "whole", en: "Whole plant", ta: "முழுச் செடி" } ] },
  { id: "groundnut", nameEn: "Groundnut", nameTa: "நிலக்கடலை", parts: [
    { id: "leaf", en: "Leaf", ta: "இலை" }, { id: "root", en: "Root / collar", ta: "வேர்" },
    { id: "whole", en: "Whole plant", ta: "முழுச் செடி" } ] },
  { id: "sugarcane", nameEn: "Sugarcane", nameTa: "கரும்பு", parts: [
    { id: "leaf", en: "Leaf", ta: "இலை" }, { id: "stem", en: "Cane / stalk", ta: "கரும்புத் தண்டு" },
    { id: "whole", en: "Whole plant", ta: "முழுச் செடி" } ] },
  { id: "banana", nameEn: "Banana", nameTa: "வாழை", parts: [
    { id: "leaf", en: "Leaf", ta: "இலை" }, { id: "stem", en: "Pseudostem", ta: "பொய்த்தண்டு" },
    { id: "whole", en: "Whole plant", ta: "முழுச் செடி" } ] },
  { id: "coconut", nameEn: "Coconut", nameTa: "தென்னை", parts: [
    { id: "leaf", en: "Frond / leaf", ta: "ஓலை" }, { id: "stem", en: "Trunk / crown", ta: "தண்டு / குருத்து" },
    { id: "fruit", en: "Nut / bunch", ta: "தேங்காய்" }, { id: "whole", en: "Whole palm", ta: "முழு மரம்" } ] },
  { id: "maize", nameEn: "Maize", nameTa: "சோளம்", parts: [
    { id: "leaf", en: "Leaf", ta: "இலை" }, { id: "stem", en: "Stem / whorl", ta: "தண்டு / குருத்து" },
    { id: "cob", en: "Cob / grain", ta: "கதிர்" }, { id: "whole", en: "Whole plant", ta: "முழுச் செடி" } ] },
  { id: "turmeric", nameEn: "Turmeric", nameTa: "மஞ்சள்", parts: [
    { id: "leaf", en: "Leaf", ta: "இலை" }, { id: "stem", en: "Rhizome / stem base", ta: "கிழங்கு / அடித்தண்டு" },
    { id: "whole", en: "Whole plant", ta: "முழுச் செடி" } ] },
];

export interface Symptom {
  id: string;
  en: string;
  ta: string;
}

export const SYMPTOMS: Symptom[] = [
  { id: "spots", en: "Spots on leaves", ta: "இலையில் புள்ளிகள்" },
  { id: "yellowing", en: "Yellowing of leaves", ta: "இலை மஞ்சளாதல்" },
  { id: "wilting", en: "Wilting / drying", ta: "வாடல் / காய்தல்" },
  { id: "stunting", en: "Stunted growth", ta: "வளர்ச்சி குன்றல்" },
  { id: "holes", en: "Holes / chewed leaves", ta: "இலையில் துளைகள் / கடித்தல்" },
  { id: "curling", en: "Leaf curling / distortion", ta: "இலை சுருள்தல்" },
  { id: "rotting", en: "Rot at base / stem", ta: "அடித்தண்டில் அழுகல்" },
  { id: "insects", en: "Visible insects on plant", ta: "செடியில் பூச்சிகள் தெரிதல்" },
  { id: "dead-heart", en: "Dead heart (central shoot dies)", ta: "குருத்து காய்தல்" },
  { id: "white-ears", en: "White empty panicles", ta: "வெள்ளை வெற்றுக் கதிர்கள்" },
  { id: "discolour-grain", en: "Discoloured / shrivelled grain", ta: "நிறமாறிய / சுருங்கிய தானியம்" },
  { id: "smell", en: "Bad smell from stem", ta: "தண்டிலிருந்து துர்நாற்றம்" },
];

export interface DoctorDiag {
  id: string;
  crop: string;
  parts: string[];
  symptoms: string[];
  nameEn: string;
  nameTa: string;
  urgency: "watch" | "act" | "urgent";
  aboutEn: string;
  aboutTa: string;
  organicEn: string[];
  organicTa: string[];
  chemicalEn: string[];
  chemicalTa: string[];
  preventEn: string[];
  preventTa: string[];
}

/* Curated from standard agronomy references (TNAU crop production guides,
   IRRI rice knowledge bank patterns). This is guidance, not a lab test —
   the app says so on every result. */
export const DIAGNOSES: DoctorDiag[] = [
  {
    id: "paddy-blast", crop: "paddy", parts: ["leaf", "panicle"], symptoms: ["spots"],
    nameEn: "Rice blast", nameTa: "நெல் குலைநோய்",
    urgency: "urgent",
    aboutEn: "Fungal disease. Spindle-shaped spots with grey centres and brown margins on leaves; on the panicle neck it causes 'neck blast' and empty grains. Spreads fast in cool, humid weather.",
    aboutTa: "பூஞ்சை நோய். இலையில் சாம்பல் நடுவுடன் கூடிய புள்ளிகள்; கதிரில் வெற்றுக் கதிர்கள். குளிர் ஈரப்பத காலத்தில் வேகமாகப் பரவும்.",
    organicEn: ["Spray neem seed kernel extract 5% at early signs.", "Avoid excess nitrogen — split urea doses.", "Drain the field for a day to break humidity."],
    organicTa: ["வேப்பங்கொட்டைச் சாறு 5% தெளிக்கவும்.", "யூரியாவைப் பிரித்து இடவும்; அதிக தழைச்சத்து தவிர்க்கவும்.", "வயல் நீரை ஒரு நாள் வடிக்கவும்."],
    chemicalEn: ["Tricyclazole 75% WP — 0.6 g per litre, as per label.", "Repeat after 10–12 days if new spots appear.", "Spray in the evening; never mix blindly."],
    chemicalTa: ["டிரைசைக்ளசோல் 75% — லிட்டருக்கு 0.6 கிராம் (லேபிள் படி).", "புதிய புள்ளிகள் வந்தால் 10–12 நாளில் மீண்டும்.", "மாலையில் தெளிக்கவும்."],
    preventEn: ["Use blast-resistant varieties next season.", "Burn or bury infected stubble after harvest.", "Seed treatment with Trichoderma before sowing."],
    preventTa: ["அடுத்த பருவம் நோய் எதிர்ப்பு ரகம் பயன்படுத்தவும்.", "அறுவடைக்குப் பின் பாதித்த வைக்கோலை எரிக்கவும்.", "விதைப்புக்கு முன் டிரைக்கோடெர்மா நேர்த்தி."],
  },
  {
    id: "paddy-blb", crop: "paddy", parts: ["leaf"], symptoms: ["yellowing", "wilting"],
    nameEn: "Bacterial leaf blight", nameTa: "இலை கருகல் நோய்",
    urgency: "act",
    aboutEn: "Bacterial disease. Water-soaked streaks turn yellow-white from the leaf tip downward; leaves dry up. Enters through wounds — worse after storms or floods.",
    aboutTa: "பாக்டீரியா நோய். இலை நுனியிலிருந்து மஞ்சளாகிக் காயும். புயல்/வெள்ளத்திற்குப் பின் அதிகம்.",
    organicEn: ["Spray Pseudomonas fluorescens 0.5% as a preventive.", "Avoid field-to-field irrigation flow from infected plots."],
    organicTa: ["சூடோமோனாஸ் 0.5% தெளிப்பு (தடுப்பு).", "பாதித்த வயலிலிருந்து நீர் பாயாமல் தடுக்கவும்."],
    chemicalEn: ["Copper-based bactericides as per label, only on advice.", "No cure once severe — protect the flag leaf."],
    chemicalTa: ["தாமிர மருந்துகள் — லேபிள் படி மட்டும்.", "முற்றியபின் குணம் இல்லை — கொடி இலையைக் காக்கவும்."],
    preventEn: ["Use disease-free certified seed.", "Do not clip seedling leaf tips at transplanting.", "Balance nitrogen with potash."],
    preventTa: ["சான்று பெற்ற விதை பயன்படுத்தவும்.", "நடவின்போது நாற்று நுனியைக் கிள்ள வேண்டாம்.", "சாம்பல் சத்துடன் சமநிலை உரம்."],
  },
  {
    id: "paddy-stemborer", crop: "paddy", parts: ["stem", "panicle", "whole"], symptoms: ["dead-heart", "white-ears"],
    nameEn: "Stem borer", nameTa: "தண்டுத் துளைப்பான்",
    urgency: "urgent",
    aboutEn: "Caterpillar bores into the stem. Young crop shows 'dead hearts' (central shoot dries); later, 'white ears' — empty white panicles. Each white ear is a lost panicle of grain.",
    aboutTa: "புழு தண்டுக்குள் துளைக்கும். இளம் பயிரில் குருத்து காயும்; பின் வெள்ளை வெற்றுக் கதிர்கள். ஒவ்வொரு வெற்றுக் கதிரும் இழந்த தானியம்.",
    organicEn: ["Release Trichogramma parasitoids (1 lakh per ha) at egg-laying.", "Set up light traps to catch moths at night.", "Clip and destroy egg masses on leaf tips."],
    organicTa: ["டிரைக்கோகிராம்மா ஒட்டுண்ணிகள் விடவும்.", "இரவில் விளக்குப் பொறி வைக்கவும்.", "இலை நுனி முட்டைக் கூட்டங்களை அழிக்கவும்."],
    chemicalEn: ["Cartap hydrochloride or chlorantraniliprole as per label.", "Apply only when dead hearts cross 5% — not on schedule."],
    chemicalTa: ["கார்டாப் அல்லது குளோரான்டிரானிலிப்ரோல் — லேபிள் படி.", "குருத்து காய்தல் 5% தாண்டினால் மட்டும்."],
    preventEn: ["Plough and burn stubble to kill hibernating larvae.", "Synchronised planting across the village breaks the cycle.", "Avoid late transplanting."],
    preventTa: ["உழுது வைக்கோலை அழித்து புழுக்களைக் கொல்லவும்.", "ஊர் முழுதும் ஒரே நேர நடவு.", "தாமத நடவு தவிர்க்கவும்."],
  },
  {
    id: "paddy-sheathblight", crop: "paddy", parts: ["stem", "leaf"], symptoms: ["spots", "rotting"],
    nameEn: "Sheath blight", nameTa: "உறை கருகல் நோய்",
    urgency: "act",
    aboutEn: "Fungal. Oval grey-green spots with brown borders on the leaf sheath near the water line; spreads upward and can rot the whole tiller in dense, humid crops.",
    aboutTa: "பூஞ்சை நோய். நீர்மட்ட அருகே உறையில் பழுப்பு விளிம்புடன் புள்ளிகள்; அடர்ந்த பயிரில் மேலே பரவும்.",
    organicEn: ["Reduce plant density — wider spacing lets air in.", "Spray Pseudomonas fluorescens.", "Drain excess water for 2–3 days."],
    organicTa: ["இடைவெளி அதிகரித்து காற்றோட்டம் தரவும்.", "சூடோமோனாஸ் தெளிக்கவும்.", "2–3 நாள் நீர் வடிக்கவும்."],
    chemicalEn: ["Validamycin or hexaconazole as per label at early spread.", "Target the base of the plant, not just the top."],
    chemicalTa: ["வாலிடாமைசின்/ஹெக்சகோனசோல் — லேபிள் படி.", "செடியின் அடிப்பகுதியில் தெளிக்கவும்."],
    preventEn: ["Do not over-apply nitrogen.", "Remove weed hosts around bunds.", "Rotate with a non-cereal crop."],
    preventTa: ["அதிக தழைச்சத்து வேண்டாம்.", "வரப்பு களைகளை அகற்றவும்.", "தானியமல்லா பயிருடன் சுழற்சி."],
  },
  {
    id: "paddy-tungro", crop: "paddy", parts: ["whole", "leaf"], symptoms: ["stunting", "yellowing"],
    nameEn: "Tungro virus", nameTa: "துங்ரோ வைரஸ்",
    urgency: "urgent",
    aboutEn: "Viral disease spread by green leafhoppers. Plants stunt badly with orange-yellow leaves and few tillers. There is no cure — control the vector and rogue infected hills early.",
    aboutTa: "பச்சைத் தத்துப்பூச்சியால் பரவும் வைரஸ். செடி குன்றி ஆரஞ்சு-மஞ்சள் இலைகள். குணம் இல்லை — பூச்சியைக் கட்டுப்படுத்தி பாதித்த செடிகளை அகற்றவும்.",
    organicEn: ["Uproot and bury infected hills immediately.", "Grow a dense nursery and rogue hopper-infested seedlings."],
    organicTa: ["பாதித்த செடிகளை உடனே பிடுங்கி புதைக்கவும்.", "நாற்றங்காலில் பூச்சி செடிகளை அகற்றவும்."],
    chemicalEn: ["Control leafhoppers with recommended insecticide only if hoppers are heavy.", "Spraying the virus itself is useless — target the vector."],
    chemicalTa: ["தத்துப்பூச்சி அதிகமிருந்தால் மட்டும் மருந்து.", "வைரஸுக்கு மருந்து இல்லை — பூச்சியைக் குறிவைக்கவும்."],
    preventEn: ["Plant resistant varieties in endemic areas.", "Destroy stubble and ratoons after harvest.", "Synchronised planting starves the hoppers."],
    preventTa: ["நோய் பகுதியில் எதிர்ப்பு ரகம்.", "அறுவடைக்குப் பின் தாள்களை அழிக்கவும்.", "ஒரே நேர நடவு."],
  },
  {
    id: "cotton-pinkbollworm", crop: "cotton", parts: ["boll"], symptoms: ["insects", "rotting", "discolour-grain"],
    nameEn: "Pink bollworm", nameTa: "இளஞ்சிவப்பு காய்ப்புழு",
    urgency: "urgent",
    aboutEn: "Larvae feed inside the boll — flowers look 'rosetted', bolls don't open properly, lint is stained. Bt cotton resistance is rising, so scouting matters more than ever.",
    aboutTa: "புழு காய்க்குள் தின்னும் — பூக்கள் முறுக்கும், காய் திறக்காது. Bt எதிர்ப்பு அதிகரிப்பதால் கண்காணிப்பு முக்கியம்.",
    organicEn: ["Install pheromone traps (8 per ha) to monitor moths.", "Destroy crop residue and unopened bolls after final picking.", "Deep summer ploughing exposes pupae."],
    organicTa: ["ஃபெரமோன் பொறி (எக்டேருக்கு 8) வைக்கவும்.", "கடைசி பறிப்புக்குப் பின் செடிக் கழிவை அழிக்கவும்.", "கோடை ஆழ உழவு."],
    chemicalEn: ["Need-based insecticide as per label when trap catches spike.", "Rotate chemical groups — never the same spray twice in a row."],
    chemicalTa: ["பொறியில் பூச்சி அதிகரித்தால் மட்டும் மருந்து.", "மருந்து வகையை மாற்றி மாற்றி பயன்படுத்தவும்."],
    preventEn: ["Do not extend the season — terminate by January.", "Grow short-duration varieties.", "Avoid late sowing."],
    preventTa: ["பருவத்தை நீட்ட வேண்டாம் — ஜனவரிக்குள் முடிக்கவும்.", "குறுகிய கால ரகங்கள்.", "தாமத விதைப்பு தவிர்க்கவும்."],
  },
  {
    id: "cotton-jassid", crop: "cotton", parts: ["leaf"], symptoms: ["curling", "yellowing"],
    nameEn: "Jassids (hopper burn)", nameTa: "தத்துப்பூச்சி",
    urgency: "act",
    aboutEn: "Sap-sucking insects. Leaf edges turn yellow, curl downward and dry — 'hopper burn'. Heavy attack sheds squares and young bolls.",
    aboutTa: "சாறு உறிஞ்சும் பூச்சி. இலை விளிம்பு மஞ்சளாகி கீழே சுருளும். அதிக தாக்குதலில் பூ, பிஞ்சு உதிரும்.",
    organicEn: ["Spray neem oil 0.5% on the underside of leaves.", "Grow jassid-tolerant varieties.", "Avoid excess nitrogen which invites hoppers."],
    organicTa: ["வேப்பெண்ணெய் 0.5% இலை அடிப்பகுதியில் தெளிக்கவும்.", "தாங்கும் ரகங்கள்.", "அதிக யூரியா தவிர்க்கவும்."],
    chemicalEn: ["Imidacloprid or acetamiprid as per label, only above threshold.", "One well-timed spray beats three calendar sprays."],
    chemicalTa: ["இமிடாகுளோப்ரிட் — லேபிள் படி, தேவைப்பட்டால் மட்டும்.", "சரியான நேர ஒரு தெளிப்பு போதும்."],
    preventEn: ["Early sowing escapes peak hopper build-up.", "Keep field weed-free — weeds host hoppers.", "Border crop of maize diverts them."],
    preventTa: ["முன் விதைப்பு.", "களை இல்லா வயல்.", "எல்லையில் மக்காச்சோளம்."],
  },
  {
    id: "cotton-whitefly", crop: "cotton", parts: ["leaf"], symptoms: ["yellowing", "insects"],
    nameEn: "Whitefly", nameTa: "வெள்ளை ஈ",
    urgency: "act",
    aboutEn: "Tiny white flies under leaves; suck sap, excrete sticky honeydew, and spread leaf-curl virus. Sooty mould on honeydew cuts photosynthesis.",
    aboutTa: "இலை அடியில் சிறு வெள்ளை ஈக்கள்; சாறு உறிஞ்சி ஒட்டும் திரவம் விடும்; இலை சுருள் வைரஸ் பரப்பும்.",
    organicEn: ["Yellow sticky traps (10 per ha) to monitor.", "Spray neem oil + soap solution on leaf undersides.", "Do not spray broad insecticides that kill their predators."],
    organicTa: ["மஞ்சள் ஒட்டும் பொறி.", "வேப்பெண்ணெய் + சோப்பு கரைசல்.", "எதிரி பூச்சிகளைக் கொல்லும் மருந்து வேண்டாம்."],
    chemicalEn: ["Diafenthiuron or spiromesifen as per label in severe cases.", "Treat early morning when flies are sluggish."],
    chemicalTa: ["கடுமையானால் டயாஃபெந்தியூரான் — லேபிள் படி.", "காலையில் தெளிக்கவும்."],
    preventEn: ["Destroy alternate hosts (weeds, bhendi) nearby.", "Avoid repeated pyrethroid sprays — they flare whitefly.", "Balanced fertilisation."],
    preventTa: ["அருகிலுள்ள களைகளை அழிக்கவும்.", "தொடர் பைரத்ராய்டு தவிர்க்கவும்.", "சமநிலை உரம்."],
  },
  {
    id: "gn-tikka", crop: "groundnut", parts: ["leaf"], symptoms: ["spots", "yellowing"],
    nameEn: "Tikka leaf spot", nameTa: "டிக்கா இலைப்புள்ளி",
    urgency: "act",
    aboutEn: "Fungal. Dark brown spots with yellow halos; severe cases defoliate the plant and shrink pod filling. Two types — early and late — look similar.",
    aboutTa: "பூஞ்சை நோய். மஞ்சள் வளையத்துடன் கரும் புள்ளிகள்; அதிகமானால் இலை உதிர்ந்து காய் சிறுக்கும்.",
    organicEn: ["Spray neem seed kernel extract at first spots.", "Remove and bury heavily infected leaves.", "Wider spacing for air flow."],
    organicTa: ["முதல் புள்ளியிலேயே வேப்பங்கொட்டைச் சாறு.", "பாதித்த இலைகளை அகற்றி புதைக்கவும்.", "காற்றோட்ட இடைவெளி."],
    chemicalEn: ["Chlorothalonil or mancozeb as per label.", "Two sprays 15 days apart in wet weather."],
    chemicalTa: ["குளோரோதலோனில் — லேபிள் படி.", "மழைக்காலத்தில் 15 நாள் இடைவெளியில் இருமுறை."],
    preventEn: ["Rotate with cereals — never groundnut after groundnut.", "Deep plough to bury fallen leaves.", "Use tolerant varieties."],
    preventTa: ["தானியப் பயிருடன் சுழற்சி.", "ஆழ உழவு.", "தாங்கும் ரகங்கள்."],
  },
  {
    id: "gn-rust", crop: "groundnut", parts: ["leaf"], symptoms: ["spots"],
    nameEn: "Groundnut rust", nameTa: "நிலக்கடலை துருநோய்",
    urgency: "act",
    aboutEn: "Fungal. Orange-brown powdery pustules mainly on the leaf underside; leaves dry and drop. Favours humid weather late in the season.",
    aboutTa: "பூஞ்சை நோய். இலை அடியில் ஆரஞ்சு தூள் போன்ற கொப்புளங்கள்; இலை காய்ந்து உதிரும்.",
    organicEn: ["Spray 1% neem oil at early pustules.", "Avoid late sowing in rust-prone areas."],
    organicTa: ["ஆரம்பத்தில் வேப்பெண்ணெய் 1% தெளிக்கவும்.", "நோய்ப் பகுதியில் தாமத விதைப்பு வேண்டாம்."],
    chemicalEn: ["Tridemorph or hexaconazole as per label.", "Cover the leaf underside — that is where rust lives."],
    chemicalTa: ["டிரைடிமார்ஃப் — லேபிள் படி.", "இலை அடிப்பகுதியில் தெளிக்கவும்."],
    preventEn: ["Early sowing escapes the worst.", "Intercrop with cereals to slow spread.", "Destroy volunteer plants."],
    preventTa: ["முன் விதைப்பு.", "தானிய ஊடுபயிர்.", "தானாய் முளைத்த செடிகளை அழிக்கவும்."],
  },
  {
    id: "gn-whitegrub", crop: "groundnut", parts: ["root", "whole"], symptoms: ["wilting", "rotting"],
    nameEn: "White grub", nameTa: "வெள்ளைப் புழு",
    urgency: "urgent",
    aboutEn: "Soil grubs chew roots and pods underground — plants wilt in patches and pull out easily. Damage is invisible until harvest, so prevention is everything.",
    aboutTa: "மண் புழுக்கள் வேர், காய்களைத் தின்னும் — செடி திட்டுத்திட்டாக வாடும். அறுவடை வரை தெரியாது; தடுப்பே முக்கியம்.",
    organicEn: ["Apply neem cake 250 kg/ha at sowing.", "Set up light traps in May–June to catch beetles.", "Metarhizium fungus formulation in soil."],
    organicTa: ["விதைப்பில் வேப்பம் புண்ணாக்கு 250 கிலோ/எக்டேர்.", "மே–ஜூனில் விளக்குப் பொறி.", "மெட்டாரைசியம் பூஞ்சை."],
    chemicalEn: ["Soil application of recommended granular insecticide at sowing.", "Only as per label — grubs are deep."],
    chemicalTa: ["விதைப்பில் மண் மருந்து — லேபிள் படி."],
    preventEn: ["Summer ploughing exposes grubs to sun and birds.", "Do not apply fresh farmyard manure — it attracts beetles.", "Treat seed with bio-agents."],
    preventTa: ["கோடை உழவு.", "புதிய தொழு உரம் வேண்டாம்.", "விதை நேர்த்தி."],
  },
  {
    id: "cane-redrot", crop: "sugarcane", parts: ["stem"], symptoms: ["rotting", "smell", "discolour-grain"],
    nameEn: "Red rot", nameTa: "செந்நோய்",
    urgency: "urgent",
    aboutEn: "The most dreaded cane disease. Split the cane: reddened tissue with white patches across the nodes, sour alcohol smell. Infected setts doom the whole clump — rogue them.",
    aboutTa: "கரும்பின் கொடிய நோய். கரும்பைப் பிளந்தால் சிவந்த திசு, புளித்த வாடை. பாதித்த கரணைகளை அகற்றவும்.",
    organicEn: ["Rogue and burn infected clumps — do not compost.", "Treat setts in hot water (52°C, 30 min) before planting.", "Trichoderma sett treatment."],
    organicTa: ["பாதித்த கொத்துகளை எரிக்கவும்.", "நடவுக்கு முன் கரணைகளை வெந்நீரில் (52°C, 30 நிமி) நனைக்கவும்.", "டிரைக்கோடெர்மா நேர்த்தி."],
    chemicalEn: ["No effective cure — fungicide sett dips only help mildly.", "Spend on clean seed, not on sprays."],
    chemicalTa: ["முழு குணம் இல்லை — தூய கரணையில் முதலீடு."],
    preventEn: ["Plant only red-rot-resistant varieties.", "Never ratoon a red-rot field.", "Certified seed from a healthy nursery."],
    preventTa: ["எதிர்ப்பு ரகம் மட்டும்.", "நோய் வயலில் மறுதாம்பு வேண்டாம்.", "சான்று விதை."],
  },
  {
    id: "cane-topborer", crop: "sugarcane", parts: ["whole", "stem"], symptoms: ["dead-heart"],
    nameEn: "Top borer", nameTa: "நுனித் துளைப்பான்",
    urgency: "act",
    aboutEn: "Larva bores into the growing point — the central shoot dies and side shoots sprout, giving a 'bunchy top'. Common in the grand growth phase.",
    aboutTa: "புழு நுனி மொட்டைத் துளைக்கும் — நடுக் குருத்து காய்ந்து பக்கக் குருத்துகள். வளர்ச்சிப் பருவத்தில் அதிகம்.",
    organicEn: ["Release Trichogramma chilonis.", "Remove and destroy dead hearts.", "Avoid excess nitrogen."],
    organicTa: ["டிரைக்கோகிராம்மா விடவும்.", "காய்ந்த குருத்துகளை அகற்றவும்.", "அதிக யூரியா வேண்டாம்."],
    chemicalEn: ["Recommended granular insecticide in the leaf whorl as per label.", "One targeted application beats blanket sprays."],
    chemicalTa: ["இலைக் குழலில் மருந்து — லேபிள் படி."],
    preventEn: ["Early planting escapes peak borer.", "Trash mulching reduces egg laying.", "Do not ratoon heavily infested fields."],
    preventTa: ["முன் நடவு.", "சோகை மூடாக்கு.", "அதிக பாதிப்பு வயலில் மறுதாம்பு வேண்டாம்."],
  },
  {
    id: "banana-sigatoka", crop: "banana", parts: ["leaf"], symptoms: ["spots", "yellowing"],
    nameEn: "Sigatoka leaf spot", nameTa: "சிகடோகா இலைப்புள்ளி",
    urgency: "act",
    aboutEn: "Fungal. Small spots with yellow halos grow into large grey lesions; severe defoliation gives small, early-ripening bunches. Thrives in dense, wet plantations.",
    aboutTa: "பூஞ்சை நோய். மஞ்சள் வளையப் புள்ளிகள் பெரிதாகி இலை காயும்; குலை சிறுக்கும். அடர்ந்த ஈரத் தோட்டத்தில் அதிகம்.",
    organicEn: ["Remove and burn severely spotted leaves.", "Improve drainage and spacing.", "Neem oil sprays slow early spread."],
    organicTa: ["பாதித்த இலைகளை அகற்றி எரிக்கவும்.", "வடிகால், இடைவெளி.", "வேப்பெண்ணெய் தெளிப்பு."],
    chemicalEn: ["Propiconazole or mancozeb as per label, alternating.", "Spray the whole canopy, both leaf surfaces."],
    chemicalTa: ["புரோபிகோனசோல் — லேபிள் படி, மாற்றி மாற்றி.", "இலை இருபுறமும் தெளிக்கவும்."],
    preventEn: ["Do not plant too dense.", "Remove suckers regularly — air must move.", "Balanced potash nutrition."],
    preventTa: ["அடர்த்தி குறைவாக நடவும்.", "பக்கக் கன்றுகளை அகற்றவும்.", "சாம்பல் சத்து."],
  },
  {
    id: "banana-wilt", crop: "banana", parts: ["whole", "stem", "leaf"], symptoms: ["wilting", "yellowing"],
    nameEn: "Panama wilt", nameTa: "பனாமா வாடல்",
    urgency: "urgent",
    aboutEn: "Soil fungus. Older leaves yellow and collapse; cut the pseudostem to see brown vascular streaks. No cure — infected plants must be destroyed and the pit treated.",
    aboutTa: "மண் பூஞ்சை. மூத்த இலைகள் மஞ்சளாகி சரியும்; தண்டை வெட்டினால் பழுப்புக் கோடுகள். குணம் இல்லை — செடியை அழித்து குழியை நேர்த்தி செய்யவும்.",
    organicEn: ["Uproot, chop and burn the plant — never replant banana in that pit.", "Apply neem cake + Trichoderma to surrounding soil.", "Flood-fallow the patch if possible."],
    organicTa: ["செடியைப் பிடுங்கி எரிக்கவும்; அக்குழியில் மீண்டும் வாழை வேண்டாம்.", "சுற்று மண்ணில் வேப்பம் புண்ணாக்கு + டிரைக்கோடெர்மா."],
    chemicalEn: ["No chemical cure exists — beware anyone selling one.", "Carbendazim drench only suppresses, never cures."],
    chemicalTa: ["மருந்தில் குணம் இல்லை — விற்பவரை நம்ப வேண்டாம்."],
    preventEn: ["Plant tissue-culture, disease-free suckers.", "Resistant varieties (e.g. for susceptible zones).", "Strict tool and footwear hygiene between fields."],
    preventTa: ["திசு வளர்ப்பு நோயற்ற கன்றுகள்.", "எதிர்ப்பு ரகங்கள்.", "கருவி சுத்தம்."],
  },
  {
    id: "coconut-budrot", crop: "coconut", parts: ["stem", "whole"], symptoms: ["rotting", "wilting"],
    nameEn: "Bud rot", nameTa: "குருத்து அழுகல்",
    urgency: "urgent",
    aboutEn: "Fungal. The central bud rots — the newest frond turns brown and pulls out easily with a foul smell. The palm dies if the bud is lost; catch it before the spear leaf collapses.",
    aboutTa: "பூஞ்சை நோய். நடுக் குருத்து அழுகி துர்நாற்றத்துடன் புதிய ஓலை பிடுங்க வரும். குருத்து போனால் மரம் சாகும்.",
    organicEn: ["Cut out rotted tissue and apply Bordeaux paste to the wound.", "Improve drainage — waterlogging invites bud rot.", "Neem cake around the basin."],
    organicTa: ["அழுகிய பகுதியை வெட்டி போர்டோ கலவை தடவவும்.", "நீர் தேங்காமல் வடிகால்.", "தட்டில் வேப்பம் புண்ணாக்கு."],
    chemicalEn: ["Copper oxychloride drench into the crown as per label.", "Treat at the first foul smell — late treatment fails."],
    chemicalTa: ["குருத்தில் தாமிர மருந்து — லேபிள் படி.", "முதல் துர்நாற்றிலேயே சிகிச்சை."],
    preventEn: ["Do not injure the crown during climbing or harvesting.", "Remove and burn dead palms promptly.", "Balanced nutrition keeps palms vigorous."],
    preventTa: ["குருத்தில் காயம் ஏற்படுத்த வேண்டாம்.", "இறந்த மரங்களை அகற்றி எரிக்கவும்.", "சமநிலை உரம்."],
  },
  {
    id: "coconut-rhinoceros", crop: "coconut", parts: ["leaf", "stem"], symptoms: ["holes", "insects"],
    nameEn: "Rhinoceros beetle", nameTa: "காண்டாமிருக வண்டு",
    urgency: "act",
    aboutEn: "Large black beetle bores into the crown; emerging fronds show characteristic V-shaped cuts. Breeds in manure pits, rotting stumps and compost heaps.",
    aboutTa: "பெரிய கருப்பு வண்டு குருத்தைத் துளைக்கும்; விரியும் ஓலையில் V வடிவ வெட்டுக்கள். எரு குழி, அழுகும் அடிமரத்தில் இனப்பெருக்கம்.",
    organicEn: ["Fill crown with neem cake + sand (1:1) every 3 months.", "Set up light traps at night.", "Destroy breeding sites — cover manure pits."],
    organicTa: ["குருத்தில் வேப்பம் புண்ணாக்கு + மணல் (3 மாதத்திற்கு ஒருமுறை).", "இரவில் விளக்குப் பொறி.", "இனப்பெருக்க இடங்களை அழிக்கவும்."],
    chemicalEn: ["Place naphthalene balls in the crown (traditional practice).", "Insecticide crown application only for severe attack, as per label."],
    chemicalTa: ["குருத்தில் நாப்தலின் உருண்டை.", "கடுமையானால் மட்டும் மருந்து — லேபிள் படி."],
    preventEn: ["Keep the garden clean of rotting logs and stumps.", "Release Oryctes virus-infected beetles (biocontrol).", "Avoid fresh FYM heaps near palms."],
    preventTa: ["தோட்டத்தைச் சுத்தமாக வைக்கவும்.", "உயிரியல் கட்டுப்பாடு (வைரஸ் வண்டு).", "மரங்களருகே புதிய எருக் குவியல் வேண்டாம்."],
  },
  {
    id: "coconut-mite", crop: "coconut", parts: ["fruit"], symptoms: ["spots", "discolour-grain"],
    nameEn: "Eriophyid mite", nameTa: "சிறு சிலந்திப் பூச்சி",
    urgency: "act",
    aboutEn: "Microscopic mites feed under the perianth of young nuts — brown patches spread, nuts become deformed and drop early. Copra outturn falls sharply.",
    aboutTa: "கண்ணுக்குத் தெரியாத பூச்சி இளம் காய்களைத் தாக்கும் — பழுப்புத் திட்டுகள், காய் உதிர்வு, கொப்பரை குறைவு.",
    organicEn: ["Spray neem oil + garlic emulsion on young bunches.", "Release predatory mites where available.", "Remove and destroy badly affected bunches."],
    organicTa: ["இளம் குலைகளில் வேப்பெண்ணெய் + பூண்டு கரைசல்.", "பாதித்த குலைகளை அகற்றவும்."],
    chemicalEn: ["Wettable sulphur spray on 2–3 month old bunches as per label.", "Cover the whole bunch — mites hide under the perianth."],
    chemicalTa: ["கந்தகத் தூள் தெளிப்பு — லேபிள் படி.", "முழுக் குலையையும் நனைக்கவும்."],
    preventEn: ["Do not let palms go water-stressed in summer.", "Intercrop with green manure to host predators.", "Harvest mature nuts on time."],
    preventTa: ["கோடையில் நீர்ப் பற்றாக்குறை வேண்டாம்.", "பசுந்தாள் ஊடுபயிர்.", "முற்றிய காய்களைச் சரியான நேரத்தில் பறிக்கவும்."],
  },
  /* Maize — fall armyworm is the defining maize crisis in India (invaded
     2018); TN grows maize in the winter-summer window. Curated from TNAU
     maize protection guides. */
  {
    id: "maize-faw", crop: "maize", parts: ["leaf", "stem"], symptoms: ["holes", "insects"],
    nameEn: "Fall armyworm", nameTa: "படைப்புழு (ஃபால் ஆர்மிவார்ம்)",
    urgency: "urgent",
    aboutEn: "Caterpillars chew ragged holes in leaves and bore into the whorl, leaving sawdust-like frass. They feed at night and hide by day. Can destroy a young maize crop in days — this one cannot wait.",
    aboutTa: "புழுக்கள் இலையில் துளையிட்டு குருத்துக்குள் செல்லும் — மரத்தூள் போன்ற கழிவு தெரியும். இரவில் தின்று பகலில் ஒளியும். சில நாட்களில் இளம் சோளத்தை அழிக்கும் — காத்திருக்க முடியாது.",
    organicEn: ["Pour neem seed kernel extract 5% into the whorl (2–3 ml per plant).", "Set up 8 pheromone traps per acre to track moth flights.", "Release Telenomus remus / Trichogramma where your block office stocks them."],
    organicTa: ["குருத்துக்குள் வேப்பங்கொட்டைச் சாறு 5% ஊற்றவும் (செடிக்கு 2–3 மிலி).", "ஏக்கருக்கு 8 ஃபெரமோன் பொறி வைத்து அந்துப்பூச்சியைக் கண்காணிக்கவும்.", "டெலினோமஸ்/டிரைக்கோகிராமா முட்டை அட்டை பயன்படுத்தவும்."],
    chemicalEn: ["Spinosad 45% SC — 0.3 ml per litre, directed into the whorl, as per label.", "Spray in the evening when larvae feed; repeat only if new damage appears.", "Rotate chemistry — fall armyworm builds resistance fast."],
    chemicalTa: ["ஸ்பைனோசாட் 45% — லிட்டருக்கு 0.3 மிலி, குருத்துக்குள் இலக்காக (லேபிள் படி).", "புழு தின்னும் மாலையில் தெளிக்கவும்.", "மருந்தை மாற்றி மாற்றிப் பயன்படுத்தவும் — எதிர்ப்பு வேகமாக உருவாகும்."],
    preventEn: ["Deep plough after harvest to expose pupae to sun and birds.", "Avoid staggered sowing across the village — uniform sowing starves the pest.", "Intercrop maize with pulses to slow the spread."],
    preventTa: ["அறுவடைக்குப் பின் ஆழ உழவு — கூட்டுப்புழு வெயிலில்/பறவைகளிடம் வெளிப்படும்.", "கிராமம் முழுவதும் ஒரே நேரத்தில் விதையுங்கள்.", "சோளத்துடன் பயறு ஊடுபயிர் — பரவல் குறையும்."],
  },
  {
    id: "maize-tlb", crop: "maize", parts: ["leaf"], symptoms: ["spots"],
    nameEn: "Turcicum leaf blight", nameTa: "டர்சிக்கம் இலைக் கருகல்",
    urgency: "act",
    aboutEn: "Fungal disease. Large grey-green elliptical lesions (2–15 cm) run along the leaf veins; severe attacks kill the leaf and starve the cob. Worse in cool, humid weather.",
    aboutTa: "பூஞ்சை நோய். இலை நரம்புகளில் பெரிய சாம்பல்-பச்சை நீள் புள்ளிகள்; கடுமையானால் இலை கருகி கதிர் பசிக்கும். குளிர் ஈரப்பதத்தில் அதிகம்.",
    organicEn: ["Remove and burn heavily infected lower leaves.", "Avoid overhead irrigation in the evening.", "Apply balanced potash — potassium-deficient plants blight faster."],
    organicTa: ["அதிகம் பாதித்த கீழ் இலைகளைப் பறித்து எரிக்கவும்.", "மாலையில் மேல் நீர்ப்பாசனம் வேண்டாம்.", "சாம்பல் சத்து சரியாக இருக்க வேண்டும்."],
    chemicalEn: ["Mancozeb 75% WP — 2.5 g per litre as per label.", "Spray at first sign on the middle leaves; one more spray after 10 days if it spreads."],
    chemicalTa: ["மாங்கோசெப் 75% — லிட்டருக்கு 2.5 கிராம் (லேபிள் படி).", "நடு இலைகளில் அறிகுறி தெரிந்ததும் தெளிக்கவும்."],
    preventEn: ["Grow TLB-tolerant hybrids next season.", "Rotate maize with legumes.", "Bury or burn infected stubble."],
    preventTa: ["அடுத்த பருவம் எதிர்ப்பு ரகம்.", "பயறுடன் பயிர் சுழற்சி.", "பாதித்த தாளை எரிக்கவும்."],
  },
  {
    id: "maize-borer", crop: "maize", parts: ["stem"], symptoms: ["dead-heart", "holes"],
    nameEn: "Stem borer", nameTa: "தண்டு துளைப்பான்",
    urgency: "act",
    aboutEn: "Larvae bore into the stem; the central shoot wilts and dies ('dead heart') in young plants. Frass and entry holes on the stem are the giveaway.",
    aboutTa: "புழு தண்டுக்குள் துளையிடும்; இளம் செடியில் நடுக்குருத்து வாடிச் சாகும் ('dead heart'). தண்டில் துளையும் கழிவும் அடையாளம்.",
    organicEn: ["Pull out and destroy dead-heart plants before larvae pupate.", "Release Trichogramma chilonis egg cards at 15 and 22 days after sowing.", "Mix neem cake 100 kg/acre into the soil at sowing."],
    organicTa: ["குருத்து செத்த செடிகளைப் பிடுங்கி அழிக்கவும்.", "விதைத்த 15, 22-ம் நாள் டிரைக்கோகிராமா அட்டை வையுங்கள்.", "விதைக்கும்போது ஏக்கருக்கு 100 கிலோ வேப்பம்புண்ணாக்கு."],
    chemicalEn: ["Apply carbofuran 3G granules — 8–10 kg/acre into the whorl, as per label.", "Granules in the whorl beat sprays for borers hiding inside the stem."],
    chemicalTa: ["கார்போஃப்யூரான் 3G — ஏக்கருக்கு 8–10 கிலோ, குருத்தில் (லேபிள் படி).", "தண்டுக்குள் ஒளியும் புழுவுக்கு குருத்தில் துகள் தெளிப்பை விடச் சிறந்தது."],
    preventEn: ["Sow within the village window — late fields attract the moths.", "Destroy stubble and volunteer maize after harvest.", "Light traps at field edges catch the moths."],
    preventTa: ["கிராமக் காலத்தில் விதையுங்கள் — தாமத வயல்களை அந்துப்பூச்சி தேடும்.", "அறுவடைக்குப் பின் தாளையும் தன்னிச்சைச் செடிகளையும் அழிக்கவும்.", "வயல் ஓரத்தில் விளக்குப் பொறி."],
  },
  {
    id: "maize-mlb", crop: "maize", parts: ["leaf"], symptoms: ["spots", "yellowing"],
    nameEn: "Maydis leaf blight", nameTa: "மேடிஸ் இலைக் கருகல்",
    urgency: "watch",
    aboutEn: "Fungal disease. Small tan diamond-shaped spots with buff margins appear first on lower leaves and move up; heavy infection dries the foliage before grain fill.",
    aboutTa: "பூஞ்சை நோய். கீழ் இலைகளில் சிறு பழுப்பு வைரப் புள்ளிகள் தொடங்கி மேலே ஏறும்; கடுமையானால் தானியம் நிரம்புமுன் இலை காயும்.",
    organicEn: ["Strip and destroy the lowest infected leaves at first sight.", "Improve air flow — avoid over-dense sowing.", "Foliar spray of Pseudomonas fluorescens where available."],
    organicTa: ["முதலில் தெரிந்த கீழ் இலைகளைப் பறித்து அழிக்கவும்.", "அடர்த்தி விதைப்பு வேண்டாம் — காற்றோட்டம் முக்கியம்.", "சூடோமோனாஸ் இலைத் தெளிப்பு."],
    chemicalEn: ["Zineb 75% WP — 2.5 g per litre as per label.", "One spray at flag-leaf stage protects the top leaves that fill the cob."],
    chemicalTa: ["சைனெப் 75% — லிட்டருக்கு 2.5 கிராம் (லேபிள் படி).", "கொடி இலைப் பருவத்தில் ஒரு தெளிப்பு கதிரைக் காக்கும்."],
    preventEn: ["Use MLB-resistant hybrids.", "Field sanitation — bury infected debris.", "Do not sow maize back-to-back in the same field."],
    preventTa: ["எதிர்ப்பு ரகம் பயன்படுத்தவும்.", "பாதித்த இலைகளைப் புதையுங்கள்.", "ஒரே வயலில் தொடர்ந்து சோளம் விதைக்க வேண்டாம்."],
  },
  {
    id: "turmeric-leafspot", crop: "turmeric", parts: ["leaf"], symptoms: ["spots", "yellowing"],
    nameEn: "Leaf spot (Colletotrichum)", nameTa: "இலைப்புள்ளி நோய்",
    urgency: "act",
    aboutEn: "Fungal disease. Brown to black circular spots with yellow halos on leaves; severe attack dries whole leaves and cuts rhizome yield. Spreads in wet, humid weather — the Erode belt's post-monsoon months are peak season.",
    aboutTa: "பூஞ்சை நோய். இலையில் மஞ்சள் வளையத்துடன் பழுப்பு–கருப்புப் புள்ளிகள்; கடுமையானால் இலை காய்ந்து கிழங்கு மகசூல் குறையும். ஈர மாதங்களில் வேகமாகப் பரவும்.",
    organicEn: ["Spray neem seed kernel extract 5% at first spots.", "Remove and burn the worst-spotted lower leaves.", "Improve drainage — waterlogging feeds this disease."],
    organicTa: ["முதல் புள்ளியிலேயே வேப்பங்கொட்டைச் சாறு 5% தெளிக்கவும்.", "பாதித்த கீழ் இலைகளை அகற்றி எரிக்கவும்.", "நீர் தேங்காமல் வடிகால் சரி செய்யவும்."],
    chemicalEn: ["Mancozeb 75% WP — 2.5 g per litre as per label.", "Repeat after 12–15 days only if new spots keep appearing."],
    chemicalTa: ["மாங்கோசெப் 75% — லிட்டருக்கு 2.5 கிராம் (லேபிள் படி).", "புதிய புள்ளிகள் தொடர்ந்தால் 12–15 நாளில் மீண்டும்."],
    preventEn: ["Treat rhizomes with Trichoderma before planting.", "Do not plant turmeric in the same field year after year.", "Wider spacing for air circulation."],
    preventTa: ["நடவுக்கு முன் கிழங்குகளுக்கு டிரைக்கோடெர்மா நேர்த்தி.", "ஒரே வயலில் ஆண்டுதோறும் மஞ்சள் வேண்டாம்.", "காற்றோட்டத்துக்கு அகல இடைவெளி."],
  },
  {
    id: "turmeric-leafblotch", crop: "turmeric", parts: ["leaf"], symptoms: ["spots", "wilting"],
    nameEn: "Leaf blotch (Taphrina)", nameTa: "இலைக் கறை நோய்",
    urgency: "act",
    aboutEn: "Fungal disease. Large brown blotches that merge and dry the leaf from the tip downward; heavy blotch years slash dry-matter and curcumin content — the price drivers. Worse where leaves stay wet overnight.",
    aboutTa: "பூஞ்சை நோய். பெரிய பழுப்புக் கறைகள் இணைந்து இலை நுனியிலிருந்து காயும்; விலையைத் தீர்மானிக்கும் கிழங்குத் தரம் குறையும். இரவில் இலை ஈரமாக இருந்தால் அதிகம்.",
    organicEn: ["Spray Bordeaux mixture 1% at first sign of blotches.", "Morning irrigation only — let leaves dry by evening.", "Remove infected leaves from the field, not onto the bund."],
    organicTa: ["கறை தெரிந்ததும் போர்டோ கலவை 1% தெளிக்கவும்.", "காலையில் மட்டும் நீர் — மாலைக்குள் இலை காய வேண்டும்.", "பாதித்த இலைகளை வயலுக்கு வெளியே அகற்றவும்."],
    chemicalEn: ["Carbendazim 50% WP — 1 g per litre as per label.", "One well-timed spray beats two late ones."],
    chemicalTa: ["கார்பெண்டாசிம் 50% — லிட்டருக்கு 1 கிராம் (லேபிள் படி).", "சரியான நேரத்தில் ஒரு தெளிப்பு போதும்."],
    preventEn: ["Plant certified disease-free rhizomes.", "Mulch the inter-row to cut rain splash.", "Balance potash — weak leaves blotch faster."],
    preventTa: ["நோயற்ற சான்று கிழங்குகள் பயன்படுத்தவும்.", "மழைத் தெறிப்பு தடுக்க வரிசை இடையே மூடாக்கு.", "சாம்பல் சத்து சமநிலை."],
  },
  {
    id: "turmeric-rhizomerot", crop: "turmeric", parts: ["stem", "whole"], symptoms: ["rotting", "wilting", "smell"],
    nameEn: "Rhizome rot (Pythium)", nameTa: "கிழங்கு அழுகல்",
    urgency: "urgent",
    aboutEn: "Fungal rot of the rhizome — the saleable part. Leaves yellow and wilt even with wet soil; pull a plant and the rhizome is soft, brown, foul-smelling. Once a patch rots, nothing is recovered from it — speed is everything.",
    aboutTa: "கிழங்கின் பூஞ்சை அழுகல். மண் ஈரமாக இருந்தும் இலை மஞ்சளாகி வாடும்; செடியைப் பிடுங்கினால் கிழங்கு மெத்து, பழுப்பு, துர்நாற்றம். அழுகிய பகுதியில் மகசூல் இல்லை — வேகம் முக்கியம்.",
    organicEn: ["Drench the base with Trichoderma viride — 2.5 kg/ha with FYM.", "Uproot and destroy affected plants immediately — do not compost them.", "Stop irrigation in the affected patch; let it dry."],
    organicTa: ["அடிப்பகுதியில் டிரைக்கோடெர்மா விரிடி + தொழு எரு.", "பாதித்த செடிகளை உடனே பிடுங்கி அழிக்கவும்.", "பாதித்த இடத்தில் நீர் நிறுத்தி உலர விடவும்."],
    chemicalEn: ["Metalaxyl + mancozeb drench as per label, around the affected plants.", "Treat the soil, not the leaves — the fungus lives underground."],
    chemicalTa: ["மெட்டலாக்சில் + மாங்கோசெப் — லேபிள் படி மண்ணில் ஊற்றவும்.", "இலையில் அல்ல — மண்ணில் சிகிச்சை."],
    preventEn: ["Never plant in a field with a rot history without raised beds.", "Rhizome treatment before planting is the cheapest insurance.", "Ensure field drainage before the monsoon, not after."],
    preventTa: ["அழுகல் வரலாறுள்ள வயலில் உயர்ந்த பாத்தி இல்லாமல் நட வேண்டாம்.", "நடவுக்கு முன் கிழங்கு நேர்த்தி மலிவான காப்பீடு.", "பருவமழைக்கு முன் வடிகால் சரி செய்யவும்."],
  },
  {
    id: "turmeric-scale", crop: "turmeric", parts: ["stem", "whole"], symptoms: ["insects", "yellowing", "stunting"],
    nameEn: "Scale insects on rhizome", nameTa: "கிழங்குப் பேன்",
    urgency: "watch",
    aboutEn: "Small white-to-brown scales suck sap from the rhizome and stem base, usually found at harvest when it is too late to fix. They ride along on seed rhizomes — clean seed is the whole battle. Damaged rhizomes store poorly and fetch less.",
    aboutTa: "சிறு வெள்ளை–பழுப்பு பேன்கள் கிழங்கு–அடித்தண்டு சாறு உறிஞ்சும்; பெரும்பாலும் அறுவடையில் தான் தெரியும். விதைக் கிழங்கில் வரும் — சுத்தமான விதை தான் முழுப் போர். சேதக் கிழங்கு சேமிப்பில் கெடும், விலை குறையும்.",
    organicEn: ["Dip seed rhizomes in neem seed kernel extract before planting.", "Hot-water treatment (50°C, 10 min) kills scales on seed.", "Earth up soil around the base to bury exposed rhizomes."],
    organicTa: ["நடவுக்கு முன் விதைக் கிழங்குகளை வேப்பச் சாற்றில் நனைக்கவும்.", "50°C வெந்நீரில் 10 நிமிடம் — விதைப் பேன் இறக்கும்.", "அடிப்பகுதியில் மண் குவித்து கிழங்கை மூடவும்."],
    chemicalEn: ["Quinalphos 25% EC soil drench as per label, only if scales are heavy at planting.", "Spraying the leaves will not reach insects on the rhizome."],
    chemicalTa: ["நடவில் பேன் அதிகமிருந்தால் மட்டும் குவினால்ஃபாஸ் — லேபிள் படி.", "இலைத் தெளிப்பு கிழங்குப் பேனை எட்டாது."],
    preventEn: ["Source seed rhizomes from a clean, scale-free field.", "Store seed rhizomes in shade with neem leaves layered in.", "Inspect stored seed before planting — reject infested lots."],
    preventTa: ["பேன் இல்லா வயலின் விதைக் கிழங்கு வாங்கவும்.", "சேமிப்பில் வேப்ப இலை அடுக்கி நிழலில் வைக்கவும்.", "நடவுக்கு முன் சேமித்த விதையைப் பரிசோதித்து, பாதித்ததை நிராகரிக்கவும்."],
  },
];

export interface FertDose {
  cropId: string; // matches DOCTOR_CROPS ids
  perHa: boolean; // true → dose per hectare (input acres); false → per plant (input plant count)
  n: number; // kg N per ha, or g N per plant
  p: number; // kg P2O5 per ha, or g P2O5 per plant
  k: number; // kg K2O per ha, or g K2O per plant
  splitsEn: string[];
  splitsTa: string[];
  noteEn: string;
  noteTa: string;
}

/* Source: TNAU Crop Production Guide blanket recommendations (widely
   published; the app tells the farmer a soil test beats any blanket dose).
   paddy 150:50:50 · cotton (irrigated) 120:60:60 · groundnut (irrigated)
   25:50:75 · sugarcane (plant crop) 275:62.5:112.5 · banana 110:35:330
   g/plant · coconut 500:320:1200 g/palm/year + 50 kg FYM. */
export const FERT_DOSES: FertDose[] = [
  {
    cropId: "paddy", perHa: true, n: 150, p: 50, k: 50,
    splitsEn: ["Basal (at transplanting): half the nitrogen + all the phosphorus + half the potash", "Active tillering: quarter of the nitrogen", "Panicle initiation: remaining nitrogen + remaining potash"],
    splitsTa: ["அடியுரம் (நடவின்போது): பாதி தழைச்சத்து + முழு மணிச்சத்து + பாதி சாம்பல்சத்து", "தூர் கட்டும் பருவம்: கால் பங்கு தழைச்சத்து", "கதிர் உருவாகும் பருவம்: மீதி தழைச்சத்து + மீதி சாம்பல்சத்து"],
    noteEn: "Excess urea invites stem borer and blast. Split the doses — never dump all the nitrogen at once.",
    noteTa: "அதிக யூரியா தண்டுத் துளைப்பானையும் குலைநோயையும் அழைக்கும். உரத்தைப் பிரித்து இடுங்கள்.",
  },
  {
    cropId: "cotton", perHa: true, n: 120, p: 60, k: 60,
    splitsEn: ["Basal (at sowing): half the nitrogen + all the phosphorus + half the potash", "40–45 days after sowing: remaining nitrogen + remaining potash"],
    splitsTa: ["அடியுரம் (விதைப்பில்): பாதி தழைச்சத்து + முழு மணிச்சத்து + பாதி சாம்பல்சத்து", "விதைத்த 40–45 நாட்களில்: மீதி தழைச்சத்து + மீதி சாம்பல்சத்து"],
    noteEn: "Cotton is a heavy feeder but hates excess nitrogen — it invites jassids and whitefly.",
    noteTa: "பருத்திக்கு உரம் அதிகம் தேவை; ஆனால் அதிக தழைச்சத்து தத்துப்பூச்சியை அழைக்கும்.",
  },
  {
    cropId: "groundnut", perHa: true, n: 25, p: 50, k: 75,
    splitsEn: ["Full dose as basal at sowing — groundnut takes the rest from the air and soil"],
    splitsTa: ["விதைப்பில் முழு அளவும் அடியுரமாக — மீதியை காற்று, மண்ணிலிருந்து எடுத்துக்கொள்ளும்"],
    noteEn: "Never top-dress nitrogen on groundnut — it fixes its own. Extra urea only feeds leaf spot.",
    noteTa: "நிலக்கடலைக்கு மேலுரம் வேண்டாம் — அதுவே தழைச்சத்தை நிலைநிறுத்தும்.",
  },
  {
    cropId: "sugarcane", perHa: true, n: 275, p: 62.5, k: 112.5,
    splitsEn: ["Basal (at planting): half the nitrogen + all the phosphorus", "45 days: quarter of the nitrogen + half the potash", "90 days: remaining nitrogen + remaining potash"],
    splitsTa: ["அடியுரம் (நடவில்): பாதி தழைச்சத்து + முழு மணிச்சத்து", "45-ம் நாள்: கால் பங்கு தழைச்சத்து + பாதி சாம்பல்சத்து", "90-ம் நாள்: மீதி தழைச்சத்து + மீதி சாம்பல்சத்து"],
    noteEn: "Potash at 45 and 90 days builds cane weight and sugar recovery. Do not delay the splits.",
    noteTa: "45, 90-ம் நாள் சாம்பல்சத்து கரும்பு எடை, சர்க்கரை மீட்பை அதிகரிக்கும்.",
  },
  {
    cropId: "banana", perHa: false, n: 110, p: 35, k: 330,
    splitsEn: ["3rd month after planting: one-third of the dose", "5th month: one-third", "7th month: one-third"],
    splitsTa: ["நடவுக்கு 3-ம் மாதம்: மூன்றில் ஒரு பங்கு", "5-ம் மாதம்: மூன்றில் ஒரு பங்கு", "7-ம் மாதம்: மூன்றில் ஒரு பங்கு"],
    noteEn: "Banana is a potash glutton — this dose has three times the usual potash. Skimp on potash and the bunches stay small.",
    noteTa: "வாழைக்கு சாம்பல்சத்து அதிகம் தேவை. குறைத்தால் குலை சிறுக்கும்.",
  },
  {
    cropId: "coconut", perHa: false, n: 500, p: 320, k: 1200,
    splitsEn: ["June–July (with the SW monsoon): half the dose + 25 kg organic manure per palm", "December–January (with the NE monsoon): half the dose + 25 kg organic manure per palm"],
    splitsTa: ["ஜூன்–ஜூலை (தென்மேற்கு பருவமழையில்): பாதி அளவு + மரத்திற்கு 25 கிலோ தொழு உரம்", "டிசம்பர்–ஜனவரி (வடகிழக்கு பருவமழையில்): பாதி அளவு + மரத்திற்கு 25 கிலோ தொழு உரம்"],
    noteEn: "Apply in a 1.8 m radius basin, 30 cm deep — never heap fertilizer against the trunk.",
    noteTa: "மரத்திலிருந்து 1.8 மீ ஆரத் தட்டில் இடவும் — தண்டை ஒட்டி குவிக்க வேண்டாம்.",
  },
  {
    cropId: "turmeric", perHa: true, n: 120, p: 50, k: 90,
    splitsEn: ["Basal (at planting): half the nitrogen + all the phosphorus + half the potash", "45 days after planting: quarter of the nitrogen", "90 days after planting: remaining nitrogen + remaining potash"],
    splitsTa: ["அடியுரம் (நடவின்போது): பாதி தழைச்சத்து + முழு மணிச்சத்து + பாதி சாம்பல்சத்து", "நடவுக்கு 45 நாட்களில்: கால் பங்கு தழைச்சத்து", "90 நாட்களில்: மீதி தழைச்சத்து + மீதி சாம்பல்சத்து"],
    noteEn: "Turmeric drinks potassium late — the second split at 90 days fills the rhizome, which is where the money is.",
    noteTa: "மஞ்சளுக்கு பிந்தைய பருவத்தில் சாம்பல்சத்து முக்கியம் — 90-ம் நாள் பங்கு கிழங்கை நிரப்பும்.",
  },
];

/* Seed rates: how much planting material per acre, from TNAU Agritech
   portal guidance and KVK FAQs (researched 19 Oct 2026). ha→acre ÷ 2.47.
   Paddy transplanted 20–25 kg/acre (KVK) / study 25–30 — using 25;
   SRI 3 kg/acre (TNAU Agritech); cotton Bt hybrid 1.5 kg/ha ≈ 0.6/acre;
   groundnut kernels 125 kg/ha ≈ 50/acre; sugarcane TNAU 75,000
   two-budded/ha ≈ 30,000/acre (sources conflict — app says so);
   banana 2×2 m → 2,500/ha ≈ 1,000/acre; coconut 7.5×7.5 m → 175/ha ≈ 70/acre. */
export interface SeedRate {
  id: string;
  cropId: string; // matches DOCTOR_CROPS ids
  nameEn: string;
  nameTa: string;
  perAcre: number; // kg or count per acre
  unitEn: string;
  unitTa: string;
  noteEn: string;
  noteTa: string;
}

export const SEED_RATES: SeedRate[] = [
  { id: "paddy-transplant", cropId: "paddy", nameEn: "Paddy — transplanted", nameTa: "நெல் — நடவு", perAcre: 25, unitEn: "kg seed", unitTa: "கிலோ விதை",
    noteEn: "KVK guidance is 20–25 kg/acre. Buy 10% extra for patchy germination — running short on sowing day costs more than the extra bag.",
    noteTa: "கேவிகே வழிகாட்டுதல் 20–25 கிலோ/ஏக்கர். முளைப்பு குறைந்தால் 10% கூடுதல் வாங்குங்கள்." },
  { id: "paddy-sri", cropId: "paddy", nameEn: "Paddy — SRI method", nameTa: "நெல் — SRI முறை", perAcre: 3, unitEn: "kg seed", unitTa: "கிலோ விதை",
    noteEn: "Single-seedling SRI planting needs only ~3 kg/acre — one of its quiet savings against transplanted paddy.",
    noteTa: "ஒற்றை நாற்று SRI முறைக்கு ~3 கிலோ/ஏக்கர் மட்டுமே — நடவு நெல்லை விட அமைதியான சேமிப்பு." },
  { id: "cotton-bt", cropId: "cotton", nameEn: "Cotton — Bt hybrid", nameTa: "பருத்தி — Bt கலப்பினம்", perAcre: 0.6, unitEn: "kg seed", unitTa: "கிலோ விதை",
    noteEn: "Hybrid seed costs a lot per kg but sips per acre (~600 g). Buy only sealed packets with a batch number — loose hybrid seed is a gamble.",
    noteTa: "கலப்பின விதை கிலோவுக்கு விலை அதிகம், ஆனால் ஏக்கருக்கு ~600 கிராம்தான். முத்திரைப் பாக்கெட் மட்டும் வாங்குங்கள்." },
  { id: "groundnut", cropId: "groundnut", nameEn: "Groundnut — kernels", nameTa: "நிலக்கடலை — பருப்பு", perAcre: 50, unitEn: "kg kernels", unitTa: "கிலோ பருப்பு",
    noteEn: "TNAU dryland guidance: 50 kg/acre by hand, 40 with a seed drill. Shell only what you need — shelled kernels lose viability fast.",
    noteTa: "TNAU வறண்ட நில வழிகாட்டுதல்: கையால் 50 கிலோ/ஏக்கர், விதை இயந்திரத்தில் 40. தேவையானதை மட்டும் உடையுங்கள்." },
  { id: "sugarcane", cropId: "sugarcane", nameEn: "Sugarcane — setts", nameTa: "கரும்பு — கரணை", perAcre: 30000, unitEn: "two-budded setts", unitTa: "இரு கண் கரணைகள்",
    noteEn: "TNAU's 75,000 two-budded setts/ha (≈30,000/acre). Counts differ by bud type across sources — confirm with your mill's cane officer.",
    noteTa: "TNAU: ஹெக்டேருக்கு 75,000 இரு கண் கரணைகள் (≈30,000/ஏக்கர்). கண் எண்ணிக்கைக்கேற்ப மாறும் — ஆலை அலுவலரிடம் உறுதி செய்யுங்கள்." },
  { id: "banana", cropId: "banana", nameEn: "Banana — suckers", nameTa: "வாழை — கன்றுகள்", perAcre: 1000, unitEn: "suckers", unitTa: "கன்றுகள்",
    noteEn: "Standard 2×2 m spacing. Use sword suckers from disease-free mother plants, pared and treated before planting.",
    noteTa: "2×2 மீ இடைவெளி தரநிலை. நோயற்ற தாய்ச் செடியின் வாள் கன்றுகளைப் பயன்படுத்துங்கள்." },
  { id: "coconut", cropId: "coconut", nameEn: "Coconut — seedlings", nameTa: "தென்னை — நாற்றுகள்", perAcre: 70, unitEn: "seedlings", unitTa: "நாற்றுகள்",
    noteEn: "7.5×7.5 m square planting. Pick 10–12 month old, well-rooted seedlings from a certified nursery.",
    noteTa: "7.5×7.5 மீ சதுர நடவு. சான்றளிக்கப்பட்ட நாற்றங்காலின் 10–12 மாத நாற்றுகளைத் தேர்ந்தெடுங்கள்." },
  { id: "turmeric", cropId: "turmeric", nameEn: "Turmeric — seed rhizomes", nameTa: "மஞ்சள் — விதைக் கிழங்குகள்", perAcre: 900, unitEn: "kg rhizomes", unitTa: "கிலோ கிழங்குகள்",
    noteEn: "TNAU guidance: 2,000–2,500 kg/ha (≈900 kg/acre) of whole or split healthy mother rhizomes. Plant at 45×15 cm in raised beds in May–June.",
    noteTa: "TNAU வழிகாட்டுதல்: ஹெக்டேருக்கு 2,000–2,500 கிலோ (≈900 கிலோ/ஏக்கர்). மே–ஜூனில் 45×15 செ.மீ இடைவெளியில் உயர்ந்த பாத்திகளில் நடவு." },
];

/* Soil Health Card interpreter: standard Indian/ICAR rating bands
   (researched 19 Oct 2026 — testbook/agribegri SHC guides; pH scale is the
   standard 10-class scale, simplified here into 5 app bands).
   pH ideal crop range 6.0–7.5; EC <1 normal / 1–2 critical / >2 injurious;
   OC low <0.5% / med 0.5–0.75% / high >0.75%;
   N <280 / 280–560 / >560 kg/ha; P2O5 <22.5 / 22.5–55 / >55 kg/ha;
   K2O <144 / 144–336 / >336 kg/ha.
   Acidic → lime; alkali → gypsum + leaching (SHC convention). */
export type ShcLevel = "good" | "warn" | "bad";

export interface ShcResult {
  level: ShcLevel;
  ratingEn: string;
  ratingTa: string;
  adviceEn: string;
  adviceTa: string;
}

export function interpretPh(v: number): ShcResult {
  if (v < 5.5) return { level: "bad", ratingEn: "Strongly acidic", ratingTa: "மிக அமிலத்தன்மை",
    adviceEn: "Apply agricultural lime as your officer advises — acidity locks up phosphorus and micronutrients even when you add fertilizer.",
    adviceTa: "வேளாண் அலுவலர் பரிந்துரைப்படி சுண்ணாம்பு இடுங்கள் — அமில மண் உரத்தின் சத்துகளைப் பூட்டி வைக்கும்." };
  if (v < 6.5) return { level: "warn", ratingEn: "Acidic", ratingTa: "அமிலத்தன்மை",
    adviceEn: "Mildly acidic — lime helps, especially before paddy. Don't skip it two seasons in a row.",
    adviceTa: "லேசான அமிலம் — சுண்ணாம்பு உதவும், குறிப்பாக நெல்லுக்கு முன்." };
  if (v <= 7.5) return { level: "good", ratingEn: "Neutral — ideal", ratingTa: "நடுநிலை — சிறந்தது",
    adviceEn: "The sweet spot for most crops (6.0–7.5). Keep it here with organic matter, not by accident.",
    adviceTa: "பெரும்பாலான பயிர்களுக்கு ஏற்றது (6.0–7.5). தொழு உரத்தால் இதைத் தக்கவையுங்கள்." };
  if (v <= 8.5) return { level: "warn", ratingEn: "Alkaline", ratingTa: "காரத்தன்மை",
    adviceEn: "Apply gypsum and leach with good-quality water so salts wash below the root zone. Prefer tolerant varieties this season.",
    adviceTa: "ஜிப்சம் இட்டு நல்ல நீரில் கழுவுங்கள் — உப்பு வேர் மண்டலத்திற்குக் கீழ் செல்லும்." };
  return { level: "bad", ratingEn: "Strongly alkaline / sodic", ratingTa: "மிக கார / உவர்",
    adviceEn: "Gypsum + drainage + leaching, on your officer's prescription. Don't fight this soil with fertilizer alone.",
    adviceTa: "அலுவலர் பரிந்துரைப்படி ஜிப்சம் + வடிகால் + கழுவுதல். உரத்தால் மட்டும் இந்த மண்ணை வெல்ல முடியாது." };
}

export function interpretEc(v: number): ShcResult {
  if (v < 1) return { level: "good", ratingEn: "Normal", ratingTa: "சாதாரணம்",
    adviceEn: "Salt levels are fine. Keep it that way — don't over-irrigate with brackish well water.",
    adviceTa: "உப்பு அளவு சரி. உவர் கிணற்று நீரை அதிகம் பாய்ச்ச வேண்டாம்." };
  if (v <= 2) return { level: "warn", ratingEn: "Critical for crops", ratingTa: "பயிருக்கு ஆபத்தான நிலை",
    adviceEn: "Salts are building up. Leach with good water before sowing and improve drainage.",
    adviceTa: "உப்பு கூடுகிறது. விதைப்புக்கு முன் நல்ல நீரில் கழுவி வடிகாலைச் சரி செய்யுங்கள்." };
  return { level: "bad", ratingEn: "Injurious to crops", ratingTa: "பயிருக்குக் கேடு",
    adviceEn: "This salt level injures most crops. Leach heavily, ensure drainage, and ask your officer about reclamation before you spend on seed.",
    adviceTa: "இந்த உப்பு அளவு பயிரைக் கெடுக்கும். விதைக்கு முன் அலுவலரிடம் மண் சீரமைப்பு பற்றிக் கேளுங்கள்." };
}

export function interpretOc(v: number): ShcResult {
  if (v < 0.5) return { level: "bad", ratingEn: "Low organic carbon", ratingTa: "குறைந்த கரிம கார்பன்",
    adviceEn: "Your soil is hungry. Add farmyard manure, compost, or a green-manure crop (sunnhemp/dhaincha) before the next sowing.",
    adviceTa: "மண் பசியில் உள்ளது. அடுத்த விதைப்புக்கு முன் தொழு உரம் அல்லது பசுந்தாள் உரம் இடுங்கள்." };
  if (v <= 0.75) return { level: "warn", ratingEn: "Medium organic carbon", ratingTa: "நடுத்தர கரிம கார்பன்",
    adviceEn: "Adequate but improvable — every tonne of compost you add pays back in water-holding and fertilizer efficiency.",
    adviceTa: "போதும், ஆனால் மேம்படுத்தலாம் — தொழு உரம் நீர்த்தக்கம், உரத் திறனை அதிகரிக்கும்." };
  return { level: "good", ratingEn: "High organic carbon", ratingTa: "அதிக கரிம கார்பன்",
    adviceEn: "Rich, living soil. Protect it — keep adding crop residue and compost, and avoid burning stubble.",
    adviceTa: "வளமான மண். பயிர்க் கழிவை எரிக்காமல் மண்ணில் சேர்த்துப் பாதுகாக்கவும்." };
}

function shcNutrient(v: number, lo: number, hi: number, nameEn: string, nameTa: string): ShcResult {
  if (v < lo) return { level: "bad", ratingEn: `Low ${nameEn}`, ratingTa: `குறைந்த ${nameTa}`,
    adviceEn: `Don't cut this nutrient this season — follow the full recommended dose on the fertilizer tab.`,
    adviceTa: `இந்தப் பருவம் இந்தச் சத்தைக் குறைக்க வேண்டாம் — உரக் கணக்கு தாவலின் முழு அளவைப் பின்பற்றுங்கள்.` };
  if (v <= hi) return { level: "warn", ratingEn: `Medium ${nameEn}`, ratingTa: `நடுத்தர ${nameTa}`,
    adviceEn: `Adequate for this season. Re-test next year — ${nameEn.toLowerCase()} drifts with cropping.`,
    adviceTa: `இந்தப் பருவத்திற்குப் போதும். அடுத்த ஆண்டு மீண்டும் பரிசோதிக்கவும்.` };
  return { level: "good", ratingEn: `High ${nameEn}`, ratingTa: `அதிக ${nameTa}`,
    adviceEn: `Your soil has plenty — you can safely trim this nutrient and save the money.`,
    adviceTa: `மண்ணில் நிறைய உள்ளது — இந்தச் சத்தைக் குறைத்துப் பணத்தை மிச்சப்படுத்தலாம்.` };
}

export const interpretN = (v: number): ShcResult => shcNutrient(v, 280, 560, "nitrogen", "தழைச்சத்து");
export const interpretP = (v: number): ShcResult => shcNutrient(v, 22.5, 55, "phosphorus", "மணிச்சத்து");
export const interpretK = (v: number): ShcResult => shcNutrient(v, 144, 336, "potash", "சாம்பல்சத்து");

/* Form metadata for the soil tab: key, bilingual label, unit, interpreter. */
export const SHC_PARAMS: { key: "ph" | "ec" | "oc" | "n" | "p" | "k"; en: string; ta: string; unit: string; interpret: (v: number) => ShcResult }[] = [
  { key: "ph", en: "pH", ta: "pH (அமில/கார அளவு)", unit: "", interpret: interpretPh },
  { key: "ec", en: "EC (salt)", ta: "EC (உப்பு)", unit: "dS/m", interpret: interpretEc },
  { key: "oc", en: "Organic carbon", ta: "கரிம கார்பன்", unit: "%", interpret: interpretOc },
  { key: "n", en: "Available nitrogen", ta: "தழைச்சத்து (N)", unit: "kg/ha", interpret: interpretN },
  { key: "p", en: "Available phosphorus", ta: "மணிச்சத்து (P)", unit: "kg/ha", interpret: interpretP },
  { key: "k", en: "Available potash", ta: "சாம்பல்சத்து (K)", unit: "kg/ha", interpret: interpretK },
];

/* Irrigation critical stages: the moisture-sensitive growth phases where
   water stress costs the most yield. Researched 19 Oct 2026 — TNAU Agritech
   (paddy: seedling, max tillering, panicle initiation, flowering, soft-dough;
   cotton: regular irrigation from boll initiation to boll maturation;
   sugarcane: tillering + grand/formative phase ~101–270 days, ~80% of growth;
   groundnut: branching, pegging, pod filling — life-saving irrigation at
   these stages raised pod yield ~63% in trials). */
export interface WaterStage {
  stageEn: string;
  stageTa: string;
  whenEn: string;
  whenTa: string;
  whyEn: string;
  whyTa: string;
}

export const IRRIGATION_STAGES: Record<string, WaterStage[]> = {
  paddy: [
    { stageEn: "Seedling", stageTa: "நாற்று", whenEn: "first 2 weeks", whenTa: "முதல் 2 வாரம்",
      whyEn: "Shallow roots die fast in a dry nursery — keep beds moist, not flooded.",
      whyTa: "உலர்ந்த நாற்றங்காலில் வேர் விரைவில் காயும் — ஈரம் வையுங்கள், மூழ்கடிக்க வேண்டாம்." },
    { stageEn: "Maximum tillering", stageTa: "அதிக தூர்", whenEn: "30–40 days", whenTa: "30–40 நாட்கள்",
      whyEn: "Water stress now means fewer tillers — and fewer panicles at harvest.",
      whyTa: "இப்போது நீர்ப் பற்றாக்குறை என்றால் தூர் குறையும் — அறுவடையில் கதிர் குறையும்." },
    { stageEn: "Panicle initiation", stageTa: "கதிர் உருவாகும் பருவம்", whenEn: "~55–65 days", whenTa: "~55–65 நாட்கள்",
      whyEn: "The yield is decided here — never let the field crack at this stage.",
      whyTa: "மகசூல் இங்கேதான் முடிவாகிறது — இந்தப் பருவத்தில் வயல் வெடிக்க விடாதீர்கள்." },
    { stageEn: "Flowering", stageTa: "பூக்கும் பருவம்", whenEn: "~75–85 days", whenTa: "~75–85 நாட்கள்",
      whyEn: "Even a day of stress during flowering turns grains chaffy and empty.",
      whyTa: "பூக்கும் நேரத்தில் ஒரு நாள் தண்ணீர்ப் பற்றாக்குறை கூட தானியத்தைப் பதராக்கும்." },
    { stageEn: "Soft dough (milky)", stageTa: "பால் பருவம்", whenEn: "grain filling", whenTa: "தானியம் நிரம்பும் போது",
      whyEn: "Grains are filling — keep 2–5 cm of water until they harden.",
      whyTa: "தானியம் நிரம்புகிறது — கெட்டிப்படும் வரை 2–5 செ.மீ நீர் வையுங்கள்." },
  ],
  cotton: [
    { stageEn: "Square initiation", stageTa: "பூ மொட்டு", whenEn: "40–45 days", whenTa: "40–45 நாட்கள்",
      whyEn: "The first squares set the season's boll load — don't starve them.",
      whyTa: "முதல் மொட்டுகளே பருவ காய் எண்ணிக்கையை முடிவு செய்கின்றன." },
    { stageEn: "Flowering", stageTa: "பூத்தல்", whenEn: "60–70 days", whenTa: "60–70 நாட்கள்",
      whyEn: "Peak water need — stress now drops flowers off the plant.",
      whyTa: "அதிக நீர்த் தேவை — இப்போது பற்றாக்குறை பூக்களை உதிர்க்கும்." },
    { stageEn: "Boll formation & development", stageTa: "காய் உருவாதல்", whenEn: "70–120 days", whenTa: "70–120 நாட்கள்",
      whyEn: "TNAU: irrigate regularly from boll initiation to boll maturation — then stop for clean picking.",
      whyTa: "TNAU: காய் உருவாதல் முதல் முதிர்வு வரை தொடர் நீர்ப்பாசனம் — பின் எடுப்புக்கு நிறுத்தவும்." },
  ],
  sugarcane: [
    { stageEn: "Tillering", stageTa: "தூர் கட்டுதல்", whenEn: "30–90 days", whenTa: "30–90 நாட்கள்",
      whyEn: "More tillers now means more millable canes at harvest.",
      whyTa: "இப்போது அதிக தூர் என்றால் அறுவடையில் அதிக கரும்பு." },
    { stageEn: "Grand growth (formative phase)", stageTa: "பெரு வளர்ச்சி", whenEn: "~90–270 days", whenTa: "~90–270 நாட்கள்",
      whyEn: "About 80% of the crop's growth happens here — the one phase you must never starve of water.",
      whyTa: "பயிரின் ~80% வளர்ச்சி இங்கேதான் — இந்தப் பருவத்தில் நீரைக் குறைக்கவே கூடாது." },
    { stageEn: "Ripening", stageTa: "முதிர்வு", whenEn: "last 60 days", whenTa: "கடைசி 60 நாட்கள்",
      whyEn: "Withhold water now to build sugar — stress at ripening is good stress.",
      whyTa: "சர்க்கரை கூட இப்போது நீரை நிறுத்துங்கள் — முதிர்வில் தண்ணீர்ப் பற்றாக்குறை நல்லது." },
  ],
  groundnut: [
    { stageEn: "Branching", stageTa: "கிளை பருவம்", whenEn: "20–30 days", whenTa: "20–30 நாட்கள்",
      whyEn: "Branches carry the flowers — a weak canopy now caps the yield.",
      whyTa: "கிளைகளே பூக்களைத் தாங்கும் — இப்போது வலுவிழந்தால் மகசூல் குறையும்." },
    { stageEn: "Flowering & pegging", stageTa: "பூத்தல் + ஆணி இறங்குதல்", whenEn: "35–50 days", whenTa: "35–50 நாட்கள்",
      whyEn: "Pegs must enter moist soil — dry soil at pegging means pods never form.",
      whyTa: "ஆணி ஈர மண்ணில் இறங்க வேண்டும் — இப்போது மண் உலர்ந்தால் காயே உருவாகாது." },
    { stageEn: "Pod filling", stageTa: "காய் நிரம்புதல்", whenEn: "60–90 days", whenTa: "60–90 நாட்கள்",
      whyEn: "Life-saving irrigation at this stage raised pod yield ~63% in trials.",
      whyTa: "இந்தப் பருவ உயிர் காக்கும் நீர்ப்பாசனம் மகசூலை ~63% உயர்த்தியது." },
  ],
  banana: [
    { stageEn: "Bunch emergence", stageTa: "குலை வெளிவருதல்", whenEn: "8–10 months", whenTa: "8–10 மாதம்",
      whyEn: "Stress here means a short, thin bunch that never fills out.",
      whyTa: "இப்போது பற்றாக்குறை என்றால் குலை சிறுத்து நிரம்பாது." },
    { stageEn: "Bunch filling", stageTa: "குலை நிரம்புதல்", whenEn: "till harvest", whenTa: "அறுவடை வரை",
      whyEn: "Fingers fill only with steady moisture — irrigate weekly through filling.",
      whyTa: "தொடர் ஈரத்தில்தான் காய் நிரம்பும் — நிரம்பும் வரை வாரந்தோறும் நீர் பாய்ச்சவும்." },
  ],
  coconut: [
    { stageEn: "Summer months", stageTa: "கோடை மாதங்கள்", whenEn: "Mar–May", whenTa: "மார்ச்–மே",
      whyEn: "Button shedding in summer is mostly thirst — irrigate 2–3 times a week.",
      whyTa: "கோடையில் பிஞ்சு உதிர்வு பெரும்பாலும் தாகம் — வாரம் 2–3 முறை நீர் பாய்ச்சவும்." },
    { stageEn: "Nut development", stageTa: "தேங்காய் வளர்ச்சி", whenEn: "year-round", whenTa: "ஆண்டு முழுவதும்",
      whyEn: "Steady water keeps the kernel thick and the copra heavy.",
      whyTa: "தொடர் நீர் பருப்பைத் தடிமனாக்கும், கொப்பரையைக் கனமாக்கும்." },
  ],
};

/* Pest forecast: what strikes which crop in which months in Tamil Nadu.
   diagId links back to the Crop Doctor entry when one exists. */
export interface PestWatch {
  cropId: string;
  diagId: string | null;
  months: number[]; // 0 = January
  nameEn: string;
  nameTa: string;
  tipEn: string;
  tipTa: string;
}

export const PEST_FORECAST: PestWatch[] = [
  { cropId: "paddy", diagId: "paddy-blast", months: [9, 10, 11, 0], nameEn: "Rice blast season", nameTa: "குலைநோய் காலம்", tipEn: "Cool NE-monsoon nights + dense samba crop = blast weather. Walk the field weekly; catch the first spots.", tipTa: "குளிர் இரவு + அடர்ந்த சம்பா = நோய் காலம். வாரந்தோறும் வயலைச் சுற்றிப் பாருங்கள்." },
  { cropId: "paddy", diagId: "paddy-stemborer", months: [6, 7, 8], nameEn: "Stem borer build-up", nameTa: "தண்டுத் துளைப்பான்", tipEn: "Samba transplanting season — moths lay eggs on young tillers. Light traps now save a spray later.", tipTa: "சம்பா நடவு காலம் — இளம் தூரில் முட்டை. இப்போது விளக்குப் பொறி வைத்தால் பின் மருந்து மிச்சம்." },
  { cropId: "paddy", diagId: "paddy-sheathblight", months: [7, 8, 9, 10], nameEn: "Sheath blight pressure", nameTa: "உறை கருகல் அழுத்தம்", tipEn: "Humid, closed canopy months. Drain the field for 2–3 days between irrigations.", tipTa: "ஈரப்பத மாதங்கள். நீர்ப்பாசன இடைவெளியில் 2–3 நாள் வடிக்கவும்." },
  { cropId: "paddy", diagId: "paddy-tungro", months: [8, 9, 10], nameEn: "Tungro vector watch", nameTa: "துங்ரோ கண்காணிப்பு", tipEn: "Green leafhoppers peak after the rains. Rogue any stunted yellow hills immediately — no cure exists.", tipTa: "மழைக்குப் பின் தத்துப்பூச்சி அதிகம். குன்றிய மஞ்சள் செடிகளை உடனே அகற்றவும்." },
  { cropId: "cotton", diagId: "cotton-pinkbollworm", months: [8, 9, 10, 11], nameEn: "Pink bollworm peak", nameTa: "இளஞ்சிவப்பு காய்ப்புழு", tipEn: "Boll-formation months. Pheromone traps (8/ha) tell you the moth pressure — scout before you spray.", tipTa: "காய் உருவாகும் மாதங்கள். ஃபெரமோன் பொறி வைத்து கண்காணிக்கவும்." },
  { cropId: "cotton", diagId: "cotton-jassid", months: [7, 8, 9], nameEn: "Jassid build-up", nameTa: "தத்துப்பூச்சி", tipEn: "Young winter cotton is most vulnerable. Check leaf undersides; hold nitrogen if hoppers rise.", tipTa: "இளம் பருத்தி பாதிக்கும். இலை அடிப்பகுதியைப் பாருங்கள்." },
  { cropId: "cotton", diagId: "cotton-whitefly", months: [6, 7, 8], nameEn: "Whitefly pressure", nameTa: "வெள்ளை ஈ", tipEn: "Hot humid months. Yellow sticky traps (10/ha) + never spray broad insecticides that kill predators.", tipTa: "மஞ்சள் ஒட்டும் பொறி வைக்கவும்; எதிரி பூச்சிகளைக் கொல்லும் மருந்து வேண்டாம்." },
  { cropId: "groundnut", diagId: "gn-tikka", months: [6, 7, 8], nameEn: "Tikka leaf spot", nameTa: "டிக்கா இலைப்புள்ளி", tipEn: "Rain-splash spreads it. Wider spacing + first-spot neem spray beats a late fungicide.", tipTa: "மழைத் தெறிப்பில் பரவும். முதல் புள்ளியிலேயே வேப்பச் சாறு." },
  { cropId: "groundnut", diagId: "gn-rust", months: [8, 9], nameEn: "Rust window", nameTa: "துருநோய் காலம்", tipEn: "Late-season humidity. Rust explodes in days — the first orange pustules are the moment to act.", tipTa: "முதல் ஆரஞ்சு கொப்புளம் தெரிந்ததுமே செயல்படுங்கள்." },
  { cropId: "groundnut", diagId: "gn-whitegrub", months: [4, 5], nameEn: "White grub prep", nameTa: "வெள்ளைப் புழு தடுப்பு", tipEn: "Beetles fly in May–June. Light traps now + summer ploughing = fewer grubs eating your pods later.", tipTa: "மே–ஜூனில் விளக்குப் பொறி + கோடை உழவு." },
  { cropId: "sugarcane", diagId: "cane-redrot", months: [5, 6, 7, 8], nameEn: "Red rot watch", nameTa: "செந்நோய் கண்காணிப்பு", tipEn: "Monsoon stress triggers red rot in susceptible varieties. Split a suspect cane — red tissue means rogue the clump.", tipTa: "சந்தேகக் கரும்பைப் பிளந்து பாருங்கள் — சிவப்பு என்றால் கொத்தை அகற்றவும்." },
  { cropId: "sugarcane", diagId: "cane-topborer", months: [3, 4, 5, 6], nameEn: "Top borer season", nameTa: "நுனித் துளைப்பான்", tipEn: "Grand-growth phase. Dead hearts now → release Trichogramma, don't reach for the sprayer first.", tipTa: "குருத்து காய்ந்தால் டிரைக்கோகிராம்மா விடவும்." },
  { cropId: "banana", diagId: "banana-sigatoka", months: [5, 6, 7, 8, 9, 10], nameEn: "Sigatoka pressure", nameTa: "சிகடோகா அழுத்தம்", tipEn: "Wet months. Remove spotted lower leaves and keep air moving — dense plantations suffer most.", tipTa: "பாதித்த கீழ் இலைகளை அகற்றி காற்றோட்டம் தரவும்." },
  { cropId: "coconut", diagId: "coconut-budrot", months: [5, 6, 7, 8, 9], nameEn: "Bud rot risk", nameTa: "குருத்து அழுகல்", tipEn: "Waterlogged basins in the monsoon invite bud rot. Drain the basin; a foul smell means treat today.", tipTa: "மழையில் தட்டு நீர் தேங்காமல் பாருங்கள்; துர்நாற்றம் என்றால் உடனே சிகிச்சை." },
  { cropId: "coconut", diagId: "coconut-rhinoceros", months: [3, 4, 5], nameEn: "Rhinoceros beetle", nameTa: "காண்டாமிருக வண்டு", tipEn: "Breeding season in manure pits. Cover FYM heaps; fill crowns with neem cake + sand.", tipTa: "எருக் குவியலை மூடவும்; குருத்தில் வேப்பம் புண்ணாக்கு + மணல்." },
  { cropId: "coconut", diagId: "coconut-mite", months: [0, 1, 2, 3], nameEn: "Mite season", nameTa: "சிலந்திப் பூச்சி காலம்", tipEn: "Dry months. Never let palms go water-stressed — stressed nuts drop to mites first.", tipTa: "வறண்ட மாதங்கள். மரங்களுக்கு நீர்ப் பற்றாக்குறை வரவிடாதீர்கள்." },
  { cropId: "maize", diagId: "maize-faw", months: [0, 1, 2, 3], nameEn: "Fall armyworm season", nameTa: "படைப்புழு காலம்", tipEn: "Young winter–summer maize is the target. Check the whorl for frass every week — neem into the whorl beats any late spray.", tipTa: "இளம் சோளம் இலக்கு. வாரந்தோறும் குருத்தில் மரத்தூள் கழிவைப் பார்க்கவும்." },
  { cropId: "turmeric", diagId: "turmeric-leafspot", months: [6, 7, 8, 9, 10], nameEn: "Turmeric leaf spot season", nameTa: "மஞ்சள் இலைப்புள்ளி காலம்", tipEn: "Wet months are peak season. Walk the field after rains — the first spots with yellow halos are the moment to spray neem.", tipTa: "ஈர மாதங்கள். மழைக்குப் பின் வயலைப் பாருங்கள் — முதல் புள்ளியிலேயே செயல்படுங்கள்." },
  { cropId: "turmeric", diagId: "turmeric-rhizomerot", months: [8, 9, 10], nameEn: "Rhizome rot risk", nameTa: "கிழங்கு அழுகல் ஆபத்து", tipEn: "Waterlogged patches turn into rot patches. Leaves wilting on wet soil? Pull one plant and check the rhizome — soft and smelly means rogue it now.", tipTa: "ஈர மண்ணில் இலை வாடினால் ஒரு செடியைப் பிடுங்கிப் பாருங்கள் — மெத்து கிழங்கு என்றால் உடனே அகற்றவும்." },
  { cropId: "turmeric", diagId: "turmeric-scale", months: [4, 5, 6], nameEn: "Turmeric planting prep", nameTa: "மஞ்சள் நடவு தயாரிப்பு", tipEn: "Scales ride in on seed rhizomes. Inspect stored seed before planting — dip in neem extract and reject infested lots.", tipTa: "நடவுக்கு முன் சேமித்த விதைக் கிழங்கைப் பரிசோதிக்கவும் — பேன் இருந்தால் நிராகரிக்கவும்." },
];

/* Economic thresholds: the field counts that justify a spray. The rule of the
   doctor is "count first, spray second" — most calendar sprays are wasted
   money. Values follow standard IPM/ETL guidance for these crops. */
export const TREAT_RULES: Record<string, { en: string; ta: string }> = {
  "paddy-blast": { en: "Spots on more than 5% of leaves, or ANY blast on the panicle neck", ta: "5% இலைகளுக்கு மேல் புள்ளி, அல்லது கதிரில் ஏதேனும் குலைநோய்" },
  "paddy-blb": { en: "Streaks spreading past the flag leaf, or 10%+ hills affected in wet weather", ta: "கொடி இலையைத் தாண்டிப் பரவினால், அல்லது 10%+ செடிகள்" },
  "paddy-stemborer": { en: "Dead hearts above 5% in young crop, or white ears above 2%", ta: "இளம் பயிரில் 5%+ குருத்து காய்தல், அல்லது 2%+ வெள்ளைக் கதிர்" },
  "paddy-sheathblight": { en: "Spots on 10%+ tillers and climbing upward", ta: "10%+ தூர்களில் புள்ளி, மேலே பரவினால்" },
  "paddy-tungro": { en: "ANY stunted yellow hills — rogue immediately, there is no spray threshold", ta: "ஏதேனும் குன்றிய மஞ்சள் செடி — உடனே அகற்றவும்; மருந்து அளவு இல்லை" },
  "cotton-pinkbollworm": { en: "Trap catches above 8 moths/night, or 10%+ damaged bolls", ta: "பொறியில் இரவுக்கு 8+ அந்துப்பூச்சி, அல்லது 10%+ சேதக் காய்" },
  "cotton-jassid": { en: "More than 2 jassids per leaf on 10%+ of plants", ta: "10%+ செடிகளில் இலைக்கு 2+ தத்துப்பூச்சி" },
  "cotton-whitefly": { en: "More than 5 adults per leaf underside", ta: "இலை அடிப்பகுதியில் 5+ வெள்ளை ஈ" },
  "gn-tikka": { en: "Spots on 10%+ plants before pegging stage", ta: "முளை விடும் முன் 10%+ செடிகளில் புள்ளி" },
  "gn-rust": { en: "First orange pustules — rust explodes in days, do not wait", ta: "முதல் ஆரஞ்சு கொப்புளம் — காத்திருக்க வேண்டாம்" },
  "gn-whitegrub": { en: "Preventive at sowing; more than 1 grub per square metre of soil", ta: "விதைப்பில் தடுப்பு; சதுர மீட்டருக்கு 1+ புழு" },
  "cane-redrot": { en: "ANY red rot — rogue the whole clump, no spray will save it", ta: "ஏதேனும் செந்நோய் — கொத்தையே அகற்றவும்; மருந்து காப்பாற்றாது" },
  "cane-topborer": { en: "Dead hearts above 5%", ta: "5%+ குருத்து காய்தல்" },
  "banana-sigatoka": { en: "Spots on 10%+ of the youngest leaves' area", ta: "இளம் இலைகளில் 10%+ பரப்பில் புள்ளி" },
  "banana-wilt": { en: "ANY wilted plant — destroy it, there is no cure to buy", ta: "ஏதேனும் வாடிய செடி — அழிக்கவும்; மருந்தில் குணம் இல்லை" },
  "coconut-budrot": { en: "ANY foul smell from the crown — treat the same day", ta: "குருத்தில் ஏதேனும் துர்நாற்றம் — அன்றே சிகிச்சை" },
  "coconut-rhinoceros": { en: "Fresh V-cuts on 10%+ of palms", ta: "10%+ மரங்களில் புதிய V-வெட்டு" },
  "coconut-mite": { en: "Brown patches on 10%+ of young nuts", ta: "10%+ இளம் காய்களில் பழுப்புத் திட்டு" },
  "turmeric-leafspot": { en: "Spots on 10%+ plants, or spreading fast after rain", ta: "10%+ செடிகளில் புள்ளி, அல்லது மழைக்குப் பின் வேகப் பரவல்" },
  "turmeric-leafblotch": { en: "Blotches merging on the upper leaves", ta: "மேல் இலைகளில் கறைகள் இணைந்தால்" },
  "turmeric-rhizomerot": { en: "ANY soft, foul-smelling rhizome — rogue the plant today", ta: "ஏதேனும் மெத்து, துர்நாற்ற கிழங்கு — அன்றே செடியை அகற்றவும்" },
  "turmeric-scale": { en: "Scales on more than 10% of seed rhizomes at planting", ta: "நடவில் 10%+ விதைக் கிழங்குகளில் பேன்" },
};

/* Crop playbook: what to do at each growth stage, per crop. The stage-wise
   to-dos Plantix ships as "cultivation tips" — here as a calm offline
   timeline so nothing in the season is forgotten. */
export interface PlayStage {
  stageEn: string; stageTa: string;
  whenEn: string; whenTa: string;
  tasksEn: string[]; tasksTa: string[];
}

export const PLAYBOOK: Record<string, PlayStage[]> = {
  paddy: [
    { stageEn: "Nursery", stageTa: "நாற்றங்காலம்", whenEn: "3–4 weeks before transplanting", whenTa: "நடவுக்கு 3–4 வாரம் முன்",
      tasksEn: ["Treat seed with Trichoderma / Pseudomonas before sowing", "Keep the nursery weed-free; rogue hopper-infested seedlings"],
      tasksTa: ["விதைப்புக்கு முன் டிரைக்கோடெர்மா நேர்த்தி", "நாற்றங்காலில் களை இல்லாமல் பார்க்கவும்"] },
    { stageEn: "Transplanting", stageTa: "நடவு", whenEn: "Seedlings 21–25 days old", whenTa: "21–25 நாள் நாற்று",
      tasksEn: ["Shallow planting, 2–3 seedlings per hill — deep planting delays tillering", "Apply basal fertilizer on the day of transplanting", "Do not clip seedling leaf tips (invites bacterial blight)"],
      tasksTa: ["ஆழமில்லாமல் நடவும், குத்துக்கு 2–3 நாற்று", "நடவன்று அடியுரம் இடவும்", "நாற்று நுனியைக் கிள்ள வேண்டாம்"] },
    { stageEn: "Tillering", stageTa: "தூர் கட்டும் பருவம்", whenEn: "20–45 days after transplanting", whenTa: "நடவுக்கு 20–45 நாள்",
      tasksEn: ["Top-dress nitrogen at active tillering", "Watch for stem borer dead hearts — count before spraying", "Alternate wetting and drying saves water without yield loss"],
      tasksTa: ["தூர் கட்டும்போது தழைச்சத்து மேலுரம்", "தண்டுத் துளைப்பான் கண்காணிப்பு — எண்ணிப் பார்த்து மருந்து", "மாற்று நனைத்தல்-உலர்த்தல் நீரை மிச்சப்படுத்தும்"] },
    { stageEn: "Flowering", stageTa: "பூக்கும் பருவம்", whenEn: "60–90 days", whenTa: "60–90 நாள்",
      tasksEn: ["Never let the field dry at flowering — even a day of stress causes chaffy grains", "Scout for neck blast and BPH on the flag leaf", "Top-dress the last nitrogen + potash at panicle initiation"],
      tasksTa: ["பூக்கும்போது வயல் காய விட வேண்டாம்", "குலைநோய், புகையான் கண்காணிப்பு", "கதிர் உருவாகும்போது கடைசி உரம்"] },
    { stageEn: "Harvest", stageTa: "அறுவடை", whenEn: "80% of panicles golden", whenTa: "80% கதிர் பொன்னிறம்",
      tasksEn: ["Drain the field 7–10 days before harvest", "Harvest at 20–22% grain moisture; dry to 14% before storage", "Compare the trader's price with MSP before you agree — the price board is one tap away"],
      tasksTa: ["அறுவடைக்கு 7–10 நாள் முன் வடிக்கவும்", "14% ஈரப்பதம் வரை உலர்த்தி சேமிக்கவும்", "MSP-யுடன் ஒப்பிட்டு விற்கவும்"] },
  ],
  cotton: [
    { stageEn: "Sowing", stageTa: "விதைப்பு", whenEn: "With the season window", whenTa: "பருவக் காலத்தில்",
      tasksEn: ["Seed treatment with bio-agents; delinted acid-treated seed for Bt hybrids", "Basal fertilizer + FYM; ridge sowing for drainage"],
      tasksTa: ["விதை நேர்த்தி", "அடியுரம் + தொழு உரம்; வடிகால் பார் விதைப்பு"] },
    { stageEn: "Vegetative", stageTa: "வளர்ச்சிப் பருவம்", whenEn: "30–60 days", whenTa: "30–60 நாள்",
      tasksEn: ["First weeding + earthing up at 30 days", "Watch leaf undersides for jassids and whitefly", "Install pheromone traps (8/ha) before squaring"],
      tasksTa: ["30-ம் நாள் களை + மண் அணைத்தல்", "தத்துப்பூச்சி, வெள்ளை ஈ கண்காணிப்பு", "ஃபெரமோன் பொறி வைக்கவும்"] },
    { stageEn: "Squaring & flowering", stageTa: "பூ, பிஞ்சு", whenEn: "60–100 days", whenTa: "60–100 நாள்",
      tasksEn: ["Top-dress at 40–45 days; do not delay", "Scout squares for pink bollworm rosetting", "Irrigate at flowering — moisture stress sheds squares"],
      tasksTa: ["40–45-ம் நாள் மேலுரம்", "காய்ப்புழு கண்காணிப்பு", "பூக்கும்போது நீர் தவறாமல்"] },
    { stageEn: "Boll development", stageTa: "காய் வளர்ச்சி", whenEn: "100–140 days", whenTa: "100–140 நாள்",
      tasksEn: ["Count damaged bolls weekly — spray only past threshold", "Stop nitrogen; excess N delays maturity and invites pests"],
      tasksTa: ["வாரந்தோறும் சேதக் காய் எண்ணிக்கை", "தழைச்சத்து நிறுத்தவும்"] },
    { stageEn: "Picking", stageTa: "பறிப்பு", whenEn: "Bolls fully open", whenTa: "காய் முழுதும் திறந்ததும்",
      tasksEn: ["Pick dry kapas in the morning; keep stained kapas separate — it fetches less", "Do not extend the season past January — destroy stalks to break pink bollworm"],
      tasksTa: ["காலையில் உலர்ந்த பருத்தி பறிக்கவும்; கறை பருத்தியைத் தனியே வைக்கவும்", "ஜனவரிக்குப் பின் பருவம் நீட்ட வேண்டாம் — தண்டுகளை அழிக்கவும்"] },
  ],
  groundnut: [
    { stageEn: "Sowing", stageTa: "விதைப்பு", whenEn: "With good soil moisture", whenTa: "மண் ஈரத்துடன்",
      tasksEn: ["Full fertilizer dose as basal — no top-dressing later", "Treat seed with Trichoderma + Rhizobium", "Sow at the right depth (5 cm); too deep delays emergence"],
      tasksTa: ["விதைப்பிலேயே முழு உரம்", "விதை நேர்த்தி (டிரைக்கோடெர்மா + ரைசோபியம்)", "5 செ.மீ ஆழ விதைப்பு"] },
    { stageEn: "Flowering & pegging", stageTa: "பூ, முளை", whenEn: "35–60 days", whenTa: "35–60 நாள்",
      tasksEn: ["Earth up soil around the base so pegs enter easily", "First tikka spray at the first spots — not later", "Light but frequent irrigation; waterlogging rots pods"],
      tasksTa: ["அடியில் மண் அணைக்கவும்", "முதல் புள்ளியிலேயே டிக்கா மருந்து", "நீர் தேங்க விட வேண்டாம்"] },
    { stageEn: "Pod filling", stageTa: "காய் நிரம்புதல்", whenEn: "60–90 days", whenTa: "60–90 நாள்",
      tasksEn: ["Gypsum at flowering if soil test says calcium is low", "Watch for rust on leaf undersides", "Do not let the field crack dry — pods need steady moisture"],
      tasksTa: ["தேவைப்பட்டால் ஜிப்சம்", "துருநோய் கண்காணிப்பு", "வயல் வெடிக்க விட வேண்டாம்"] },
    { stageEn: "Harvest", stageTa: "அறுவடை", whenEn: "70–80% pods mature (brown inside)", whenTa: "70–80% காய் முற்றியதும்",
      tasksEn: ["Sample a few plants — shell them and check kernel colour before full harvest", "Dry pods to 8–9% moisture before storage; damp pods grow aflatoxin"],
      tasksTa: ["சில செடிகளைப் பிடுங்கி காய் பார்த்து முடிவு", "8–9% ஈரம் வரை உலர்த்தவும்"] },
  ],
  sugarcane: [
    { stageEn: "Planting", stageTa: "நடவு", whenEn: "Season window", whenTa: "பருவக் காலம்",
      tasksEn: ["Use disease-free setts; hot-water treat (52°C, 30 min) against red rot", "Basal fertilizer in the furrow, setts covered with 5 cm soil"],
      tasksTa: ["நோயற்ற கரணை; வெந்நீர் நேர்த்தி", "உழவுசாலில் அடியுரம்"] },
    { stageEn: "Tillering", stageTa: "தூர் கட்டுதல்", whenEn: "45–120 days", whenTa: "45–120 நாள்",
      tasksEn: ["Gap-fill within 30 days so the stand is uniform", "Trash mulch between rows — smothers weeds, keeps moisture", "Second fertilizer split at 45 days"],
      tasksTa: ["30 நாளில் இடைவெளி நிரப்பவும்", "சோகை மூடாக்கு", "45-ம் நாள் இரண்டாம் உரம்"] },
    { stageEn: "Grand growth", stageTa: "தீவிர வளர்ச்சி", whenEn: "120–270 days", whenTa: "120–270 நாள்",
      tasksEn: ["Watch for top borer dead hearts — release Trichogramma", "Third fertilizer split at 90 days; tie canes to prevent lodging", "Detrash dry leaves for air and light"],
      tasksTa: ["நுனித் துளைப்பான் கண்காணிப்பு", "90-ம் நாள் மூன்றாம் உரம்; கரும்பு கட்டவும்", "உலர்ந்த சோகை நீக்கவும்"] },
    { stageEn: "Maturity", stageTa: "முதிர்ச்சி", whenEn: "10–12 months", whenTa: "10–12 மாதம்",
      tasksEn: ["Stop irrigation 2–3 weeks before harvest — it raises sugar recovery", "Do not delay harvest past maturity; weight and sugar both fall"],
      tasksTa: ["அறுவடைக்கு 2–3 வாரம் முன் நீர் நிறுத்தவும்", "முதிர்ந்ததும் தாமதிக்க வேண்டாம்"] },
    { stageEn: "Ratoon", stageTa: "மறுதாம்பு", whenEn: "After harvest", whenTa: "அறுவடைக்குப் பின்",
      tasksEn: ["Cut close to the ground; never ratoon a red-rot field", "Stubble shave + gap fill + fertilizer within 3 weeks"],
      tasksTa: ["தரைமட்ட அறுவடை; செந்நோய் வயலில் மறுதாம்பு வேண்டாம்", "3 வாரத்தில் உரம் + இடைவெளி நிரப்புதல்"] },
  ],
  banana: [
    { stageEn: "Planting", stageTa: "நடவு", whenEn: "June–July ideal", whenTa: "ஜூன்–ஜூலை சிறந்தது",
      tasksEn: ["Tissue-culture or disease-free suckers only — Panama wilt travels in suckers", "Pit 45 cm³ with FYM + neem cake; plant at the right depth"],
      tasksTa: ["நோயற்ற கன்று மட்டும்", "குழியில் தொழு உரம் + வேப்பம் புண்ணாக்கு"] },
    { stageEn: "Vegetative", stageTa: "வளர்ச்சி", whenEn: "Months 1–6", whenTa: "1–6 மாதம்",
      tasksEn: ["Keep one healthy sucker as follower; desucker the rest monthly", "Fertilizer splits at 3rd and 5th month", "Remove sigatoka-spotted lower leaves"],
      tasksTa: ["ஒரு பக்கக் கன்று வைத்து மற்றவை நீக்கவும்", "3, 5-ம் மாத உரம்", "பாதித்த கீழ் இலை நீக்கவும்"] },
    { stageEn: "Shooting", stageTa: "குலை விடுதல்", whenEn: "Months 7–9", whenTa: "7–9 மாதம்",
      tasksEn: ["Third fertilizer split at 7th month; never water-stress now", "Propping: support the bunch with bamboo before it leans", "Remove the male bud after the last hand forms"],
      tasksTa: ["7-ம் மாத உரம்; நீர்ப் பற்றாக்குறை வேண்டாம்", "குலைக்கு மூங்கில் ஆதரவு", "ஆண் பூ நீக்கவும்"] },
    { stageEn: "Harvest", stageTa: "அறுவடை", whenEn: "75–80% maturity (angles still visible)", whenTa: "75–80% முதிர்ச்சி",
      tasksEn: ["Harvest mature — not overripe — for transport; cut the bunch, not the plant", "Grade hands; bruised fruit halves the price"],
      tasksTa: ["போக்குவரத்துக்கு முற்றிய குலை அறுவடை", "தரம் பிரித்து விற்கவும்"] },
  ],
  coconut: [
    { stageEn: "Planting", stageTa: "நடவு", whenEn: "June–July", whenTa: "ஜூன்–ஜூலை",
      tasksEn: ["Pit 1 m³, 6–9 month old healthy seedlings", "Basin + mulch; water twice a week the first summer"],
      tasksTa: ["1 மீ³ குழி, 6–9 மாத ஆரோக்கியக் கன்று", "தட்டு + மூடாக்கு; முதல் கோடையில் வாரம் 2 நீர்"] },
    { stageEn: "Juvenile care", stageTa: "இளம் பராமரிப்பு", whenEn: "Years 1–5", whenTa: "1–5 ஆண்டு",
      tasksEn: ["Fertilizer in two splits with the monsoons, in a 1.8 m basin", "Intercrop with banana/vegetables for early income", "Watch the crown — bud rot kills young palms fastest"],
      tasksTa: ["பருவமழையில் 2 தவணை உரம்", "ஊடுபயிர் வருமானம்", "குருத்து கண்காணிப்பு"] },
    { stageEn: "Bearing", stageTa: "காய்ப்பு", whenEn: "Year 6+", whenTa: "6-ம் ஆண்டு முதல்",
      tasksEn: ["Full 500:320:1200 g/palm/year + 50 kg organic manure", "Harvest every 45–60 days — over-mature nuts fall and crack", "Neem cake + sand in the crown quarterly against rhinoceros beetle"],
      tasksTa: ["முழு உரம் + 50 கிலோ தொழு உரம்", "45–60 நாளில் அறுவடை", "குருத்தில் வேப்பம் புண்ணாக்கு + மணல்"] },
    { stageEn: "Year-round", stageTa: "ஆண்டு முழுதும்", whenEn: "Every month", whenTa: "ஒவ்வொரு மாதமும்",
      tasksEn: ["Never heap fertilizer against the trunk", "Keep manure pits covered — they breed rhinoceros beetle", "Summer irrigation decides the next 6 months' nut set"],
      tasksTa: ["தண்டை ஒட்டி உரம் குவிக்க வேண்டாம்", "எருக் குழி மூடவும்", "கோடை நீர்ப்பாசனம் முக்கியம்"] },
  ],
};

export interface Scheme {
  id: string;
  nameEn: string;
  nameTa: string;
  tagEn: string;
  tagTa: string;
  benefitEn: string;
  benefitTa: string;
  eligibilityEn: string[];
  eligibilityTa: string[];
  docsEn: string[];
  docsTa: string[];
  deadlineEn: string;
  deadlineTa: string;
  howEn: string[];
  howTa: string[];
  source: string;
}

export const SCHEMES: Scheme[] = [
  {
    id: "pmfby", nameEn: "PM Fasal Bima Yojana", nameTa: "பயிர் காப்பீடு திட்டம்",
    tagEn: "Crop insurance", tagTa: "பயிர் காப்பீடு",
    benefitEn: "Insurance against crop loss from drought, flood, hail, cyclone and pests. You pay only 2% of the sum insured for kharif crops (1.5% rabi, 5% commercial/horticulture) — the government pays the rest.",
    benefitTa: "வறட்சி, வெள்ளம், ஆலங்கட்டி, புயல் இழப்புக்குக் காப்பீடு. காரீஃப் பயிருக்கு நீங்கள் 2% மட்டும் (ரபி 1.5%, வணிகப் பயிர் 5%) — மீதியை அரசு செலுத்தும்.",
    eligibilityEn: ["Any farmer — owner, tenant or sharecropper", "Growing a notified crop in a notified area", "Voluntary for everyone, including crop-loan borrowers"],
    eligibilityTa: ["உரிமையாளர், குத்தகை, பங்குதாரர் — யாரும்", "அறிவிக்கப்பட்ட பகுதியில் அறிவிக்கப்பட்ட பயிர்", "அனைவருக்கும் விருப்பம் — கடன் விவசாயிகளுக்கும்"],
    docsEn: ["Aadhaar", "Land records (patta/chitta) or tenancy agreement", "Bank passbook", "Sowing certificate from village officer"],
    docsTa: ["ஆதார்", "பட்டா/சிட்டா அல்லது குத்தகை ஒப்பந்தம்", "வங்கி பாஸ்புக்", "கிராம அலுவலர் விதைப்புச் சான்று"],
    deadlineEn: "Rabi (samba/thaladi) enrolment typically closes mid-Nov to Dec — Thanjavur's 2026 deadline was Nov 15. Kharif closes ~Jul 31.",
    deadlineTa: "ரபி (சம்பா/தாளடி) பதிவு பொதுவாக நவம்பர்–டிசம்பரில் முடியும் — தஞ்சாவூரில் 2026-ல் நவ 15. காரீஃப் ~ஜூலை 31.",
    howEn: ["Enrol at your bank, CSC, or Primary Agricultural Cooperative Society", "Report any crop loss within 72 hours on the Crop Insurance App with geotagged photos", "Track claims with your application number; helpline 14447"],
    howTa: ["வங்கி, பொது சேவை மையம் அல்லது கூட்டுறவு சங்கத்தில் பதிவு", "இழப்பை 72 மணி நேரத்தில் புகார் செய்து புகைப்படம் இணைக்கவும்", "விண்ணப்ப எண்ணில் நிலை அறியவும்; உதவி எண் 14447"],
    source: "pmfby.gov.in · Ministry of Agriculture",
  },
  {
    id: "pmkisan", nameEn: "PM-KISAN", nameTa: "பிஎம்-கிசான்",
    tagEn: "Income support", tagTa: "வருமான உதவி",
    benefitEn: "₹6,000 per year in three ₹2,000 instalments, paid directly to your bank account (DBT).",
    benefitTa: "ஆண்டுக்கு ₹6,000 — மூன்று தவணைகளில் ₹2,000 வீதம் நேரடியாக வங்கிக் கணக்கில்.",
    eligibilityEn: ["Land-holding farmer families", "Aadhaar-seeded bank account", "e-KYC completed (mandatory for every instalment)"],
    eligibilityTa: ["நிலம் வைத்திருக்கும் விவசாயக் குடும்பம்", "ஆதார் இணைத்த வங்கிக் கணக்கு", "e-KYC கட்டாயம் (ஒவ்வொரு தவணைக்கும்)"],
    docsEn: ["Aadhaar", "Land records", "Bank account details", "Mobile number linked to Aadhaar"],
    docsTa: ["ஆதார்", "நில ஆவணங்கள்", "வங்கிக் கணக்கு விவரம்", "ஆதாருடன் இணைந்த மொபைல் எண்"],
    deadlineEn: "No fixed deadline, but instalments stop if e-KYC lapses — check status every season.",
    deadlineTa: "நிலையான காலக்கெடு இல்லை; e-KYC தவறினால் தவணை நிற்கும் — ஒவ்வொரு பருவமும் நிலை பார்க்கவும்.",
    howEn: ["Register at pmkisan.gov.in or your CSC", "Complete e-KYC (OTP, biometric or face-auth at CSC)", "Check beneficiary status with your Aadhaar/mobile number"],
    howTa: ["pmkisan.gov.in அல்லது CSC-யில் பதிவு", "e-KYC முடிக்கவும்", "ஆதார்/மொபைல் எண்ணில் பயனாளி நிலை பார்க்கவும்"],
    source: "pmkisan.gov.in",
  },
  {
    id: "kcc", nameEn: "Kisan Credit Card", nameTa: "கிசான் கடன் அட்டை",
    tagEn: "Crop loan", tagTa: "பயிர்க் கடன்",
    benefitEn: "Working-capital loan up to ₹3 lakh for crop expenses. Interest subvention brings the effective rate to 4% if you repay on time.",
    benefitTa: "பயிர்ச் செலவுக்கு ₹3 லட்சம் வரை கடன். சரியான நேரத்தில் திருப்பினால் வட்டி 4% ஆகும்.",
    eligibilityEn: ["Individual farmers, joint borrowers, tenant/sharecropper farmers", "Crop loan purpose (inputs, labour, harvest costs)"],
    eligibilityTa: ["தனி/கூட்டு விவசாயிகள், குத்தகைதாரர்", "பயிர்ச் செலவு நோக்கம்"],
    docsEn: ["Aadhaar and PAN", "Land records or tenancy proof", "Passport photo", "Crop sown details"],
    docsTa: ["ஆதார், பான்", "நில ஆவணம்", "புகைப்படம்", "பயிர் விவரம்"],
    deadlineEn: "Apply any time at your bank; renew the limit yearly with fresh crop details.",
    deadlineTa: "எப்போதும் வங்கியில் விண்ணப்பிக்கலாம்; ஆண்டுதோறும் புதுப்பிக்கவும்.",
    howEn: ["Apply at any bank branch or through the JanSamarth portal", "Link it to PMFBY enrolment so insurance premium is handled automatically", "Repay within the due date to keep the 4% rate"],
    howTa: ["வங்கிக் கிளையில் விண்ணப்பிக்கவும்", "பயிர் காப்பீட்டுடன் இணைக்கவும்", "காலக்கெடுவில் திருப்பி 4% வட்டியைத் தக்கவும்"],
    source: "Banks · JanSamarth portal",
  },
  {
    id: "soilhealth", nameEn: "Soil Health Card", nameTa: "மண் வள அட்டை",
    tagEn: "Free soil test", tagTa: "இலவச மண் பரிசோதனை",
    benefitEn: "Free lab test of your soil with a card showing exactly which nutrients are short — so you buy only the fertiliser you need.",
    benefitTa: "உங்கள் மண்ணின் இலவச ஆய்வு — எந்த சத்து குறைவு என்று அட்டையில்; தேவையான உரம் மட்டும் வாங்கலாம்.",
    eligibilityEn: ["Any farmer with cultivable land"],
    eligibilityTa: ["சாகுபடி நிலம் உள்ள எந்த விவசாயியும்"],
    docsEn: ["Aadhaar", "Land details (survey number)"],
    docsTa: ["ஆதார்", "நில விவரம் (சர்வே எண்)"],
    deadlineEn: "Soil samples are collected in cycles — ask your agriculture officer for this year's round.",
    deadlineTa: "சுழற்சி முறையில் மாதிரி எடுப்பு — வேளாண் அலுவலரிடம் கேட்கவும்.",
    howEn: ["Give your survey number at the block agriculture office", "Officer collects the sample; the card arrives in weeks", "Show the card to the fertiliser dealer — it tells them the dose"],
    howTa: ["வட்டார வேளாண் அலுவலகத்தில் சர்வே எண் தரவும்", "மாதிரி எடுத்து அட்டை வழங்கப்படும்", "உரக் கடையில் அட்டையைக் காட்டவும்"],
    source: "soilhealth.dac.gov.in",
  },
  {
    id: "microirrigation", nameEn: "Micro-irrigation subsidy", nameTa: "நுண்ணீர்ப் பாசன மானியம்",
    tagEn: "Drip / sprinkler", tagTa: "சொட்டு நீர்",
    benefitEn: "Subsidy on drip and sprinkler systems under Per Drop More Crop — 55% for small and marginal farmers, 45% for others, on the unit cost.",
    benefitTa: "சொட்டு/தெளிப்பு நீருக்கு மானியம் — சிறு விவசாயிகளுக்கு 55%, மற்றவர்களுக்கு 45%.",
    eligibilityEn: ["Farmers with land records and a water source", "Higher subsidy for small/marginal (up to 5 acres) farmers"],
    eligibilityTa: ["நில ஆவணம் + நீர் ஆதாரம் உள்ளவர்", "சிறு விவசாயிகளுக்கு (5 ஏக்கர் வரை) அதிக மானியம்"],
    docsEn: ["Aadhaar", "Land records", "Bank passbook", "Water source proof"],
    docsTa: ["ஆதார்", "நில ஆவணம்", "வங்கி பாஸ்புக்", "நீர் ஆதாரச் சான்று"],
    deadlineEn: "Applications open through the year on the state horticulture portal — funds are limited per district.",
    deadlineTa: "ஆண்டு முழுதும் விண்ணப்பம் — மாவட்ட நிதி வரம்புக்குட்பட்டது.",
    howEn: ["Apply on your state's horticulture/agriculture portal", "Field inspection follows; install only after approval", "Subsidy is credited to your bank account after verification"],
    howTa: ["மாநில தோட்டக்கலை இணையதளத்தில் விண்ணப்பம்", "ஆய்வுக்குப் பின் நிறுவவும்", "சரிபார்ப்புக்குப் பின் மானியம் வங்கியில்"],
    source: "State horticulture department",
  },
  {
    id: "freepower", nameEn: "Free farm power (TN)", nameTa: "இலவச விவசாய மின்சாரம்",
    tagEn: "Tamil Nadu", tagTa: "தமிழ்நாடு",
    benefitEn: "Tamil Nadu supplies free electricity for agricultural pump sets — one of the biggest input-cost savers a TN farmer has.",
    benefitTa: "தமிழ்நாட்டில் விவசாய பம்புசெட்டுகளுக்கு இலவச மின்சாரம் — மிகப்பெரிய செலவு சேமிப்பு.",
    eligibilityEn: ["Agricultural service connection in your name", "Pump set used only for irrigation"],
    eligibilityTa: ["உங்கள் பெயரில் விவசாய மின் இணைப்பு", "நீர்ப்பாசனத்திற்கு மட்டும் பயன்"],
    docsEn: ["Patta/chitta", "Well/borewell details", "ID proof"],
    docsTa: ["பட்டா/சிட்டா", "கிணறு விவரம்", "அடையாளச் சான்று"],
    deadlineEn: "Apply any time at the TANGEDCO section office for a new agri connection.",
    deadlineTa: "புதிய இணைப்புக்கு எப்போதும் மின்வாரிய அலுவலகத்தில் விண்ணப்பிக்கலாம்.",
    howEn: ["Apply at your TANGEDCO section office with land records", "Connection is released in seniority order — keep your acknowledgement safe", "Never run non-farm load on an agri connection"],
    howTa: ["மின்வாரிய அலுவலகத்தில் நில ஆவணத்துடன் விண்ணப்பம்", "மூப்பு வரிசையில் இணைப்பு — ஒப்புதல் சீட்டைப் பாதுகாக்கவும்", "விவசாய இணைப்பில் வேறு பயன் வேண்டாம்"],
    source: "TANGEDCO",
  },
];

export const EXPENSE_CATEGORIES = [
  { id: "seed", en: "Seeds / planting material", ta: "விதை" },
  { id: "fertilizer", en: "Fertilisers & manure", ta: "உரம்" },
  { id: "pesticide", en: "Pesticides / sprays", ta: "பூச்சி மருந்து" },
  { id: "labour", en: "Labour", ta: "கூலி" },
  { id: "irrigation", en: "Irrigation / power", ta: "நீர்ப்பாசனம்" },
  { id: "machine", en: "Machinery hire", ta: "இயந்திர வாடகை" },
  { id: "lease", en: "Land lease", ta: "நிலக் குத்தகை" },
  { id: "transport", en: "Transport / marketing", ta: "போக்குவரத்து" },
  { id: "other", en: "Other", ta: "மற்றவை" },
];

/* Where the harvest was sold — recorded per sale so the ledger can show
   which channel actually pays this family best. The e-NAM / mandi choice is
   the single biggest price lever most farmers have, so it gets its own field
   instead of hiding in a free-text note. */
export const SALE_CHANNELS = [
  { id: "mandi", en: "APMC mandi", ta: "APMC மண்டி" },
  { id: "enam", en: "e-NAM (online)", ta: "e-NAM (ஆன்லைன்)" },
  { id: "farmgate", en: "Trader at farm gate", ta: "வயலில் வியாபாரி" },
  { id: "fpo", en: "FPO / Co-operative", ta: "FPO / கூட்டுறவு" },
  { id: "govt", en: "Govt procurement centre", ta: "அரசு கொள்முதல் நிலையம்" },
  { id: "other", en: "Other", ta: "மற்றது" },
];

export const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const MONTHS_TA = ["ஜனவரி","பிப்ரவரி","மார்ச்","ஏப்ரல்","மே","ஜூன்","ஜூலை","ஆகஸ்ட்","செப்டம்பர்","அக்டோபர்","நவம்பர்","டிசம்பர்"];
