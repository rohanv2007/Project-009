"use client";

import React, { useEffect, useState } from "react";
import { useLang } from "../../lib/i18n";
import { useDB, SchemeStatus, ClaimLog } from "../../lib/db";
import { SCHEMES } from "../../lib/data";
import { PageHead, Card, SectionTitle, BackHome } from "../../components/ui";

const STATUS_BADGE: Record<SchemeStatus, string> = {
  not: "",
  progress: "badge-amber",
  done: "badge-green",
  na: "",
};

/* PM-KISAN instalment tracker: the ₹6,000/year stops silently when e-KYC
   lapses, so the family ticks each ₹2,000 instalment as it lands. */
function KisanTracker() {
  const { lang } = useLang();
  const { db, toggleKisan } = useDB();
  // Client-only clock (Next 16 prerender).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);
  if (!now) return null;

  const m = now.getMonth();
  const y = now.getFullYear();
  const fy = m >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
  const periods = [
    { n: 1, en: "Apr – Jul", ta: "ஏப்ரல் – ஜூலை" },
    { n: 2, en: "Aug – Nov", ta: "ஆகஸ்ட் – நவம்பர்" },
    { n: 3, en: "Dec – Mar", ta: "டிசம்பர் – மார்ச்" },
  ];
  const got = periods.filter((p) => db.kisanInstalments[`${fy}:${p.n}`]);

  return (
    <Card className="mb-6">
      <SectionTitle>💰 {lang === "ta" ? `இந்த ஆண்டின் ₹6,000 (${fy})` : `This year's ₹6,000 (${fy})`}</SectionTitle>
      <p className={`text-sm text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
        {lang === "ta"
          ? "PM-KISAN மூன்று ₹2,000 தவணைகளாக வரும். வங்கியில் வந்ததும் இங்கே குறித்துக்கொள்ளுங்கள் — ஒரு தவணை தவறினால் e-KYC-யைச் சரிபார்க்கவும்."
          : "PM-KISAN arrives as three ₹2,000 instalments. Tick each one as it lands in your bank — if one goes missing, check your e-KYC."}
      </p>
      <ul className="space-y-2 mb-3">
        {periods.map((p) => {
          const key = `${fy}:${p.n}`;
          const date = db.kisanInstalments[key];
          return (
            <li key={p.n} className={`flex items-center justify-between gap-3 border-b border-[var(--color-line)] pb-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
              <div>
                <p className="font-semibold">₹2,000 · {lang === "ta" ? p.ta : p.en}</p>
                {date && (
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    {new Date(date + "T00:00:00").toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleKisan(key)}
                aria-pressed={!!date}
                className={`btn !min-h-0 !py-1.5 !px-3 text-sm ${date ? "btn-primary" : "btn-ghost"}`}
              >
                {date ? (lang === "ta" ? "✓ வந்தது" : "✓ Received") : (lang === "ta" ? "வந்ததாகக் குறி" : "Mark received")}
              </button>
            </li>
          );
        })}
      </ul>
      <p className={`text-sm ${lang === "ta" ? "ta-fallback" : ""}`}>
        <strong>
          {lang === "ta"
            ? `இதுவரை: ₹${(got.length * 2000).toLocaleString("en-IN")} / ₹6,000`
            : `So far: ₹${(got.length * 2000).toLocaleString("en-IN")} / ₹6,000`}
        </strong>
        {got.length < 3 && (
          <span className="text-[var(--color-ink-soft)]">
            {lang === "ta"
              ? " — தவணை தாமதமானால் pmkisan.gov.in-ல் பயனாளி நிலையைப் பார்க்கவும்."
              : " — if an instalment is overdue, check your beneficiary status on pmkisan.gov.in."}
          </span>
        )}
      </p>
    </Card>
  );
}

/* PMFBY premium estimator: the farmer's share is fixed by the scheme —
   2% of sum insured for kharif, 1.5% for rabi, 5% for commercial and
   horticulture crops — with the Centre and the state paying the rest of the
   actuarial premium. Farmers who see the number in rupees, not percent,
   decide before the enrolment deadline instead of after it. */
function PremiumEstimator() {
  const { lang } = useLang();
  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";
  const [cls, setCls] = useState<"kharif" | "rabi" | "commercial">("kharif");
  const [sum, setSum] = useState("");

  const RATES = {
    kharif: { rate: 0.02, en: "Kharif (paddy, cotton, groundnut…)", ta: "காரீஃப் (நெல், பருத்தி, நிலக்கடலை…)" },
    rabi: { rate: 0.015, en: "Rabi (samba, wheat…)", ta: "ரபி (சம்பா, கோதுமை…)" },
    commercial: { rate: 0.05, en: "Commercial / horticulture", ta: "வணிக / தோட்டப் பயிர்" },
  };
  const sumNum = parseFloat(sum) || 0;
  const premium = Math.round(sumNum * RATES[cls].rate);

  return (
    <Card className="mb-6">
      <SectionTitle>🧮 {ta ? "PMFBY காப்பீடு கட்டணக் கணக்கி" : "PMFBY premium calculator"}</SectionTitle>
      <p className={`text-sm text-[var(--color-ink-soft)] mb-4 ${taFont}`}>
        {ta
          ? "காப்பீட்டுத் தொகையில் விவசாயி செலுத்தும் பங்கு நிலையானது — காரீஃப் 2%, ரபி 1.5%, வணிக/தோட்டப் பயிர் 5%. மீதி காப்பீடு கட்டணத்தை மத்திய + மாநில அரசுகள் செலுத்தும். ரூபாயில் தெரிந்தால் பதிவு நாளுக்கு முன் முடிவு எடுக்கலாம்."
          : "The farmer's share of the premium is fixed — 2% of sum insured for kharif, 1.5% for rabi, 5% for commercial/horticulture crops. The Centre and the state pay the rest of the actuarial premium. Seeing it in rupees helps you decide before enrolment closes, not after."}
      </p>
      <div className="grid sm:grid-cols-2 gap-3 mb-4 no-print">
        <label className="block">
          <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "பருவ வகை" : "Season type"}</span>
          <select className="field" value={cls} onChange={(e) => setCls(e.target.value as typeof cls)}>
            {(Object.keys(RATES) as (keyof typeof RATES)[]).map((k) => (
              <option key={k} value={k}>{ta ? RATES[k].ta : RATES[k].en} — {Math.round(RATES[k].rate * 1000) / 10}%</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "காப்பீட்டுத் தொகை ₹" : "Sum insured ₹"}</span>
          <input
            className="field"
            type="number"
            min="0"
            value={sum}
            onChange={(e) => setSum(e.target.value)}
            inputMode="numeric"
            placeholder={ta ? "எ.கா. 50000" : "e.g. 50000"}
          />
        </label>
      </div>
      {sumNum > 0 && (
        <div className="border border-[var(--color-sage)] bg-[var(--color-sage-wash)] p-4" aria-live="polite">
          <p className="kicker mb-1">{ta ? "நீங்கள் செலுத்தும் கட்டணம்" : "Your premium"}</p>
          <p className="headline text-2xl font-bold">₹{premium.toLocaleString("en-IN")}</p>
          <p className={`text-sm text-[var(--color-ink-soft)] mt-1 ${taFont}`}>
            {ta
              ? `₹${sumNum.toLocaleString("en-IN")}-இல் ${Math.round(RATES[cls].rate * 1000) / 10}% — மீதியை அரசு செலுத்தும். உண்மையான கட்டணம் காப்பீட்டு நிறுவன விகிதத்தைப் பொறுத்து இதற்குக் கீழே இருக்கலாம். சந்தேகம்: உதவி எண் 14447.`
              : `${Math.round(RATES[cls].rate * 1000) / 10}% of ₹${sumNum.toLocaleString("en-IN")} — the government pays the rest. The actual premium can only be lower, never higher, than this cap. Doubts: helpline 14447.`}
          </p>
        </div>
      )}
    </Card>
  );
}

/* Claim incident log: PMFBY only pays when the loss is reported within 72
   hours of being noticed. Each incident gets a live countdown so the family
   sees exactly how long they have left — and a written record to show the
   agriculture officer or bank. */
function ClaimLogBook() {
  const { lang } = useLang();
  const { db, addClaimLog, removeClaimLog, setCheck } = useDB();
  const [crop, setCrop] = useState("");
  const [lossType, setLossType] = useState("flood");
  const [at, setAt] = useState("");
  const [note, setNote] = useState("");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";
  const types: { id: string; en: string; ta: string }[] = [
    { id: "flood", en: "Flood / waterlogging", ta: "வெள்ளம் / தண்ணீர் தேக்கம்" },
    { id: "drought", en: "Drought / dry spell", ta: "வறட்சி" },
    { id: "pest", en: "Pest / disease outbreak", ta: "பூச்சி / நோய் தாக்குதல்" },
    { id: "storm", en: "Storm / hail / cyclone", ta: "புயல் / ஆலங்கட்டி மழை" },
    { id: "other", en: "Other", ta: "மற்றவை" },
  ];
  const typeName = (id: string) => types.find((x) => x.id === id) ?? types[0];

  // The evidence kit a PMFBY claim actually needs: without these, the
  // intimation inside 72 hours dies in paperwork later.
  const EVIDENCE: { id: string; en: string; ta: string }[] = [
    { id: "photos", en: "Damage photos (close + whole field), ideally with location on", ta: "சேதப் புகைப்படங்கள் (நெருக்கமாக + முழு வயல்), இருப்பிடத்துடன்" },
    { id: "aadhaar", en: "Aadhaar + land records (patta / chitta) ready", ta: "ஆதார் + நில ஆவணங்கள் (பட்டா / சிட்டா) தயார்" },
    { id: "bank", en: "Bank passbook copy (claim money comes here)", ta: "வங்கி பாஸ்புக் நகல் (பணம் இங்குதான் வரும்)" },
    { id: "sowing", en: "Sowing proof — seed bill or panchayat record", ta: "விதைப்புச் சான்று — விதை ரசீது அல்லது பஞ்சாயத்து பதிவு" },
    { id: "intimation", en: "72h intimation done — 14447 / Crop Insurance App / bank", ta: "72 மணி அறிவிப்பு முடிந்தது — 14447 / காப்பீடு செயலி / வங்கி" },
  ];
  const evidenceCount = (claimId: string) => EVIDENCE.filter((e) => db.checks[`evidence:${claimId}:${e.id}`]).length;

  const submit = () => {
    if (!crop.trim() || !at) return;
    addClaimLog({ crop: crop.trim(), lossType, note: note.trim(), at: new Date(at).toISOString() });
    setCrop(""); setLossType("flood"); setAt(""); setNote("");
  };

  const hoursLeft = (iso: string) => {
    if (now == null) return null;
    return (new Date(iso).getTime() + 72 * 3600000 - now) / 3600000;
  };

  return (
    <Card className="mb-6">
      <SectionTitle>📝 {ta ? "சேதப் பதிவேடு — காலக்கெடு கணிப்பான்" : "Loss log with deadline countdown"}</SectionTitle>
      <p className={`text-sm text-[var(--color-ink-soft)] mb-4 ${taFont}`}>
        {ta
          ? "சேதம் தெரிந்த நேரத்தை இங்கே குறித்துவையுங்கள் — 72 மணி நேரத்திற்குள் புகார் செய்ய வேண்டிய நேரம் எஞ்சியிருப்பதை பயிர் கணக்கிடும். இந்தப் பதிவு வங்கி/அதிகாரிக்கு ஆதாரம்."
          : "Note exactly when you noticed the damage — Payir counts down the 72-hour reporting window. This written log is your evidence for the bank or officer."}
      </p>

      {db.claimLogs.length > 0 && (
        <ul className="space-y-2 mb-5">
          {db.claimLogs.map((c: ClaimLog) => {
            const left = hoursLeft(c.at);
            const ready = evidenceCount(c.id);
            return (
              <li key={c.id} className="border-b border-[var(--color-line)] pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {c.crop} · {ta ? typeName(c.lossType).ta : typeName(c.lossType).en}
                    </p>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      {new Date(c.at).toLocaleString(ta ? "ta-IN" : "en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {c.note ? ` · ${c.note}` : ""}
                    </p>
                  </div>
                  <span className="flex items-center gap-2 shrink-0">
                    {left != null && (
                      <span className={`badge ${left < 0 ? "badge-coral" : left <= 24 ? "badge-amber" : "badge-green"}`}>
                        {left < 0
                          ? (ta ? "காலக்கெடு தாண்டியது" : "window closed")
                          : (ta ? `${Math.floor(left)} மணி மீதம்` : `${Math.floor(left)}h left`)}
                      </span>
                    )}
                    <button className="text-[var(--color-coral)] text-sm no-print" onClick={() => removeClaimLog(c.id)} aria-label={ta ? "நீக்கு" : "Delete"}>✕</button>
                  </span>
                </div>
                <div className="mt-2 no-print">
                  <p className={`text-xs font-semibold mb-1.5 text-[var(--color-ink-soft)] ${taFont}`}>
                    {ta ? `ஆதாரக் கருவி — ${ready}/${EVIDENCE.length} தயார்` : `Evidence kit — ${ready}/${EVIDENCE.length} ready`}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {EVIDENCE.map((e) => {
                      const on = !!db.checks[`evidence:${c.id}:${e.id}`];
                      return (
                        <button
                          key={e.id}
                          onClick={() => setCheck(`evidence:${c.id}:${e.id}`, !on)}
                          aria-pressed={on}
                          className={`text-left text-xs px-2.5 py-1.5 border ${on ? "border-[var(--color-accent)] bg-[var(--color-accent-wash)]" : "border-[var(--color-line)] bg-[var(--color-card)]"}`}
                        >
                          <span className="mr-1.5">{on ? "☑" : "☐"}</span>
                          {ta ? e.ta : e.en}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid sm:grid-cols-2 gap-3 no-print">
        <label className="block">
          <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "பயிர்" : "Crop"}</span>
          <input className="field" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder={ta ? "எ.கா. நெல்" : "e.g. Paddy"} />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "சேத வகை" : "Loss type"}</span>
          <select className="field" value={lossType} onChange={(e) => setLossType(e.target.value)}>
            {types.map((x) => <option key={x.id} value={x.id}>{ta ? x.ta : x.en}</option>)}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "சேதம் தெரிந்த நேரம்" : "When did you notice the damage?"}</span>
          <input className="field" type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "குறிப்பு (விருப்பம்)" : "Note (optional)"}</span>
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder={ta ? "எ.கா. வடக்கு வயல், பாதி நீர்" : "e.g. north field, half submerged"} />
        </label>
      </div>
      <div className="no-print mt-3">
        <button className="btn btn-primary" onClick={submit}>{ta ? "பதிவு சேர்" : "Log incident"}</button>
      </div>
    </Card>
  );
}

/* KCC loan tracker: the 7% − 3% = 4% rule is the cheapest money a farmer
   will ever borrow — but only if the due date is met. Each loan gets a
   countdown badge and the exact rupee saving of repaying on time.
   Researched 19 Oct 2026: concessional 7% short-term crop loans via KCC,
   3% prompt-repayment incentive → effective 4% (RBI MISS circular,
   FY2025-26); subvention on the portion up to ₹3 lakh; overall KCC limit
   raised to ₹5 lakh in Budget 2025. */
function LoanTracker() {
  const { lang } = useLang();
  const { db, addLoan, removeLoan } = useDB();
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); }, []);

  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";

  const daysLeft = (d: string) => {
    const ref = today ?? new Date().toISOString().slice(0, 10);
    return Math.round((new Date(d + "T00:00:00").getTime() - new Date(ref + "T00:00:00").getTime()) / 86400000);
  };

  const add = () => {
    const amt = parseFloat(amount);
    if (!bank.trim() || !amt || amt <= 0 || !due) return;
    addLoan({ bank: bank.trim(), amount: amt, dueDate: due, note: "" });
    setBank(""); setAmount(""); setDue("");
  };

  const sorted = [...db.farmLoans].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <Card className="mb-6 !border-[var(--color-accent)]">
      <SectionTitle>🏦 {ta ? "கடன் கண்காணிப்பு (KCC)" : "Farm loan tracker (KCC)"}</SectionTitle>
      <p className={`text-sm text-[var(--color-ink-soft)] mb-4 ${taFont}`}>
        {ta
          ? "கிசான் கிரெடிட் கார்டு பயிர்க் கடன் வட்டி 7% — ஆனால் காலத்தில் திருப்பிச் செலுத்தினால் அரசு 3% தள்ளுபடி தரும், உங்கள் உண்மையான வட்டி 4%. ₹3 லட்சம் வரையிலான கடனுக்கு இந்தச் சலுகை. காலக்கெடு தவறினால் 3% போய்விடும்."
          : "Kisan Credit Card crop loans run at 7% — but repay on time and the government pays back 3%, so your real rate is 4%. The discount covers loans up to ₹3 lakh. Miss the due date and the 3% is gone."}
      </p>
      <div className={`border border-[var(--color-line)] bg-[var(--color-paper)] p-3 mb-4 text-sm ${taFont}`}>
        <p className="font-bold mb-1.5">{ta ? "📰 KCC-யில் புதியது (2026)" : "📰 What's new with KCC (2026)"}</p>
        <ul className="list-disc pl-5 space-y-1 text-[var(--color-ink-soft)]">
          {(ta ? [
            "கடன் உச்சவரம்பு ₹5 லட்சமாக உயர்ந்துள்ளது (2025-26 பட்ஜெட்) — 7% வட்டி சலுகை ₹3 லட்சம் வரை தொடரும்.",
            "₹2 லட்சம் வரை அடமானம் தேவையில்லை; வாடகை/கூட்டு விவசாயிகளும் விண்ணப்பிக்கலாம்.",
            "PM-KISAN பயனாளிகள் ஒரு பக்கப் படிவத்தில் விண்ணப்பிக்கலாம் — ஆதார் மூலம் டிஜிட்டல் e-KYC கிடைக்கிறது.",
            "கார்டு காலம் இனி 6 ஆண்டுகள் (ஆண்டு மதிப்பாய்வுடன்).",
          ] : [
            "The loan ceiling is now ₹5 lakh (Budget 2025-26) — the 7% concession still applies to the first ₹3 lakh.",
            "No collateral needed up to ₹2 lakh; tenant and sharecropper farmers can apply too.",
            "PM-KISAN beneficiaries apply with a single one-page form — Aadhaar-based digital e-KYC speeds it up.",
            "The card now runs for 6 years (with annual review).",
          ]).map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>

      {sorted.length > 0 && (
        <ul className={`space-y-3 mb-5 ${taFont}`} aria-live="polite">
          {sorted.map((l) => {
            const left = daysLeft(l.dueDate);
            const interest4 = l.amount * 0.04;
            const saved = l.amount * 0.03;
            return (
              <li key={l.id} className="border-b border-[var(--color-line)] pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{l.bank}</p>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      ₹{Math.round(l.amount).toLocaleString("en-IN")} ·{" "}
                      {new Date(l.dueDate + "T00:00:00").toLocaleDateString(ta ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className={`badge ${left < 0 ? "badge-coral" : left <= 30 ? "badge-amber" : "badge-green"}`}>
                      {left < 0
                        ? (ta ? `${-left} நாள் தாமதம்` : `${-left}d overdue`)
                        : left === 0
                          ? (ta ? "இன்று!" : "Today!")
                          : (ta ? `${left} நாள்` : `${left}d left`)}
                    </span>
                    <button className="text-[var(--color-coral)] text-sm no-print" onClick={() => removeLoan(l.id)} aria-label={ta ? "நீக்கு" : "Delete"}>✕</button>
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-sage)] font-semibold">
                  {ta
                    ? `காலத்தில் செலுத்தினால் ஆண்டு வட்டி ≈ ₹${Math.round(interest4).toLocaleString("en-IN")} — ₹${Math.round(saved).toLocaleString("en-IN")} மிச்சம்`
                    : `On-time interest ≈ ₹${Math.round(interest4).toLocaleString("en-IN")}/yr — you save ₹${Math.round(saved).toLocaleString("en-IN")}`}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 no-print">
        <label className="block">
          <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "வங்கி / சங்கம்" : "Bank / society"}</span>
          <input className="field" value={bank} onChange={(e) => setBank(e.target.value)} placeholder={ta ? "எ.கா. கூட்டுறவு வங்கி" : "e.g. Cooperative bank"} />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "கடன் தொகை ₹" : "Loan amount ₹"}</span>
          <input className="field" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "திருப்பிச் செலுத்தும் தேதி" : "Repayment due date"}</span>
          <input className="field" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </label>
        <div className="flex items-end">
          <button className="btn btn-primary" onClick={add}>{ta ? "கடன் சேர்" : "Add loan"}</button>
        </div>
      </div>
      <p className={`mt-3 text-xs text-[var(--color-ink-faint)] ${taFont}`}>
        {ta
          ? "மதிப்பீடு: ஒரு ஆண்டு எளிய வட்டி. ₹3 லட்சத்திற்கு மேல் உள்ள பகுதிக்கு வங்கியின் சாதாரண வட்டி."
          : "Estimate: one year of simple interest. The part above ₹3 lakh is charged the bank's normal rate."}
      </p>
    </Card>
  );
}

/* Family document wallet: every scheme in this app asks for the same
   handful of papers, and a missing one at the counter kills the
   application. One consolidated checklist with where-to-get-each,
   persisted through the generic checks store (docs:<id>). */
function DocWallet() {
  const { lang } = useLang();
  const { db, setCheck } = useDB();
  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";

  const DOCS: { id: string; en: string; ta: string; getEn: string; getTa: string }[] = [
    { id: "aadhaar", en: "Aadhaar card — all adult family members", ta: "ஆதார் அட்டை — வீட்டில் அனைத்து வயதானோருக்கும்",
      getEn: "Aadhaar enrolment centre; link your mobile number there too — DBT needs it.", getTa: "ஆதார் மையம்; கைபேசி எண்ணையும் இணைக்கவும் — நேரடி பணம் அதற்குத்தான்." },
    { id: "patta", en: "Patta / chitta land records", ta: "பட்டா / சிட்டா நில ஆவணங்கள்",
      getEn: "Tamil Nadu e-services (eservices.tn.gov.in) or your Village Administrative Officer.", getTa: "தமிழ்நாடு இ-சேவைகள் அல்லது உங்கள் கிராம நிர்வாக அலுவலர்." },
    { id: "passbook", en: "Bank passbook + one cancelled cheque leaf", ta: "வங்கி பாஸ்புக் + ரத்து செய்யப்பட்ட காசோலை",
      getEn: "Your bank branch — ask for a cancelled cheque leaf while you are there.", getTa: "உங்கள் வங்கிக் கிளை — செல்லும்போது ரத்து காசோலை இலையும் வாங்குங்கள்." },
    { id: "mobile", en: "Mobile number linked to Aadhaar AND bank account", ta: "ஆதார் + வங்கிக் கணக்குடன் இணைந்த கைபேசி எண்",
      getEn: "Aadhaar centre for Aadhaar-seeding; bank branch for account-seeding.", getTa: "ஆதார் மையத்தில் ஆதார் இணைப்பு; வங்கியில் கணக்கு இணைப்பு." },
    { id: "photos", en: "Passport-size photos — 6 copies", ta: "பாஸ்போர்ட் புகைப்படம் — 6 நகல்",
      getEn: "Any photo studio; keep a digital copy on the phone too.", getTa: "ஏதேனும் ஸ்டூடியோ; கைபேசியிலும் டிஜிட்டல் நகல் வைத்துக்கொள்ளுங்கள்." },
    { id: "ration", en: "Ration card", ta: "ரேஷன் அட்டை",
      getEn: "e-services or the taluk office — doubles as address and income proof.", getTa: "இ-சேவை அல்லது தாலுகா அலுவலகம் — முகவரி + வருமானச் சான்றாகவும் பயன்படும்." },
    { id: "lease", en: "Lease agreement (only if you farm rented land)", ta: "குத்தகை ஒப்பந்தம் (வாடகை நிலம் என்றால் மட்டும்)",
      getEn: "Written agreement with the landowner + one witness — tenant farmers qualify for KCC and PMFBY through JLG/SHG.", getTa: "நில உரிமையாளருடன் எழுத்து ஒப்பந்தம் + ஒரு சாட்சி — வாடகை விவசாயிகளும் KCC/PMFBY பெறலாம்." },
  ];
  const done = DOCS.filter((x) => db.checks[`docs:${x.id}`]).length;

  return (
    <Card className="mb-6">
      <SectionTitle>📂 {ta ? "குடும்ப ஆவணப் பை" : "Family document wallet"}</SectionTitle>
      <p className={`text-[var(--color-ink-soft)] mb-4 ${taFont}`}>
        {ta
          ? "இந்தப் பக்கத்தின் ஒவ்வொரு திட்டமும் இதே ஆவணங்களையே கேட்கும். இன்று ஒரு நகல் பெட்டி தயார் செய்தால், கவுன்ட்டரில் திருப்பி அனுப்பப்பட மாட்டீர்கள்:"
          : "Every scheme on this page asks for the same papers. Keep one folder ready today and no counter will turn you away:"}
      </p>
      <p className={`text-sm font-semibold mb-3 ${taFont}`}>
        {ta ? `${done}/${DOCS.length} தயார்` : `${done}/${DOCS.length} ready`}
      </p>
      <ul className="space-y-2 no-print">
        {DOCS.map((x) => {
          const on = !!db.checks[`docs:${x.id}`];
          return (
            <li key={x.id}>
              <button
                onClick={() => setCheck(`docs:${x.id}`, !on)}
                aria-pressed={on}
                className={`w-full text-left p-3 border flex items-start gap-3 ${on ? "border-[var(--color-accent)] bg-[var(--color-accent-wash)]" : "border-[var(--color-line)] bg-[var(--color-card)]"}`}
              >
                <span className="mt-0.5">{on ? "☑" : "☐"}</span>
                <span className={taFont}>
                  <span className="font-semibold block">{ta ? x.ta : x.en}</span>
                  <span className="text-sm text-[var(--color-ink-soft)]">{ta ? `எங்கே: ${x.getTa}` : `Where: ${x.getEn}`}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default function SchemesPage() {
  const { t, lang } = useLang();
  const { db, setSchemeStatus, setCheck } = useDB();

  const opt = (k: "not" | "progress" | "done" | "na") => t(`status_options_${k}`);

  return (
    <div>
      <PageHead kicker={t("schemes_kicker")} title={t("schemes_title")} sub={t("schemes_sub")} />

      {/* 72-hour loss report — the claim lives or dies here */}
      <Card className="mb-6 !border-[var(--color-coral)]">
        <SectionTitle>🚨 {lang === "ta" ? "பயிர் சேதம்? 72 மணி நேர விதி" : "Crop damaged? The 72-hour rule"}</SectionTitle>
        <p className={`text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {lang === "ta"
            ? "பயிர் காப்பீடு கோரிக்கை நிராகரிக்கப்படுவதற்கு முக்கிய காரணம் தாமதமான புகார். சேதம் தெரிந்த 72 மணி நேரத்திற்குள் இதைச் செய்யுங்கள்:"
            : "The top reason crop-insurance claims die is a late report. Within 72 hours of noticing damage, do this:"}
        </p>
        <ol className={`list-decimal pl-5 space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {(lang === "ta" ? [
            "சேதமடைந்த வயலை புகைப்படம் எடுக்கவும் — இருப்பிடம் (location) இயக்கத்தில் இருக்க வேண்டும்.",
            "Crop Insurance App / PMFBY இணையதளத்தில் இழப்பைப் பதிவு செய்யுங்கள்; புகைப்படங்களை இணைக்கவும்.",
            "விண்ணப்ப/புகார் எண்ணை எழுதி வைத்துக்கொள்ளுங்கள் — இதுதான் உங்கள் ஆதாரம்.",
            "வங்கி/கூட்டுறவு சங்கத்திற்கும் தகவல் தெரிவியுங்கள்.",
            "உதவி எண் 14447 — சந்தேகம் இருந்தால் அழைக்கவும்.",
          ] : [
            "Photograph the damaged field with location turned on — geotagged photos are mandatory.",
            "Report the loss on the Crop Insurance App / PMFBY portal and attach the photos.",
            "Write down your report/docket number — that is your proof.",
            "Inform your bank or cooperative society too.",
            "Helpline 14447 if anything is unclear.",
          ]).map((x, i) => <li key={i}>{x}</li>)}
        </ol>
      </Card>

      <ClaimLogBook />

      <LoanTracker />

      <DocWallet />

      <KisanTracker />

      <PremiumEstimator />

      {/* Procurement readiness — MSP is real only at the government purchase
          centre, and the centre turns away unregistered farmers every year.
          The harvest checklist covers logistics; this covers the paperwork. */}
      <Card className="mb-6">
        <SectionTitle>🏛️ {lang === "ta" ? "அரசு கொள்முதல் — தயாரா?" : "Government procurement — are you ready?"}</SectionTitle>
        <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {lang === "ta"
            ? "MSP-யில் விற்க நேரடி கொள்முதல் நிலையத்தில் (DPC) பதிவு அவசியம். அறுவடை நெருங்குவதற்கு முன் இவற்றை முடியுங்கள்:"
            : "To sell at MSP you must be registered at the Direct Purchase Centre (DPC). Finish these before harvest approaches:"}
        </p>
        {(() => {
          const ITEMS: { id: string; en: string; ta: string }[] = [
            { id: "register", en: "Registered at the DPC for this season's crop", ta: "இந்தப் பருவப் பயிருக்கு DPC-யில் பதிவு செய்தாயிற்று" },
            { id: "docs", en: "Aadhaar, land records (patta/chitta), bank passbook copies ready", ta: "ஆதார், நில ஆவணங்கள் (பட்டா/சிட்டா), வங்கி பாஸ்புக் நகல்கள் தயார்" },
            { id: "mobile", en: "Mobile number linked (procurement SMS and payment alerts come here)", ta: "கைபேசி எண் இணைக்கப்பட்டது (SMS, பண அறிவிப்புகள் இங்குதான் வரும்)" },
            { id: "dates", en: "Know this crop's procurement window dates for your centre", ta: "உங்கள் மையத்தின் கொள்முதல் தேதிகள் தெரியும்" },
          ];
          const done = ITEMS.filter((x) => db.checks[`procure:${x.id}`]).length;
          return (
            <>
              <p className={`text-sm font-semibold mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
                {lang === "ta" ? `${done}/${ITEMS.length} தயார்` : `${done}/${ITEMS.length} ready`}
              </p>
              <ul className="space-y-2 no-print">
                {ITEMS.map((x) => {
                  const on = !!db.checks[`procure:${x.id}`];
                  return (
                    <li key={x.id}>
                      <button
                        onClick={() => setCheck(`procure:${x.id}`, !on)}
                        aria-pressed={on}
                        className={`w-full text-left p-3 border flex items-start gap-3 ${on ? "border-[var(--color-accent)] bg-[var(--color-accent-wash)]" : "border-[var(--color-line)] bg-[var(--color-card)]"}`}
                      >
                        <span className="mt-0.5">{on ? "☑" : "☐"}</span>
                        <span className={lang === "ta" ? "ta-fallback" : ""}>{lang === "ta" ? x.ta : x.en}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          );
        })()}
      </Card>

      <div className="space-y-5">
        {SCHEMES.map((s) => {
          const st: SchemeStatus = db.schemeStatus[s.id] ?? "not";
          return (
            <Card key={s.id}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-accent">{lang === "ta" ? s.tagTa : s.tagEn}</span>
                {st !== "not" && <span className={`badge ${STATUS_BADGE[st]}`}>{opt(st)}</span>}
              </div>
              <h3 className={`headline text-2xl font-bold mb-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
                {lang === "ta" ? s.nameTa : s.nameEn}
              </h3>

              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="kicker mb-1">{t("benefit")}</p>
                  <p className={lang === "ta" ? "ta-fallback" : ""}>{lang === "ta" ? s.benefitTa : s.benefitEn}</p>
                </div>
                <div>
                  <p className="kicker mb-1">⏰ {t("deadline")}</p>
                  <p className={`font-semibold ${lang === "ta" ? "ta-fallback" : ""}`}>{lang === "ta" ? s.deadlineTa : s.deadlineEn}</p>
                </div>
                <div>
                  <p className="kicker mb-1">{t("eligibility")}</p>
                  <ul className={`list-disc pl-5 space-y-1 ${lang === "ta" ? "ta-fallback" : ""}`}>
                    {(lang === "ta" ? s.eligibilityTa : s.eligibilityEn).map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="kicker mb-1">{t("documents")}</p>
                  <ul className={`list-disc pl-5 space-y-1 ${lang === "ta" ? "ta-fallback" : ""}`}>
                    {(lang === "ta" ? s.docsTa : s.docsEn).map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </div>
                <div className="md:col-span-2">
                  <p className="kicker mb-1">{t("how")}</p>
                  <ol className={`list-decimal pl-5 space-y-1 ${lang === "ta" ? "ta-fallback" : ""}`}>
                    {(lang === "ta" ? s.howTa : s.howEn).map((x, i) => <li key={i}>{x}</li>)}
                  </ol>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--color-line)] no-print">
                <p className="kicker mb-2">{t("my_status")}</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("my_status")}>
                  {(["not", "progress", "done", "na"] as SchemeStatus[]).map((k) => (
                    <button
                      key={k}
                      role="radio"
                      aria-checked={st === k}
                      onClick={() => setSchemeStatus(s.id, k)}
                      className={`btn !min-h-0 !py-1.5 !px-3 text-sm ${st === k ? "btn-primary" : "btn-ghost"}`}
                    >
                      {opt(k)}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs text-[var(--color-ink-faint)]">{lang === "ta" ? "ஆதாரம்: " : "Source: "}{s.source}</p>
            </Card>
          );
        })}
      </div>

      <BackHome />
    </div>
  );
}
