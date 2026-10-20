"use client";

import React, { useMemo, useState } from "react";
import { useLang } from "../../lib/i18n";
import { useDB } from "../../lib/db";
import { DOCTOR_CROPS, FERT_DOSES, PLAYBOOK, SEED_RATES, SHC_PARAMS, IRRIGATION_STAGES } from "../../lib/data";
import { PageHead, Card, SectionTitle, FieldRow, Empty, BackHome } from "../../components/ui";

const TABS: { id: "fert" | "seed" | "soil" | "play"; en: string; ta: string }[] = [
  { id: "fert", en: "🧮 Fertilizer calculator", ta: "🧮 உரக் கணக்கு" },
  { id: "seed", en: "🌱 Seed calculator", ta: "🌱 விதைக் கணக்கு" },
  { id: "soil", en: "🧪 Soil test", ta: "🧪 மண் பரிசோதனை" },
  { id: "play", en: "📖 Crop playbook", ta: "📖 பயிர் வழிகாட்டி" },
];

/* Fertilizer maths (standard nutrient contents):
   DAP 18-46-0 · Urea 46% N · MOP 60% K2O.
   Meet phosphorus first with DAP, fill the remaining nitrogen with urea,
   meet potash with MOP. */
function fertPlan(n: number, p: number, k: number) {
  const dap = p / 0.46;
  const nFromDap = dap * 0.18;
  const urea = Math.max(0, (n - nFromDap) / 0.46);
  const mop = k / 0.6;
  return { dap, urea, mop };
}

function fmt(n: number, digits = 1): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

export default function FieldGuidePage() {
  const { lang } = useLang();
  const { db, setCheck } = useDB();
  const [crop, setCrop] = useState("paddy");
  const [area, setArea] = useState("");
  const [tab, setTab] = useState<"fert" | "seed" | "soil" | "play">("fert");
  const [seedId, setSeedId] = useState(SEED_RATES[0].id);
  const [seedArea, setSeedArea] = useState("");
  const [shc, setShc] = useState<Record<string, string>>({});

  const seed = SEED_RATES.find((s) => s.id === seedId)!;
  const seedAcres = parseFloat(seedArea);
  const seedTotal = !seedAcres || seedAcres <= 0 ? null : seedAcres * seed.perAcre;
  const fmtQty = (n: number) => seed.perAcre < 5
    ? n.toLocaleString("en-IN", { maximumFractionDigits: 1 })
    : Math.round(n).toLocaleString("en-IN");

  const dose = FERT_DOSES.find((d) => d.cropId === crop)!;
  const cropObj = DOCTOR_CROPS.find((c) => c.id === crop)!;

  const calc = useMemo(() => {
    const qty = parseFloat(area);
    if (!qty || qty <= 0) return null;
    const acres = dose.perHa ? qty : 0;
    // per-ha doses × acres; per-plant doses (g) × plant count → kg
    const n = dose.perHa ? dose.n * qty * 0.404686 : (dose.n * qty) / 1000;
    const p = dose.perHa ? dose.p * qty * 0.404686 : (dose.p * qty) / 1000;
    const k = dose.perHa ? dose.k * qty * 0.404686 : (dose.k * qty) / 1000;
    const plan = fertPlan(n, p, k);
    return { qty, acres, n, p, k, plan };
  }, [area, dose]);

  return (
    <div>
      <PageHead
        kicker={lang === "ta" ? "வயல் வழிகாட்டி" : "Field guide"}
        title={lang === "ta" ? "உரம் எவ்வளவு? கணக்கு இதோ." : "How much fertilizer? Here is the maths."}
        sub={lang === "ta"
          ? "வேளாண் பல்கலைக்கழகப் பரிந்துரையிலிருந்து உங்கள் நிலத்திற்கான உரக் கணக்கு. கடைக்காரர் சொல்வதை வாங்குவதற்கு முன் இதைப் பாருங்கள்."
          : "Your land's fertilizer maths from the agricultural university's blanket recommendation. Check this before you buy whatever the dealer suggests."}
      />

      <div className="flex flex-wrap gap-2 mb-6 no-print" role="tablist">
        {TABS.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={`btn ${tab === x.id ? "btn-primary" : "btn-ghost"}`}
          >
            {lang === "ta" ? x.ta : x.en}
          </button>
        ))}
      </div>

      {tab === "play" ? (
        <div>
          <section className="mb-6">
            <h2 className="headline text-lg font-bold mb-3">{lang === "ta" ? "எந்தப் பயிர்?" : "Which crop?"}</h2>
            <div className="flex flex-wrap gap-2">
              {FERT_DOSES.map((d) => {
                const c = DOCTOR_CROPS.find((x) => x.id === d.cropId)!;
                return (
                  <button
                    key={d.cropId}
                    onClick={() => setCrop(d.cropId)}
                    aria-pressed={crop === d.cropId}
                    className={`btn ${crop === d.cropId ? "btn-primary" : "btn-ghost"}`}
                  >
                    {lang === "ta" ? c.nameTa : c.nameEn}
                  </button>
                );
              })}
            </div>
          </section>
          {(IRRIGATION_STAGES[crop] ?? []).length > 0 && (
            <Card className="mb-6 !border-[var(--color-sky)]">
              <SectionTitle>💧 {lang === "ta" ? "நீர் முக்கியமான பருவங்கள்" : "Water when it counts"}</SectionTitle>
              <p className={`text-sm text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
                {lang === "ta"
                  ? "பயிருக்கு ஒவ்வொரு நாளும் சமமான நீர் தேவையில்லை — இந்தப் பருவங்களில் தண்ணீர்ப் பற்றாக்குறை மகசூலை நேரடியாகக் குறைக்கும்."
                  : "Crops don't need equal water every day — stress at these stages cuts yield directly."}
              </p>
              <ol className={`space-y-2.5 ${lang === "ta" ? "ta-fallback" : ""}`}>
                {IRRIGATION_STAGES[crop].map((w, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="badge badge-green shrink-0 mt-0.5">{i + 1}</span>
                    <span>
                      <strong>{lang === "ta" ? w.stageTa : w.stageEn}</strong>{" "}
                      <span className="text-sm text-[var(--color-ink-soft)]">({lang === "ta" ? w.whenTa : w.whenEn})</span>
                      <span className="block text-sm text-[var(--color-ink-soft)]">{lang === "ta" ? w.whyTa : w.whyEn}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
          <div className="space-y-3">
            {PLAYBOOK[crop].map((st, i) => (
              <Card key={i}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="badge badge-accent shrink-0">{i + 1}</span>
                  <h3 className={`headline text-xl font-bold ${lang === "ta" ? "ta-fallback" : ""}`}>
                    {lang === "ta" ? st.stageTa : st.stageEn}
                  </h3>
                </div>
                <p className={`text-sm text-[var(--color-ink-soft)] mb-2 ml-9 ${lang === "ta" ? "ta-fallback" : ""}`}>
                  {lang === "ta" ? st.whenTa : st.whenEn}
                </p>
                <ul className={`list-disc pl-5 ml-9 space-y-1.5 ${lang === "ta" ? "ta-fallback" : ""}`}>
                  {(lang === "ta" ? st.tasksTa : st.tasksEn).map((tk, j) => <li key={j}>{tk}</li>)}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      ) : tab === "seed" ? (
        <>
          <section className="mb-6">
            <h2 className="headline text-lg font-bold mb-3">{lang === "ta" ? "என்ன விதைக்கப் போகிறீர்கள்?" : "What are you sowing?"}</h2>
            <div className="flex flex-wrap gap-2">
              {SEED_RATES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeedId(s.id)}
                  aria-pressed={seedId === s.id}
                  className={`btn ${seedId === s.id ? "btn-primary" : "btn-ghost"}`}
                >
                  {lang === "ta" ? s.nameTa : s.nameEn}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <FieldRow label={lang === "ta" ? "எத்தனை ஏக்கர்?" : "How many acres?"}>
              <input
                className="field max-w-xs"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={seedArea}
                onChange={(e) => setSeedArea(e.target.value)}
                placeholder="2.5"
              />
            </FieldRow>
          </section>

          {seedTotal != null ? (
            <div className="space-y-4">
              <Card>
                <SectionTitle>🌱 {lang === "ta" ? "வாங்க வேண்டிய விதை" : "Seed to buy"}</SectionTitle>
                <p className="headline text-3xl font-bold text-[var(--color-accent-deep)]">
                  {fmtQty(seedTotal)}{" "}
                  <span className={`text-lg font-normal text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>
                    {lang === "ta" ? seed.unitTa : seed.unitEn}
                  </span>
                </p>
                <p className={`mt-2 text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>
                  {lang === "ta"
                    ? `${fmtQty(seedAcres)} ஏக்கர் × ${fmtQty(seed.perAcre)} ${seed.unitTa}/ஏக்கர் (${seed.nameTa})`
                    : `${fmtQty(seedAcres)} acres × ${fmtQty(seed.perAcre)} ${seed.unitEn}/acre (${seed.nameEn})`}
                </p>
                <div className="mt-3 border-t border-[var(--color-line)] pt-3">
                  <p className={`text-sm ${lang === "ta" ? "ta-fallback" : ""}`}>
                    <strong>{lang === "ta" ? "முளைப்பு காப்பு (+10%): " : "Germination buffer (+10%): "}</strong>
                    {fmtQty(seedTotal * 1.1)} {lang === "ta" ? seed.unitTa : seed.unitEn}
                  </p>
                </div>
              </Card>
              <Card className="!border-[var(--color-accent)]">
                <p className={lang === "ta" ? "ta-fallback" : ""}>{lang === "ta" ? seed.noteTa : seed.noteEn}</p>
              </Card>
            </div>
          ) : (
            <Empty>
              {lang === "ta"
                ? "மேலே பரப்பளவை உள்ளிடுங்கள் — வாங்க வேண்டிய விதையின் அளவு இங்கே வரும்."
                : "Enter the area above — the seed you need to buy will appear here."}
            </Empty>
          )}
        </>
      ) : tab === "soil" ? (
        <>
          <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "உங்கள் மண் ஆரோக்கிய அட்டையிலுள்ள (Soil Health Card) எண்களை இங்கே உள்ளிடுங்கள் — ஒவ்வொன்றின் பொருளையும், என்ன செய்ய வேண்டும் என்பதையும் பயிர் சாதாரண வார்த்தைகளில் சொல்லும்."
              : "Type in the numbers from your Soil Health Card — Payir reads each one back in plain words and says what to do about it."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {SHC_PARAMS.map((p) => (
              <FieldRow key={p.key} label={`${lang === "ta" ? p.ta : p.en}${p.unit ? ` (${p.unit})` : ""}`}>
                <input
                  className="field"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={shc[p.key] ?? ""}
                  onChange={(e) => setShc((s) => ({ ...s, [p.key]: e.target.value }))}
                  placeholder="—"
                  aria-label={lang === "ta" ? p.ta : p.en}
                />
              </FieldRow>
            ))}
          </div>
          {(() => {
            const results = SHC_PARAMS.map((p) => {
              const v = parseFloat(shc[p.key] ?? "");
              return v != null && !Number.isNaN(v) ? { p, v, r: p.interpret(v) } : null;
            }).filter(Boolean) as { p: (typeof SHC_PARAMS)[number]; v: number; r: ReturnType<(typeof SHC_PARAMS)[number]["interpret"]> }[];
            if (results.length === 0)
              return (
                <Empty>
                  {lang === "ta"
                    ? "மேலே ஏதேனும் ஒரு எண்ணை உள்ளிடுங்கள் — விளக்கம் இங்கே வரும்."
                    : "Enter any number above — its reading will appear here."}
                </Empty>
              );
            const bad = results.filter((x) => x.r.level === "bad").length;
            return (
              <div className="space-y-3" aria-live="polite">
                {bad > 0 && (
                  <p className={`text-sm font-semibold text-[var(--color-coral)] ${lang === "ta" ? "ta-fallback" : ""}`}>
                    {lang === "ta"
                      ? `${bad} அளவுரு(கள்) உடனடி கவனம் தேவை — கீழே பார்க்கவும்.`
                      : `${bad} parameter${bad > 1 ? "s need" : " needs"} attention now — see below.`}
                  </p>
                )}
                {results.map(({ p, v, r }) => (
                  <Card key={p.key} className={r.level === "bad" ? "!border-[var(--color-coral)]" : r.level === "warn" ? "!border-[var(--color-amber)]" : ""}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="font-bold">{lang === "ta" ? p.ta : p.en} <span className="font-normal text-[var(--color-ink-soft)]">· {v}{p.unit ? ` ${p.unit}` : ""}</span></p>
                      <span className={`badge shrink-0 ${r.level === "bad" ? "badge-coral" : r.level === "warn" ? "badge-amber" : "badge-green"}`}>
                        {lang === "ta" ? r.ratingTa : r.ratingEn}
                      </span>
                    </div>
                    <p className={`text-sm text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>
                      {lang === "ta" ? r.adviceTa : r.adviceEn}
                    </p>
                  </Card>
                ))}
                <p className={`text-xs text-[var(--color-ink-faint)] ${lang === "ta" ? "ta-fallback" : ""}`}>
                  {lang === "ta"
                    ? "அடிப்படை: தரநிலை மண் ஆரோக்கிய அட்டை மதிப்பீட்டு அளவுகோல். உங்கள் அட்டையிலுள்ள ஆய்வகக் குறிப்பே இறுதி."
                    : "Based on the standard Soil Health Card rating bands. Your card's own lab remark has the final word."}
                </p>
              </div>
            );
          })()}
        </>
      ) : (
      <>

      <section className="mb-6">
        <h2 className="headline text-lg font-bold mb-3">{lang === "ta" ? "எந்தப் பயிர்?" : "Which crop?"}</h2>
        <div className="flex flex-wrap gap-2">
          {FERT_DOSES.map((d) => {
            const c = DOCTOR_CROPS.find((x) => x.id === d.cropId)!;
            return (
              <button
                key={d.cropId}
                onClick={() => setCrop(d.cropId)}
                aria-pressed={crop === d.cropId}
                className={`btn ${crop === d.cropId ? "btn-primary" : "btn-ghost"}`}
              >
                {lang === "ta" ? c.nameTa : c.nameEn}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-6">
        <FieldRow label={dose.perHa
          ? (lang === "ta" ? "எத்தனை ஏக்கர்?" : "How many acres?")
          : (lang === "ta" ? `எத்தனை ${lang === "ta" ? cropObj.nameTa : cropObj.nameEn} ${crop === "coconut" ? "மரங்கள்" : "செடிகள்"}?` : `How many ${crop === "coconut" ? "palms" : "plants"}?`)}>
          <input
            className="field max-w-xs"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={dose.perHa ? "2.5" : "100"}
          />
        </FieldRow>
      </section>

      {calc ? (
        <div className="space-y-4">
          <Card>
            <SectionTitle>
              🧮 {lang === "ta" ? "வாங்க வேண்டிய உரம்" : "Fertilizer to buy"}
            </SectionTitle>
            <div className="overflow-x-auto">
              <table className={`w-full text-left text-[0.95rem] ${lang === "ta" ? "ta-fallback" : ""}`}>
                <thead>
                  <tr className="border-b border-[var(--color-line)]">
                    <th className="py-2 pr-3 font-semibold">{lang === "ta" ? "உரம்" : "Fertilizer"}</th>
                    <th className="py-2 pr-3 font-semibold text-right">{lang === "ta" ? "மொத்த கிலோ" : "Total kg"}</th>
                    <th className="py-2 font-semibold text-right">{lang === "ta" ? "மூட்டை" : "Bags"}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--color-line)]">
                    <td className="py-2 pr-3">DAP</td>
                    <td className="py-2 pr-3 text-right font-semibold">{fmt(calc.plan.dap)}</td>
                    <td className="py-2 text-right text-[var(--color-ink-soft)]">{fmt(calc.plan.dap / 50)} × 50 kg</td>
                  </tr>
                  <tr className="border-b border-[var(--color-line)]">
                    <td className="py-2 pr-3">{lang === "ta" ? "யூரியா" : "Urea"}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{fmt(calc.plan.urea)}</td>
                    <td className="py-2 text-right text-[var(--color-ink-soft)]">{fmt(calc.plan.urea / 45)} × 45 kg</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">MOP</td>
                    <td className="py-2 pr-3 text-right font-semibold">{fmt(calc.plan.mop)}</td>
                    <td className="py-2 text-right text-[var(--color-ink-soft)]">{fmt(calc.plan.mop / 50)} × 50 kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={`mt-3 text-sm text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>
              {lang === "ta"
                ? `பரிந்துரை: ${dose.perHa ? `ஏக்கருக்கு ${dose.n}:${dose.p}:${dose.k} கிலோ (N:P:K)` : `செடிக்கு ${dose.n}:${dose.p}:${dose.k} கிராம் (N:P:K)`} — மொத்தம் ${fmt(calc.n, 0)}:${fmt(calc.p, 0)}:${fmt(calc.k, 0)} கிலோ சத்து.`
                : `Recommendation: ${dose.perHa ? `${dose.n}:${dose.p}:${dose.k} kg/ha (N:P:K)` : `${dose.n}:${dose.p}:${dose.k} g/plant (N:P:K)`} — ${fmt(calc.n, 0)}:${fmt(calc.p, 0)}:${fmt(calc.k, 0)} kg nutrients total.`}
            </p>
          </Card>

          <Card>
            <SectionTitle>📆 {lang === "ta" ? "எப்போது இடுவது" : "When to apply"}</SectionTitle>
            <ol className={`list-decimal pl-5 space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
              {(lang === "ta" ? dose.splitsTa : dose.splitsEn).map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </Card>

          <Card className="!border-[var(--color-accent)]">
            <p className={lang === "ta" ? "ta-fallback" : ""}>
              <strong>{lang === "ta" ? "குறிப்பு: " : "Note: "}</strong>
              {lang === "ta" ? dose.noteTa : dose.noteEn}
            </p>
            <p className={`mt-2 text-sm text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>
              {lang === "ta"
                ? "இது பொதுப் பரிந்துரை. உங்கள் மண் பரிசோதனை முடிவே இறுதி — வட்டார வேளாண் அலுவலகத்தில் இலவச மண் பரிசோதனை கிடைக்கும்."
                : "This is the blanket recommendation. Your soil test has the final word — free soil testing is available at your block agriculture office."}
            </p>
          </Card>
        </div>
      ) : (
        <Empty>
          {lang === "ta"
            ? "மேலே பரப்பளவை உள்ளிடுங்கள் — வாங்க வேண்டிய மூட்டைகளின் எண்ணிக்கை இங்கே வரும்."
            : "Enter the area above — the bags you need to buy will appear here."}
        </Empty>
      )}

      </>
      )}

      {/* Pre-harvest readiness — the two weeks before harvest decide the
          price more than the whole season's luck: a booked combine, a dry
          yard, and dry grain are worth more than a last spray. */}
      <section className="mt-10">
        <SectionTitle>🌾 {lang === "ta" ? "அறுவடைக்கு முன் — தயாரா?" : "Before harvest — are you ready?"}</SectionTitle>
        <Card>
          <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "அறுவடைக்கு 2 வாரம் முன் இவற்றை முடியுங்கள். கடைசி நேர அவசரம் விலையைக் குறைக்கும் — ஈரத் தானியத்துக்கு வியாபாரி குறைத்தே கொடுப்பார்."
              : "Finish these 2 weeks before harvest. Last-minute rushing costs you the price — a trader always pays less for wet grain."}
          </p>
          {(() => {
            const ITEMS: { id: string; en: string; ta: string }[] = [
              { id: "combine", en: "Combine / harvester booked — date confirmed in writing", ta: "அறுவடை இயந்திரம் முன்பதிவு — தேதி உறுதி செய்யப்பட்டது" },
              { id: "tarpaulin", en: "Tarpaulin and a dry, clean drying yard ready", ta: "தார்ப்பாய் மற்றும் உலர்ந்த சுத்தமான உலர்த்தும் இடம் தயார்" },
              { id: "bags", en: "Gunny bags counted; storage space cleared", ta: "சாக்குகள் எண்ணப்பட்டன; சேமிப்பு இடம் தயார்" },
              { id: "labour", en: "Labour confirmed for harvest day", ta: "அறுவடை நாளுக்கு ஆட்கள் உறுதி" },
              { id: "moisture", en: "Know the target moisture — paddy must be ≤ 17% for government procurement", ta: "இலக்கு ஈரப்பதம் தெரியும் — அரசு கொள்முதலுக்கு நெல் 17%-க்குள் இருக்க வேண்டும்" },
              { id: "dpc", en: "If selling to the government: registered at the Direct Purchase Centre", ta: "அரசுக்கு விற்பதானால்: நேரடி கொள்முதல் நிலையத்தில் பதிவு" },
            ];
            const done = ITEMS.filter((x) => db.checks[`harvest:${x.id}`]).length;
            return (
              <>
                <p className={`text-sm font-semibold mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
                  {lang === "ta" ? `${done}/${ITEMS.length} தயார்` : `${done}/${ITEMS.length} ready`}
                </p>
                <ul className="space-y-2">
                  {ITEMS.map((x) => {
                    const on = !!db.checks[`harvest:${x.id}`];
                    return (
                      <li key={x.id}>
                        <button
                          onClick={() => setCheck(`harvest:${x.id}`, !on)}
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
      </section>

      {/* Post-harvest handling — storage losses (moisture, pests, rodents) eat
          6–10% of India's food grains every year, and ungraded produce sells
          cheap. Six plain rules, persisted like the pre-harvest checklist. */}
      <section className="mt-10">
        <SectionTitle>🏚️ {lang === "ta" ? "அறுவடைக்குப் பின் — இழக்க வேண்டாம்" : "After harvest — don't lose it now"}</SectionTitle>
        <Card>
          <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "இந்தியாவின் தானிய இழப்பில் பெரும்பகுதி வயலில் அல்ல, களத்தில் நடக்கிறது. ஈரப்பதம், பூச்சி, எலி — மூன்றும் கண்காணிப்பில் இருந்தால் இழப்பு தவிர்க்கலாம்."
              : "India loses a big share of its grain not in the field but after harvest — to moisture, pests and rodents. Watch all three and the loss is avoidable."}
          </p>
          {(() => {
            const ITEMS: { id: string; en: string; ta: string }[] = [
              { id: "moisture", en: "Dry to safe storage moisture (paddy ~13%, maize ~14%) — grain should crack, not bend, between the teeth", ta: "பாதுகாப்பான ஈரப்பதம் வரை உலர்த்தவும் (நெல் ~13%, மக்காச்சோளம் ~14%) — தானியம் பற்களுக்கிடையில் வளையாமல் நொறுங்க வேண்டும்" },
              { id: "pallets", en: "Bags on pallets or wooden planks, never on bare floor; keep a hand's width from the walls", ta: "சாக்குகளை மரப்பலகை மேல் வைக்கவும், தரையில் நேரடியாக வேண்டாம்; சுவரிலிருந்து இடைவெளி விடவும்" },
              { id: "neem", en: "A layer of dried neem leaves (or the approved fumigant) in each stack against storage pests", ta: "சேமிப்பு பூச்சிகளுக்கு எதிராக ஒவ்வொரு அடுக்கிலும் உலர்ந்த வேப்பிலை (அல்லது அனுமதிக்கப்பட்ட புகை மருந்து)" },
              { id: "nomix", en: "Never bag damp or damaged grain with the dry lot — one bad bag spoils the whole stack", ta: "ஈரமான/சேதமான தானியத்தை உலர்ந்ததுடன் கலக்க வேண்டாம் — ஒரு கெட்ட சாக்கு முழு அடுக்கையும் கெடுக்கும்" },
              { id: "grade", en: "Clean and grade before you sell — graded lots fetch better rates at mandis and on e-NAM assaying", ta: "விற்கும் முன் சுத்தம் செய்து தரம் பிரிக்கவும் — தரம் பிரித்த சரக்கு மண்டியிலும் e-NAM-இலும் அதிக விலை பெறும்" },
              { id: "fifo", en: "First in, first out — sell the oldest stock first; check the stack every fortnight for heat or musty smell", ta: "முதலில் வந்ததை முதலில் விற்கவும்; இரு வாரத்திற்கு ஒருமுறை வெப்பம்/புழுங்கிய வாடை உள்ளதா எனச் சரிபார்க்கவும்" },
            ];
            const done = ITEMS.filter((x) => db.checks[`post:${x.id}`]).length;
            return (
              <>
                <p className={`text-sm font-semibold mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
                  {lang === "ta" ? `${done}/${ITEMS.length} தயார்` : `${done}/${ITEMS.length} done`}
                </p>
                <ul className="space-y-2">
                  {ITEMS.map((x) => {
                    const on = !!db.checks[`post:${x.id}`];
                    return (
                      <li key={x.id}>
                        <button
                          onClick={() => setCheck(`post:${x.id}`, !on)}
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
      </section>

      <BackHome />
    </div>
  );
}
