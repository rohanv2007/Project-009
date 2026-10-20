"use client";

import React, { useMemo, useState } from "react";
import { useLang } from "../../lib/i18n";
import { MSP_2026_27, mspForCrop } from "../../lib/data";
import { useDB, inr } from "../../lib/db";
import { PageHead, Card, SectionTitle, FieldRow, BackHome } from "../../components/ui";

/* Cost of production per quintal, keyed by MSP cropEn, derived from the
   ledger: plots whose free-text crop matches an MSP row contribute their
   total spend and sold quintals. Only plots with recorded sales count —
   unsold harvest has no known cost per quintal yet. Shared by the quote
   book verdict and the printable mandi slip. */
function useCostByCrop(): Record<string, number> {
  const { db } = useDB();
  return useMemo(() => {
    const agg: Record<string, { spent: number; quintals: number }> = {};
    for (const p of db.plots) {
      const row = mspForCrop(p.crop);
      if (!row) continue;
      const spent = db.expenses.filter((e) => e.plotId === p.id).reduce((a, e) => a + e.amount, 0);
      const quintals = db.sales.filter((s) => s.plotId === p.id).reduce((a, s) => a + s.quintals, 0);
      if (quintals <= 0) continue;
      const key = row.cropEn;
      agg[key] = agg[key] ?? { spent: 0, quintals: 0 };
      agg[key].spent += spent;
      agg[key].quintals += quintals;
    }
    const out: Record<string, number> = {};
    for (const k of Object.keys(agg)) out[k] = agg[k].spent / agg[k].quintals;
    return out;
  }, [db]);
}

const GROUPS = ["All", "Cereals", "Pulses", "Oilseeds", "Commercial"] as const;

const FAIR_POINTS: { en: string; ta: string }[] = [
  { en: "Know the MSP before the trader names a price — it is your floor, not a ceiling.", ta: "வியாபாரி விலை சொல்வதற்கு முன் MSP தெரிந்துகொள்ளுங்கள் — அது அடித்தளம், உச்சவரம்பு அல்ல." },
  { en: "Grade matters: paddy Grade A (₹2,461/q) pays more than Common (₹2,441/q). Dry and clean your grain.", ta: "தரம் முக்கியம்: A தர நெல்லுக்கு (₹2,461) சாதாரணத்தை (₹2,441) விட அதிகம். தானியத்தை உலர்த்திச் சுத்தம் செய்யுங்கள்." },
  { en: "Ask the mandi for the day's modal price and compare across two mandis before you load the cart.", ta: "வண்டி ஏற்றுமுன் இரு மண்டிகளின் அன்றைய விலையைக் கேட்டு ஒப்பிடுங்கள்." },
  { en: "Never sell the entire harvest on day one — prices often firm up 2–4 weeks after peak arrivals.", ta: "முழு அறுவடையையும் முதல் நாளே விற்க வேண்டாம் — வரத்து உச்சத்திற்குப் பின் 2–4 வாரத்தில் விலை ஏறும்." },
  { en: "Get the weighment slip and payment receipt every single time — no slip, no proof.", ta: "ஒவ்வொரு முறையும் எடைச் சீட்டும் பணச் சீட்டும் வாங்குங்கள் — சீட்டு இல்லை என்றால் ஆதாரம் இல்லை." },
  { en: "Check the government procurement centre dates for your crop — MSP is real only if you register and deliver there.", ta: "அரசு கொள்முதல் நிலைய தேதிகளைப் பார்க்கவும் — பதிவு செய்து அங்கு கொடுத்தால்தான் MSP உண்மை." },
];

/* Trader quote book: log every price a trader or mandi names, before deciding.
   Each quote is marked against the MSP floor AND against the farmer's own
   cost of production from the ledger — the quote that clears MSP can still
   lose money if it is below what the harvest cost to grow. */
function QuoteBook() {
  const { lang } = useLang();
  const { db, addQuote, removeQuote } = useDB();
  const costByCrop = useCostByCrop();
  const [crop, setCrop] = useState(MSP_2026_27[0].cropEn);
  const [rate, setRate] = useState("");
  const [note, setNote] = useState("");
  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";

  const mspOf = (cropEn: string) => MSP_2026_27.find((r) => r.cropEn === cropEn)?.msp ?? null;
  const cropName = (cropEn: string) => {
    const r = MSP_2026_27.find((x) => x.cropEn === cropEn);
    return r ? (ta ? r.cropTa : r.cropEn) : cropEn;
  };
  const best = db.priceQuotes.reduce<null | (typeof db.priceQuotes)[number]>(
    (b, q) => (!b || q.rate > b.rate ? q : b), null);

  const add = () => {
    const r = parseFloat(rate);
    if (!r || r <= 0) return;
    addQuote({ crop, rate: r, note: note.trim() });
    setRate(""); setNote("");
  };

  return (
    <Card className="mt-8">
      <SectionTitle>📓 {ta ? "வியாபாரி விலை ஏடு" : "Trader quote book"}</SectionTitle>
      <p className={`text-[var(--color-ink-soft)] mb-4 ${taFont}`}>
        {ta
          ? "வியாபாரியோ மண்டியோ சொல்லும் ஒவ்வொரு விலையையும் முடிவெடுப்பதற்கு முன் இங்கே எழுதுங்கள் — MSP-ஐ விடக் குறைவாக இருந்தாலும், உங்கள் சொந்த வளர்ப்புச் செலவை விடக் குறைவாக இருந்தாலும் பயிர் உடனே காட்டும்."
          : "Write down every price a trader or mandi names you, before you decide. Payir flags any quote below MSP — and any quote below your own cost of production from the ledger."}
      </p>
      <div className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 mb-4 no-print">
        <FieldRow label={ta ? "பயிர்" : "Crop"}>
          <select className="field" value={crop} onChange={(e) => setCrop(e.target.value)} aria-label={ta ? "பயிர்" : "Crop"}>
            {MSP_2026_27.map((r) => <option key={r.cropEn} value={r.cropEn}>{ta ? r.cropTa : r.cropEn}</option>)}
          </select>
        </FieldRow>
        <FieldRow label={ta ? "விலை ₹/குவிண்டால்" : "Quote ₹/quintal"}>
          <input className="field" type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} inputMode="numeric" aria-label={ta ? "விலை" : "Quoted rate"} />
        </FieldRow>
        <FieldRow label={ta ? "எங்கே (விருப்பம்)" : "Where (optional)"}>
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder={ta ? "எ.கா. கும்பகோணம் மண்டி" : "e.g. Kumbakonam mandi"} aria-label={ta ? "இடம்" : "Mandi or trader"} />
        </FieldRow>
        <div className="flex items-end">
          <button className="btn btn-primary" onClick={add}>{ta ? "விலை சேர்" : "Add quote"}</button>
        </div>
      </div>
      {best && (
        <p className={`mb-3 text-sm font-semibold text-[var(--color-accent-deep)] ${taFont}`}>
          {ta
            ? `இந்தப் பருவத்தின் சிறந்த விலை: ${cropName(best.crop)}-க்கு ₹${Math.round(best.rate).toLocaleString("en-IN")}/குவிண்டால்${best.note ? ` (${best.note})` : ""}`
            : `Best quote this season: ₹${Math.round(best.rate).toLocaleString("en-IN")}/q for ${cropName(best.crop)}${best.note ? ` (${best.note})` : ""}`}
        </p>
      )}
      {/* Quote trend: for crops with 2+ quotes, pure-CSS bars oldest to
          newest so the farmer sees whether the offers are rising or the
          traders are circling downward. The darkest bar is the latest. */}
      {db.priceQuotes.length > 0 && (() => {
        const byCrop = new Map<string, typeof db.priceQuotes>();
        for (const q of db.priceQuotes) byCrop.set(q.crop, [...(byCrop.get(q.crop) ?? []), q]);
        const multi = [...byCrop.entries()].filter(([, arr]) => arr.length >= 2);
        if (multi.length === 0) return null;
        return (
          <div className={`mb-5 ${taFont}`} aria-label={ta ? "விலை போக்கு" : "Quote trend"}>
            <p className="font-bold text-sm mb-2">{ta ? "📈 விலை போக்கு" : "📈 Quote trend"}</p>
            <div className="space-y-4">
              {multi.map(([cropEn, arr]) => {
                const sorted = [...arr].sort((a, b) => a.at.localeCompare(b.at));
                const rates = sorted.map((q) => q.rate);
                const lo = Math.min(...rates);
                const hi = Math.max(...rates);
                const span = hi - lo || 1;
                return (
                  <div key={cropEn}>
                    <p className="text-sm font-semibold mb-1">{cropName(cropEn)}</p>
                    <div
                      className="flex items-end gap-1.5 h-16"
                      role="img"
                      aria-label={`${cropName(cropEn)}: ${sorted.map((q) => `₹${Math.round(q.rate).toLocaleString("en-IN")}`).join(", ")}`}
                    >
                      {sorted.map((q, i) => (
                        <div key={q.id} className="flex-1 h-full flex flex-col justify-end">
                          <div
                            className={i === sorted.length - 1 ? "bg-[var(--color-accent-deep)]" : "bg-[var(--color-accent)] opacity-60"}
                            style={{ height: `${Math.max(10, ((q.rate - lo) / span) * 100)}%` }}
                            title={`${ta ? "₹" : "₹"}${Math.round(q.rate).toLocaleString("en-IN")} — ${new Date(q.at).toLocaleDateString(ta ? "ta-IN" : "en-IN", { day: "numeric", month: "short" })}`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-ink-soft)] mt-1">
                      {(() => {
                        const first = sorted[0].rate;
                        const last = sorted[sorted.length - 1].rate;
                        const arrow = ta
                          ? `₹${Math.round(first).toLocaleString("en-IN")} → ₹${Math.round(last).toLocaleString("en-IN")}`
                          : `₹${Math.round(first).toLocaleString("en-IN")} → ₹${Math.round(last).toLocaleString("en-IN")}`;
                        const verdict = last > first
                          ? (ta ? " · ஏறுமுகம்" : " · rising")
                          : last < first
                            ? (ta ? " · இறங்குமுகம்" : " · falling")
                            : "";
                        return arrow + verdict;
                      })()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
      {db.priceQuotes.length === 0 ? (
        <p className={`text-[var(--color-ink-soft)] ${taFont}`}>
          {ta
            ? "இன்னும் விலைகள் பதியவில்லை. வியாபாரி விலை சொல்லும்போது எழுதுங்கள் — நினைவில் வைப்பதை விட ஏடு நம்பகமானது."
            : "No quotes yet. When a trader names a price, write it here — the book remembers what memory softens."}
        </p>
      ) : (
        <ul className={`space-y-2 ${taFont}`} aria-live="polite">
          {db.priceQuotes.map((q) => {
            const msp = mspOf(q.crop);
            const gap = msp != null ? q.rate - msp : null;
            const costQ = costByCrop[q.crop] ?? null;
            const costGap = costQ != null ? q.rate - costQ : null;
            return (
              <li key={q.id} className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] pb-2">
                <div>
                  <p className="font-semibold">
                    {cropName(q.crop)} · ₹{Math.round(q.rate).toLocaleString("en-IN")}<span className="text-sm font-normal text-[var(--color-ink-soft)]">/q</span>
                    {q.note && <span className="block text-sm font-normal text-[var(--color-ink-soft)]">{q.note}</span>}
                    <span className="block text-xs font-normal text-[var(--color-ink-faint)]">
                      {new Date(q.at).toLocaleDateString(ta ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {costGap != null && (
                      <span className={`block text-sm font-normal mt-0.5 ${costGap >= 0 ? "text-[var(--color-accent-deep)]" : "text-[var(--color-coral)]"}`}>
                        {costGap >= 0
                          ? (ta
                            ? `உங்கள் வளர்ப்புச் செலவு ₹${Math.round(costQ!).toLocaleString("en-IN")}/குவிண்டால் — இந்த விலையில் குவிண்டாலுக்கு ₹${Math.round(costGap).toLocaleString("en-IN")} லாபம்`
                            : `Your cost of production ${inr(costQ!)}/q — this quote earns you ${inr(costGap)}/q`)
                          : (ta
                            ? `⚠ உங்கள் வளர்ப்புச் செலவு ₹${Math.round(costQ!).toLocaleString("en-IN")}/குவிண்டால் — இந்த விலையில் குவிண்டாலுக்கு ₹${Math.round(-costGap).toLocaleString("en-IN")} நஷ்டம்`
                            : `⚠ Your cost of production ${inr(costQ!)}/q — this sale loses ${inr(-costGap)}/q`)}
                      </span>
                    )}
                  </p>
                </div>
                <span className="flex items-center gap-2 shrink-0">
                  {gap != null && (
                    <span className={`badge ${gap >= 0 ? "badge-green" : "badge-coral"}`}>
                      {gap >= 0
                        ? (ta ? `MSP-க்கு ₹${Math.round(gap).toLocaleString("en-IN")} மேல் ✓` : `₹${Math.round(gap).toLocaleString("en-IN")} above MSP ✓`)
                        : (ta ? `MSP-க்கு ₹${Math.round(-gap).toLocaleString("en-IN")} கீழ்` : `₹${Math.round(-gap).toLocaleString("en-IN")} below MSP`)}
                    </span>
                  )}
                  <button className="text-[var(--color-coral)] text-sm no-print" onClick={() => removeQuote(q.id)} aria-label={ta ? "நீக்கு" : "Delete"}>✕</button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* Mandi slip: one printable page to carry to the mandi — the best quote so
   far, the MSP floor, and your own cost of production per crop, with the
   gap on each. The quote book is the memory; this is the paper you
   negotiate with. Renders nothing until quotes exist. */
/* Before-you-load-the-truck comparator: the researched insight is that the
   biggest selling mistake is never benchmarking quotes — a ₹100/q gap across
   150 quintals is ₹15,000. This nets out transport so the "far mandi is
   farther" excuse gets a number, not a guess. Pure local state, no DB. */
function TripComparator() {
  const { lang } = useLang();
  const ta = lang === "ta";
  const [qty, setQty] = useState("");
  const [ra, setRa] = useState("");
  const [ta_, setTa] = useState("");
  const [rb, setRb] = useState("");
  const [tb, setTb] = useState("");
  const q = parseFloat(qty) || 0;
  const netA = q * (parseFloat(ra) || 0) - (parseFloat(ta_) || 0);
  const netB = q * (parseFloat(rb) || 0) - (parseFloat(tb) || 0);
  const diff = netB - netA;
  return (
    <Card className="mt-8">
      <SectionTitle>🚚 {ta ? "வண்டி ஏற்றும் முன்: இரு மண்டி ஒப்பீடு" : "Before you load the truck: two-mandi compare"}</SectionTitle>
      <p className={`text-[var(--color-ink-soft)] mb-4 text-sm ${ta ? "ta-fallback" : ""}`}>
        {ta
          ? "இரண்டு மண்டி/வியாபாரி விலைகளையும் போக்குவரத்து செலவையும் போட்டுப் பாருங்கள் — தூரமான மண்டி கூட உண்மையில் அதிகம் தரலாம்."
          : "Punch in both quotes and both transport costs — the farther mandi may still net you more."}
      </p>
      <FieldRow label={ta ? "அளவு (குவிண்டால்)" : "Quantity (quintals)"}>
        <input className="field max-w-xs" type="number" min="0" step="1" value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" />
      </FieldRow>
      <div className="grid sm:grid-cols-2 gap-4 mt-2">
        <div className="border border-[var(--color-line)] p-3">
          <p className={`font-bold mb-2 ${ta ? "ta-fallback" : ""}`}>{ta ? "விருப்பம் 1 — அருகில்" : "Option 1 — nearby"}</p>
          <FieldRow label={ta ? "விலை ₹/குவிண்டால்" : "Quote ₹/quintal"}>
            <input className="field" type="number" min="0" value={ra} onChange={(e) => setRa(e.target.value)} inputMode="numeric" />
          </FieldRow>
          <FieldRow label={ta ? "போக்குவரத்து செலவு ₹" : "Transport cost ₹"}>
            <input className="field" type="number" min="0" value={ta_} onChange={(e) => setTa(e.target.value)} inputMode="numeric" />
          </FieldRow>
          {q > 0 && (
            <p className="headline text-lg font-bold mt-1" aria-live="polite">₹{Math.round(netA).toLocaleString("en-IN")}</p>
          )}
        </div>
        <div className="border border-[var(--color-line)] p-3">
          <p className={`font-bold mb-2 ${ta ? "ta-fallback" : ""}`}>{ta ? "விருப்பம் 2 — தொலைவில்" : "Option 2 — farther"}</p>
          <FieldRow label={ta ? "விலை ₹/குவிண்டால்" : "Quote ₹/quintal"}>
            <input className="field" type="number" min="0" value={rb} onChange={(e) => setRb(e.target.value)} inputMode="numeric" />
          </FieldRow>
          <FieldRow label={ta ? "போக்குவரத்து செலவு ₹" : "Transport cost ₹"}>
            <input className="field" type="number" min="0" value={tb} onChange={(e) => setTb(e.target.value)} inputMode="numeric" />
          </FieldRow>
          {q > 0 && (
            <p className="headline text-lg font-bold mt-1" aria-live="polite">₹{Math.round(netB).toLocaleString("en-IN")}</p>
          )}
        </div>
      </div>
      {q > 0 && Math.abs(diff) > 0 && (
        <p className={`text-sm mt-3 font-semibold ${ta ? "ta-fallback" : ""}`} aria-live="polite">
          {diff > 0
            ? (ta ? `விருப்பம் 2 உங்களுக்கு ₹${Math.round(diff).toLocaleString("en-IN")} கூடுதல் தரும்.` : `Option 2 nets you ₹${Math.round(diff).toLocaleString("en-IN")} more.`)
            : (ta ? `விருப்பம் 1 உங்களுக்கு ₹${Math.round(-diff).toLocaleString("en-IN")} கூடுதல் தரும்.` : `Option 1 nets you ₹${Math.round(-diff).toLocaleString("en-IN")} more.`)}
        </p>
      )}
    </Card>
  );
}

/* e-NAM first-timer list: the researched practical route for a farmer who
   has never sold online — register once with Aadhaar + bank, grade the
   produce, let the mandi assay it, and start with a small test lot. Persisted
   like every other checklist so the home board can nudge it.
   (ENAM_IDS lives in app/page.tsx's aggregator too — keep the two in sync.) */
const ENAM_IDS = ["register", "grade", "assay", "testlot", "watch", "records"];

function EnamStart() {
  const { lang } = useLang();
  const { db, setCheck } = useDB();
  const ta = lang === "ta";
  const ITEMS: { id: string; en: string; ta: string }[] = [
    { id: "register", en: "Register on e-NAM at your mandi — Aadhaar + bank account, one visit", ta: "e-NAM-இல் பதிவு செய்யவும் — ஆதார் + வங்கிக் கணக்கு, ஒரே வருகை" },
    { id: "grade", en: "Clean, dry and sort the produce to one grade before listing", ta: "பட்டியலிடும் முன் தானியத்தைச் சுத்தம் செய்து உலர்த்தித் தரம் பிரிக்கவும்" },
    { id: "assay", en: "Get the mandi's quality assaying (parakh) — tested lots earn the grade price", ta: "மண்டியின் தரப் பரிசோதனை பெறவும் — பரிசோதித்த சரக்குக்குத் தர விலை கிடைக்கும்" },
    { id: "testlot", en: "List a small test lot first — learn the bidding before your whole harvest goes in", ta: "முதலில் சிறிய தொகுதியைப் பட்டியலிடவும் — முழு அறுவடையும் போடும் முன் ஏலத்தைப் புரிந்துகொள்ளுங்கள்" },
    { id: "watch", en: "Watch the bids during the trading window — don't accept the first bid blindly", ta: "ஏல நேரத்தில் ஏலங்களைக் கவனிக்கவும் — முதல் ஏலத்தைக் கண்மூடித்தனமாக ஏற்க வேண்டாம்" },
    { id: "records", en: "Confirm the sale and keep the digital payment receipt — no receipt, no proof", ta: "விற்பனையை உறுதி செய்து டிஜிட்டல் பணச் சீட்டை வைத்துக்கொள்ளுங்கள்" },
  ];
  const done = ENAM_IDS.filter((id) => db.checks[`enam:${id}`]).length;
  return (
    <Card className="mt-8">
      <SectionTitle>🌐 {ta ? "e-NAM — முதல் முறை விற்பவருக்கு" : "e-NAM — first-timer's list"}</SectionTitle>
      <p className={`text-[var(--color-ink-soft)] text-sm mb-3 ${ta ? "ta-fallback" : ""}`}>
        {ta
          ? "தேசிய மண்டியில் ஆன்லைன் ஏலம்: அதிக வியாபாரிகள், வெளிப்படையான விலை, நேரடி வங்கிப் பணம். ஆறு படிகள்:"
          : "The national online mandi: more bidders, transparent prices, direct bank payment. Six steps to start:"}
      </p>
      <p className={`text-sm font-semibold mb-3 ${ta ? "ta-fallback" : ""}`}>
        {ta ? `${done}/${ENAM_IDS.length} முடிந்தது` : `${done}/${ENAM_IDS.length} done`}
      </p>
      <ul className="space-y-2">
        {ITEMS.map((x) => {
          const on = !!db.checks[`enam:${x.id}`];
          return (
            <li key={x.id}>
              <button
                onClick={() => setCheck(`enam:${x.id}`, !on)}
                aria-pressed={on}
                className={`w-full text-left p-3 border flex items-start gap-3 ${on ? "border-[var(--color-accent)] bg-[var(--color-accent-wash)]" : "border-[var(--color-line)] bg-[var(--color-card)]"}`}
              >
                <span className="mt-0.5">{on ? "☑" : "☐"}</span>
                <span className={ta ? "ta-fallback" : ""}>{ta ? x.ta : x.en}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function MandiSlip() {
  const { lang } = useLang();
  const { db } = useDB();
  const costByCrop = useCostByCrop();
  const ta = lang === "ta";
  const [printDate, setPrintDate] = React.useState<string | null>(null);
  React.useEffect(() => {
    setPrintDate(new Date().toLocaleDateString(ta ? "ta-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" }));
  }, [ta]);

  const crops = useMemo(() => [...new Set(db.priceQuotes.map((q) => q.crop))], [db.priceQuotes]);
  if (crops.length === 0) return null;

  const bestOf = (cropEn: string) => db.priceQuotes.filter((q) => q.crop === cropEn).reduce((b, q) => (q.rate > b.rate ? q : b));
  const mspOf = (cropEn: string) => MSP_2026_27.find((r) => r.cropEn === cropEn)?.msp ?? null;
  const cropName = (cropEn: string) => {
    const r = MSP_2026_27.find((x) => x.cropEn === cropEn);
    return r ? (ta ? r.cropTa : r.cropEn) : cropEn;
  };

  return (
    <Card className="mt-8">
      <SectionTitle>🧾 {ta ? "மண்டி சீட்டு" : "Mandi slip"}</SectionTitle>
      <p className={`text-[var(--color-ink-soft)] mb-4 ${ta ? "ta-fallback" : ""}`}>
        {ta
          ? "இந்தச் சீட்டை அச்சிட்டு மண்டிக்கு எடுத்துச் செல்லுங்கள் — ஒவ்வொரு பயிருக்கும் சிறந்த விலை, MSP, உங்கள் சொந்த வளர்ப்புச் செலவு, வித்தியாசம் அனைத்தும் ஒரே பக்கத்தில்."
          : "Print this slip and carry it to the mandi — your best quote, the MSP floor, and your own cost of production per crop, all on one page."}
      </p>
      <div className="no-print">
        <button className="btn btn-ghost" onClick={() => window.print()}>
          🖨️ {ta ? "மண்டி சீட்டை அச்சிடு" : "Print mandi slip"}
        </button>
      </div>
      {printDate && (
        <div className="print-only mt-8">
          <h2 className="headline text-2xl font-bold mb-1">{ta ? "பயிர் — மண்டி சீட்டு" : "Payir — Mandi slip"}</h2>
          <p className="text-sm mb-4">{printDate}</p>
          <table className="grid-table">
            <thead>
              <tr>
                <th>{ta ? "பயிர்" : "Crop"}</th>
                <th>{ta ? "சிறந்த விலை ₹/குவிண்டால்" : "Best quote ₹/q"}</th>
                <th>MSP ₹/q</th>
                <th>{ta ? "உங்கள் செலவு ₹/குவிண்டால்" : "Your cost ₹/q"}</th>
                <th>{ta ? "லாபம்/நட்டம் ₹/குவிண்டால்" : "Margin ₹/q"}</th>
              </tr>
            </thead>
            <tbody>
              {crops.map((c) => {
                const b = bestOf(c);
                const msp = mspOf(c);
                const costQ = costByCrop[c] ?? null;
                const margin = costQ != null ? b.rate - costQ : null;
                return (
                  <tr key={c}>
                    <td>{cropName(c)}</td>
                    <td><strong>₹{Math.round(b.rate).toLocaleString("en-IN")}</strong>{b.note ? ` (${b.note})` : ""}</td>
                    <td>{msp != null ? `₹${msp.toLocaleString("en-IN")}` : "—"}</td>
                    <td>{costQ != null ? `₹${Math.round(costQ).toLocaleString("en-IN")}` : "—"}</td>
                    <td>{margin != null ? `${margin >= 0 ? "+" : ""}₹${Math.round(margin).toLocaleString("en-IN")}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-4 text-sm">
            {ta
              ? "கொள்கை: உங்கள் வளர்ப்புச் செலவை விடக் குறைவாக ஒருபோதும் விற்க வேண்டாம். விலை எழுத்தில் இருக்கட்டும் — ஏட்டில் பதியவும்."
              : "Rule: never sell below your cost of production. Get the price in writing — and log it in the quote book."}
          </p>
        </div>
      )}
    </Card>
  );
}

export default function PricesPage() {
  const { t, lang } = useLang();
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("All");
  const [q, setQ] = useState("");

  // Harvest revenue planner
  const [planCrop, setPlanCrop] = useState(MSP_2026_27[0].cropEn);
  const [planAcres, setPlanAcres] = useState("2");
  const [planYield, setPlanYield] = useState("25");
  const [planPrice, setPlanPrice] = useState(String(MSP_2026_27[0].msp));

  const rows = useMemo(() => {
    return MSP_2026_27.filter((r) => {
      if (group !== "All" && r.group !== group) return false;
      if (q && !(r.cropEn.toLowerCase().includes(q.toLowerCase()) || r.cropTa.includes(q))) return false;
      return true;
    });
  }, [group, q]);

  const biggest = useMemo(() => [...MSP_2026_27].sort((a, b) => b.increase - a.increase).slice(0, 3), []);

  const planRow = MSP_2026_27.find((r) => r.cropEn === planCrop) ?? MSP_2026_27[0];
  const pAcres = parseFloat(planAcres) || 0;
  const pYield = parseFloat(planYield) || 0;
  const pPrice = parseFloat(planPrice) || 0;
  const pQuintals = pAcres * pYield;
  const pRevenue = pQuintals * pPrice;
  const pAtMsp = pQuintals * planRow.msp;
  const pGap = pAtMsp - pRevenue;

  const pickPlanCrop = (cropEn: string) => {
    setPlanCrop(cropEn);
    const row = MSP_2026_27.find((r) => r.cropEn === cropEn);
    if (row) setPlanPrice(String(row.msp));
  };

  return (
    <div>
      <PageHead kicker={t("prices_kicker")} title={t("prices_title")} sub={t("prices_sub")} />

      <Card className="mb-6">
        <SectionTitle>{lang === "ta" ? "மிகப்பெரிய உயர்வுகள் (2026-27)" : "Biggest hikes this season (2026-27)"}</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-3">
          {biggest.map((r) => (
            <div key={r.cropEn} className="border border-[var(--color-line)] p-3">
              <p className="font-bold">{lang === "ta" ? r.cropTa : r.cropEn}</p>
              <p className="headline text-xl font-bold text-[var(--color-accent-deep)]">₹{r.msp.toLocaleString("en-IN")}<span className="text-sm font-normal text-[var(--color-ink-soft)]"> /q</span></p>
              <p className="text-sm text-[var(--color-sage)] font-semibold">+₹{r.increase} {lang === "ta" ? "உயர்வு" : "vs last year"}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 mb-4 no-print">
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`btn !min-h-0 !py-1.5 !px-3 text-sm ${group === g ? "btn-primary" : "btn-ghost"}`}
            aria-pressed={group === g}
          >
            {g === "All" ? (lang === "ta" ? "அனைத்தும்" : "All") : g}
          </button>
        ))}
      </div>
      <div className="mb-4 no-print max-w-sm">
        <input
          className="field"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lang === "ta" ? "பயிர் தேடு…" : "Search crop…"}
          aria-label={lang === "ta" ? "பயிர் தேடு" : "Search crop"}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="grid-table card">
          <thead>
            <tr>
              <th>{t("col_crop")}</th>
              <th>{t("col_msp")}</th>
              <th>{t("col_change")}</th>
              <th>{t("col_margin")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.cropEn}>
                <td className="font-semibold">{lang === "ta" ? r.cropTa : r.cropEn}</td>
                <td className="headline font-bold text-[var(--color-accent-deep)]">₹{r.msp.toLocaleString("en-IN")}</td>
                <td className="text-[var(--color-sage)] font-semibold">+₹{r.increase}</td>
                <td>{r.margin == null ? "—" : `${r.margin}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="mt-8">
        <SectionTitle>{lang === "ta" ? "🧮 அறுவடை வருவாய் திட்டம்" : "🧮 Harvest revenue planner"}</SectionTitle>
        <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {lang === "ta"
            ? "வியாபாரி சொல்லும் விலையில் உங்கள் அறுவடை எவ்வளவு தரும் — MSP-யில் விற்றால் எவ்வளவு கிடைக்கும் என்பதையும் பாருங்கள்."
            : "See what your harvest brings at the trader's price — and what it would bring at MSP."}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <FieldRow label={lang === "ta" ? "பயிர்" : "Crop"}>
            <select className="field" value={planCrop} onChange={(e) => pickPlanCrop(e.target.value)}>
              {MSP_2026_27.map((r) => <option key={r.cropEn} value={r.cropEn}>{lang === "ta" ? r.cropTa : r.cropEn}</option>)}
            </select>
          </FieldRow>
          <FieldRow label={lang === "ta" ? "ஏக்கர்" : "Acres"}>
            <input className="field" type="number" min="0" step="0.5" value={planAcres} onChange={(e) => setPlanAcres(e.target.value)} inputMode="decimal" />
          </FieldRow>
          <FieldRow label={lang === "ta" ? "மகசூல் (குவிண்டால்/ஏக்கர்)" : "Yield (q/acre)"}>
            <input className="field" type="number" min="0" step="1" value={planYield} onChange={(e) => setPlanYield(e.target.value)} inputMode="decimal" />
          </FieldRow>
          <FieldRow label={lang === "ta" ? "எதிர்பார்க்கும் விலை ₹/குவிண்டால்" : "Expected price ₹/quintal"}>
            <input className="field" type="number" min="0" value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} inputMode="numeric" />
          </FieldRow>
        </div>
        {pQuintals > 0 && (
          <div className="grid sm:grid-cols-3 gap-3" aria-live="polite">
            <div className="border border-[var(--color-line)] p-3">
              <p className="kicker mb-1">{lang === "ta" ? "அறுவடை" : "Harvest"}</p>
              <p className="headline text-xl font-bold">{pQuintals.toLocaleString("en-IN")} q</p>
            </div>
            <div className="border border-[var(--color-line)] p-3">
              <p className="kicker mb-1">{lang === "ta" ? "இந்த விலையில் வருவாய்" : "Revenue at your price"}</p>
              <p className="headline text-xl font-bold">₹{Math.round(pRevenue).toLocaleString("en-IN")}</p>
            </div>
            <div className={`border p-3 ${pGap > 0 ? "border-[var(--color-coral)] bg-[var(--color-coral-wash)]" : "border-[var(--color-sage)] bg-[var(--color-sage-wash)]"}`}>
              <p className="kicker mb-1">{lang === "ta" ? "MSP-யில் விற்றால்" : "At MSP"}</p>
              <p className="headline text-xl font-bold">₹{Math.round(pAtMsp).toLocaleString("en-IN")}</p>
              <p className="text-sm font-semibold mt-1">
                {pGap > 0
                  ? (lang === "ta" ? `₹${Math.round(pGap).toLocaleString("en-IN")} இழப்பு` : `₹${Math.round(pGap).toLocaleString("en-IN")} left on the table`)
                  : (lang === "ta" ? "MSP-க்கு மேல் ✓" : "Above MSP ✓")}
              </p>
            </div>
          </div>
        )}
      </Card>

      <QuoteBook />

      <TripComparator />

      <EnamStart />

      <MandiSlip />

      <Card className="mt-8">
        <SectionTitle>⏳ {lang === "ta" ? "இப்போது விற்கவா, சேமிக்கவா?" : "Sell now or store?"}</SectionTitle>
        <p className={`text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {lang === "ta"
            ? "அறுவடைக் காலத்தில் விலை குறைவாக இருக்கும் (அனைவரும் ஒரே நேரத்தில் விற்பதால்). சேமித்து வைத்தால் விலை ஏறலாம் — ஆனால் சேமிப்புக்கும் விலை உண்டு:"
            : "Prices dip at harvest time (everyone sells at once). Storing can earn the lean-month premium — but storage has its own price:"}
        </p>
        <ul className={`list-disc pl-5 space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {(lang === "ta" ? [
            "விற்கவும் — உங்களுக்கு உடனடியாகப் பணம் தேவைப்பட்டால், அல்லது கடன் வட்டி சேமிப்பு லாபத்தை விழுங்கும் என்றால்.",
            "விற்கவும் — தானியம் 14% ஈரப்பதத்திற்கு மேல் இருந்தால். ஈரத் தானியம் சேமிப்பில் பூஞ்சை பிடித்து மதிப்பிழக்கும்.",
            "சேமிக்கவும் — உலர்ந்த, சுத்தமான தானியம் + எலி/பூச்சி இல்லாத கிடங்கு இருந்தால். 2–3 மாதம் காத்திருப்பு பொதுவாக நல்ல விலை தரும்.",
            "சேமிக்கவும் — அரசு கொள்முதல் நிலையம் இன்னும் திறக்கவில்லை என்றால். MSP-யில் விற்க கொள்முதல் நாளுக்காகக் காத்திருப்பது பெரும்பாலும் லாபம்.",
            "கணக்கு போடுங்கள்: சேமிப்புச் செலவு + வட்டி < எதிர்பார்க்கும் விலை உயர்வு என்றால் மட்டுமே சேமிக்கவும்.",
          ] : [
            "Sell now if you need cash immediately, or if loan interest will eat the storage gain.",
            "Sell now if grain moisture is above 14%. Damp grain moulds in storage and loses value.",
            "Store if the grain is dry and clean and you have a rat- and pest-proof store. Waiting 2–3 months usually pays.",
            "Store if the government procurement centre has not opened yet — waiting for the MSP purchase day is usually profitable.",
            "Do the maths: store only if storage cost + interest < the price rise you expect.",
          ]).map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </Card>

      <Card className="mt-8">
        <SectionTitle>✓ {t("fair_title")}</SectionTitle>
        <p className={`text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>{t("fair_intro")}</p>
        <ol className={`list-decimal pl-5 space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {FAIR_POINTS.map((p, i) => (
            <li key={i}>{lang === "ta" ? p.ta : p.en}</li>
          ))}
        </ol>
      </Card>

      {/* Sell smart at the mandi — the weighment and moisture tricks cost
          farmers more per season than the price itself. Fair checklist above
          is about knowing MSP; this is about the sale itself. */}
      <Card className="mt-8">
        <SectionTitle>⚖️ {lang === "ta" ? "மண்டியில் புத்திசாலியாக விற்கவும்" : "Sell smart at the mandi"}</SectionTitle>
        <ul className={`list-disc pl-5 space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {(lang === "ta" ? [
            "வீட்டிலேயே ஒவ்வொரு மூட்டையையும் எடை போட்டு எண்ணை மூட்டையில் எழுதுங்கள் — மண்டி எடையுடன் ஒப்பிடுங்கள்.",
            "'ஈரம் அதிகம்' என்று வியாபாரி கழிப்பது வழக்கம். தானியத்தை நன்கு உலர்த்திய பின் விற்கவும் — நெல்லுக்கு அரசு அளவு 17% ஈரப்பதம்.",
            "ஒவ்வொரு விலையையும் எழுத்தில் வாங்குங்கள் — மேலே உள்ள விலை ஏட்டில் குறித்தால் MSP-உடன் தானே ஒப்பிடும்.",
            "மூட்டைகளை மண்டியில் எண்ணுங்கள்; தானியத்தை இரவு காவலின்றி விட வேண்டாம்.",
            "'முன்பணம் கொடுத்தேன், எனக்கே விற்க வேண்டும்' என்ற பிடியில் சிக்க வேண்டாம் — முன்பணம் வட்டி, விலை அல்ல.",
          ] : [
            "Weigh every bag at home first and write the number on the bag — compare with the mandi scale.",
            "Traders routinely cut for 'too much moisture'. Dry your grain properly before selling — the government bar for paddy is 17% moisture.",
            "Get every price in writing — log it in the quote book above and Payir compares it with MSP for you.",
            "Count your bags at the mandi; never leave grain overnight unattended.",
            "Don't get trapped by the trader who gave you an advance — an advance is a loan, not a price.",
          ]).map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </Card>

      {/* e-NAM — researched 20 Oct 2026 (govtschemes.in, khetikisaan):
          it is not a separate market, it is the online bidding layer inside
          your own APMC mandi. The honest case for when it helps (assayable
          non-perishable crops, distant bidders) and when it doesn't
          (thin trader registration on your mandi). */}
      <Card className="mt-8">
        <SectionTitle>🌐 {lang === "ta" ? "மண்டியைத் தாண்டி விற்கவும் (e-NAM)" : "Sell beyond your mandi (e-NAM)"}</SectionTitle>
        <p className={`text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {lang === "ta"
            ? "e-NAM என்பது தனி மண்டி அல்ல — உங்கள் APMC மண்டிக்குள் நடக்கும் இணைய ஏலம். நாடு முழுவதும் உள்ள வியாபாரிகள் உங்கள் தானியத்திற்கு ஏலம் கேட்கலாம்:"
            : "e-NAM is not a separate mandi — it is the online auction layer inside your own APMC mandi. Traders from across India can bid on your lot:"}
        </p>
        <ol className={`list-decimal pl-5 space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {(lang === "ta" ? [
            "பதிவு இலவசம்: ஆதார், வங்கி கணக்கு, மொபைல் எண்ணுடன் enam.gov.in-இல் அல்லது மண்டி உதவி மையத்தில் பதிவு செய்யுங்கள். APMC ஒப்புதலுக்குப் பின் நிரந்தர login கிடைக்கும்.",
            "தானியத்தைச் சுத்தம் செய்து மண்டிக்கு எடுத்துச் செல்லுங்கள். மண்டி ஆய்வகத்தில் இலவசத் தரப் பரிசோதனை (assaying) செய்யுங்கள் — தரச் சான்றிதழ் உள்ள தானியத்திற்கு வியாபாரிகள் அதிக விலை தருகிறார்கள்.",
            "உங்கள் லாட் இணையத்தில் தோன்றும்; தொலைதூர வியாபாரிகள் ஏலம் கேட்பார்கள். அதிக ஏலம் வந்ததும் ஏற்பதா வேண்டாமா என்பது உங்கள் முடிவு.",
            "விற்றால் பணம் 24–72 மணி நேரத்தில் உங்கள் வங்கி கணக்கில் நேரடியாக வரும் — வியாபாரி வழியாக அல்ல.",
            "100 கி.மீ சுற்றளவில் எந்த மண்டியிலும் விற்கலாம் — வெளியேறும் முன் அந்த மண்டியின் விலையை விசாரியுங்கள்.",
          ] : [
            "Registration is free: sign up on enam.gov.in (or at the mandi help desk) with Aadhaar, bank account and mobile number. Your APMC approves it and you get a permanent login.",
            "Bring cleaned grain to the mandi and use the free quality assaying at the mandi lab — traders bid more for a lot that carries a quality certificate.",
            "Your lot appears online; distant traders bid. When the top bid comes, accepting it is your call.",
            "On sale, the money lands directly in your bank account in 24–72 hours — not through the trader.",
            "You can sell at any mandi within 100 km — check that mandi's price before you leave.",
          ]).map((x, i) => <li key={i}>{x}</li>)}
        </ol>
        <p className={`mt-3 text-sm text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>
          {lang === "ta"
            ? "நேர்மையான எச்சரிக்கை: சிறு மூட்டைகளுக்கு ஏலம் குறைவு. FPO-வில் சேர்ந்து பல விவசாயிகளின் தானியத்தை ஒரு லாட்டாக விற்றால் விலை அதிகம். அழுகும் பொருட்களுக்கு உள்ளூர் மண்டியே விரைவு."
            : "The honest caveat: small lots attract fewer bids. Pool your grain with fellow farmers through an FPO and sell as one lot for a better price. For perishables, the local mandi floor is still faster."}
        </p>
      </Card>

      <p className={`mt-6 text-xs text-[var(--color-ink-faint)] ${lang === "ta" ? "ta-fallback" : ""}`}>
        {lang === "ta"
          ? "ஆதாரம்: 13 மே 2026 பத்திரிகைத் தகவல் நிறுவன அறிக்கை (காரீஃப் 2026-27). கரும்பு FRP இந்த அட்டவணையில் இல்லை — உங்கள் ஆலையின் விலை அட்டையைப் பார்க்கவும்."
          : "Source: PIB press release, 13 May 2026 (kharif 2026-27). Sugarcane FRP is not in this table — check your mill's rate card."}
      </p>

      <BackHome />
    </div>
  );
}
