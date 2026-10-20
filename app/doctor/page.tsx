"use client";

import React, { useMemo, useState } from "react";
import { useLang } from "../../lib/i18n";
import { useDB } from "../../lib/db";
import { DOCTOR_CROPS, SYMPTOMS, DIAGNOSES, TREAT_RULES, DoctorDiag } from "../../lib/data";
import { PageHead, Card, SectionTitle, Empty, BackHome } from "../../components/ui";

type Tab = "organic" | "chemical" | "prevent";

const URGENCY_BADGE: Record<DoctorDiag["urgency"], string> = {
  watch: "badge-amber",
  act: "badge-accent",
  urgent: "badge-coral",
};

function daysUntilLocal(dateStr: string): number {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const target = new Date(y, mo - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function score(d: DoctorDiag, crop: string, part: string, symptoms: string[]): number {
  if (d.crop !== crop) return -1;
  if (part && !d.parts.includes(part)) return -1;
  if (symptoms.length === 0) return 0;
  const hits = d.symptoms.filter((s) => symptoms.includes(s)).length;
  if (hits === 0) return -1;
  return hits / d.symptoms.length + hits * 0.1;
}

export default function DoctorPage() {
  const { t, lang } = useLang();
  const { logDiagnosis, setDiagnosisStatus, setDiagnosisRecheck, setDiagnosisOutcome, removeDiagnosis, setAgriOfficer, setCheck, db } = useDB();
  const officer = db.agriOfficer;
  const [crop, setCrop] = useState("");
  const [part, setPart] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [tab, setTab] = useState<Record<string, Tab>>({});
  const [printDiag, setPrintDiag] = useState<DoctorDiag | null>(null);
  const [query, setQuery] = useState("");
  // Research (thebetterindia/Plantix, Oct 19): farmers cannot find pest info by
  // textbook names — so the finder also accepts free text in either language,
  // matching symptom wording directly instead of requiring chip taps.
  const q = query.trim().toLowerCase();
  const visibleSymptoms = useMemo(() => {
    if (!q) return SYMPTOMS;
    return SYMPTOMS.filter((s) =>
      s.en.toLowerCase().includes(q) ||
      s.ta.includes(query.trim()) ||
      DIAGNOSES.some((d) => d.crop === crop &&
        (d.nameEn.toLowerCase().includes(q) || d.nameTa.includes(query.trim())) &&
        d.symptoms.includes(s.id))
    );
  }, [q, query, crop]);

  const cropObj = DOCTOR_CROPS.find((c) => c.id === crop);

  const results = useMemo(() => {
    if (!crop) return [];
    return DIAGNOSES.map((d) => ({ d, s: score(d, crop, part, symptoms) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);
  }, [crop, part, symptoms]);

  const toggleSymptom = (id: string) =>
    setSymptoms((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const asked = crop !== "";
  const refined = part !== "" || symptoms.length > 0;
  const cropDiags = useMemo(() => DIAGNOSES.filter((d) => d.crop === crop), [crop]);

  // Relaxed fallback: symptom matches that ignored the plant-part filter.
  // Used only when the strict search finds nothing, so a picky part choice
  // never dead-ends into "no match".
  const relaxed = useMemo(() => {
    if (!crop || symptoms.length === 0) return [];
    return DIAGNOSES.map((d) => ({ d, s: score(d, crop, "", symptoms) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);
  }, [crop, symptoms]);

  // Shared card renderer for both strict and relaxed (part-filter-free) results.
  const renderResult = (d: DoctorDiag, s: number) => {
    const activeTab: Tab = tab[d.id] ?? "organic";
    const setT = (x: Tab) => setTab((p) => ({ ...p, [d.id]: x }));
    return (
      <Card key={d.id}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`badge ${URGENCY_BADGE[d.urgency]}`}>{t(`urgency_${d.urgency}`)}</span>
          <span className="badge">{Math.round((s / 1.3) * 100)}% {t("match_score")}</span>
        </div>
        <h3 className={`headline text-2xl font-bold mb-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {lang === "ta" ? d.nameTa : d.nameEn}
        </h3>
        <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {lang === "ta" ? d.aboutTa : d.aboutEn}
        </p>
        {symptoms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3" aria-label={lang === "ta" ? "பொருந்திய அறிகுறிகள்" : "Matched symptoms"}>
            {d.symptoms.filter((sid) => symptoms.includes(sid)).map((sid) => {
              const sObj = SYMPTOMS.find((x) => x.id === sid);
              return sObj ? <span key={sid} className="badge badge-green">✓ {lang === "ta" ? sObj.ta : sObj.en}</span> : null;
            })}
          </div>
        )}
        {TREAT_RULES[d.id] && (
          <p className={`mb-3 text-[0.95rem] ${lang === "ta" ? "ta-fallback" : ""}`}>
            <span className="badge badge-green mr-2">🎯 {lang === "ta" ? "எப்போது மருந்து" : "Spray only if"}</span>
            <strong>{lang === "ta" ? TREAT_RULES[d.id].ta : TREAT_RULES[d.id].en}</strong>
          </p>
        )}
        <div className="flex gap-2 mb-3 no-print" role="tablist">
          {(["organic", "chemical", "prevent"] as Tab[]).map((x) => (
            <button
              key={x}
              role="tab"
              aria-selected={activeTab === x}
              onClick={() => setT(x)}
              className={`btn !min-h-0 !py-1.5 !px-3 text-sm ${activeTab === x ? "btn-primary" : "btn-ghost"}`}
            >
              {t(`tab_${x}`)}
            </button>
          ))}
        </div>
        <ul className={`list-disc pl-5 space-y-1.5 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {(activeTab === "organic" ? (lang === "ta" ? d.organicTa : d.organicEn)
            : activeTab === "chemical" ? (lang === "ta" ? d.chemicalTa : d.chemicalEn)
            : (lang === "ta" ? d.preventTa : d.preventEn)
          ).map((line, i) => <li key={i}>{line}</li>)}
        </ul>
        <button
          className="btn btn-ghost !min-h-0 !py-1 !px-3 text-sm mt-4 no-print"
          onClick={() => logDiagnosis(crop, d.id)}
        >
          {lang === "ta" ? "இதை என் குறிப்பில் பதிவு செய்" : "Save to my notes"}
        </button>
        <button
          className="btn btn-ghost !min-h-0 !py-1 !px-3 text-sm mt-4 ml-2 no-print"
          onClick={() => { setPrintDiag(d); setTimeout(() => window.print(), 60); }}
        >
          🖨️ {lang === "ta" ? "அலுவலரிடம் காட்ட அச்சிடு" : "Print for the officer"}
        </button>
      </Card>
    );
  };

  return (
    <div>
      <PageHead kicker={t("doctor_kicker")} title={t("doctor_title")} sub={t("doctor_sub")} />

      {/* Q1 */}
      <section className="mb-6">
        <h2 className="headline text-lg font-bold mb-3">{t("q_crop")}</h2>
        <div className="flex flex-wrap gap-2">
          {DOCTOR_CROPS.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCrop(c.id); setPart(""); }}
              className={`btn ${crop === c.id ? "btn-primary" : "btn-ghost"}`}
              aria-pressed={crop === c.id}
            >
              {lang === "ta" ? c.nameTa : c.nameEn}
            </button>
          ))}
        </div>
      </section>

      {/* Q2 */}
      {cropObj && (
        <section className="mb-6">
          <h2 className="headline text-lg font-bold mb-3">
            {t("q_part")}
            {part !== "" && (
              <button
                className="btn btn-ghost !min-h-0 !py-1 !px-2 text-xs ml-3 no-print"
                onClick={() => setPart("")}
              >
                {lang === "ta" ? "அழி" : "Clear"}
              </button>
            )}
          </h2>
          <div className="flex flex-wrap gap-2">
            {cropObj.parts.map((p) => (
              <button
                key={p.id}
                onClick={() => setPart(p.id)}
                className={`btn ${part === p.id ? "btn-primary" : "btn-ghost"}`}
                aria-pressed={part === p.id}
              >
                {lang === "ta" ? p.ta : p.en}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Q3 */}
      {cropObj && (
        <section className="mb-8">
          <h2 className="headline text-lg font-bold mb-3">{t("q_symptoms")}</h2>
          <div className="mb-3 no-print">
            <label htmlFor="symptom-search" className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">
              {lang === "ta" ? "நீங்கள் காண்பதை எழுதுங்கள் — தமிழ் அல்லது ஆங்கிலம்" : "Type what you see — Tamil or English"}
            </label>
            <div className="flex gap-2">
              <input
                id="symptom-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "ta" ? "எ.கா: மஞ்சள் இலை, துளை, வாடல்…" : "e.g. yellow leaf, holes, wilting…"}
                className="field flex-1"
                aria-label={lang === "ta" ? "அறிகுறி தேடல்" : "Symptom search"}
              />
              {q && (
                <button className="btn btn-ghost" onClick={() => setQuery("")}>
                  {lang === "ta" ? "அழி" : "Clear"}
                </button>
              )}
            </div>
            {q && (
              <p className={`text-sm mt-2 text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`} role="status">
                {lang === "ta"
                  ? `${visibleSymptoms.length} அறிகுறி${visibleSymptoms.length === 1 ? "" : "கள்"} பொருந்தின`
                  : `${visibleSymptoms.length} symptom${visibleSymptoms.length === 1 ? "" : "s"} matched`}
              </p>
            )}
          </div>
          {visibleSymptoms.length === 0 && (
            <Empty>
              {lang === "ta"
                ? "அந்த வார்த்தைக்கு அறிகுறி கிடைக்கவில்லை. வேறு வார்த்தையில் முயலுங்கள், அல்லது கீழே உள்ளவற்றிலிருந்து தேர்வு செய்யுங்கள்."
                : "No symptom matches that word. Try another word, or pick from the full list below."}
            </Empty>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {visibleSymptoms.map((s) => {
              const on = symptoms.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  aria-pressed={on}
                  className={`text-left p-3 border ${on ? "border-[var(--color-accent)] bg-[var(--color-accent-wash)]" : "border-[var(--color-line)] bg-[var(--color-card)]"} font-semibold`}
                >
                  <span className="mr-2">{on ? "☑" : "☐"}</span>
                  {lang === "ta" ? s.ta : s.en}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Results */}
      {asked && (
        <section aria-live="polite">
          <SectionTitle>
            {refined
              ? (lang === "ta" ? "கண்டறிதல் முடிவுகள்" : "Likely causes")
              : (lang === "ta" ? "இந்தப் பயிரின் நூலகம்" : "This crop's library")}
            {refined && results.length > 0 && <span className="text-base font-normal text-[var(--color-ink-soft)]"> · {results.length}</span>}
          </SectionTitle>
          {!refined ? (
            <Card>
              <p className={`text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
                {lang === "ta"
                  ? `பகுதியையும் அறிகுறிகளையும் தேர்ந்தெடுங்கள் — ${cropDiags.length} நோய்/பூச்சிகளில் பொருத்தமானதைக் கண்டறிவோம். அல்லது கீழே உலாவுங்கள்:`
                  : `Pick the plant part and symptoms above — we'll narrow it down from ${cropDiags.length} pests and diseases. Or browse below:`}
              </p>
              <ul className="space-y-1.5">
                {cropDiags.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 border-b border-[var(--color-line)] pb-1.5">
                    <span className="font-semibold">{lang === "ta" ? d.nameTa : d.nameEn}</span>
                    <span className={`badge ${URGENCY_BADGE[d.urgency]}`}>{t(`urgency_${d.urgency}`)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : results.length === 0 && relaxed.length === 0 ? (
            <Empty>{t("no_match")}</Empty>
          ) : (
            <div className="space-y-4">
              {results.length === 0 && relaxed.length > 0 && (
                <p className={`text-[var(--color-ink-soft)] border border-[var(--color-amber)] p-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
                  {lang === "ta"
                    ? "நீங்கள் தேர்ந்த பகுதிக்கு எதுவும் பொருந்தவில்லை — ஆனால் அறிகுறிகள் இவற்றுடன் பொருந்துகின்றன. இவற்றையும் பாருங்கள், அல்லது மேலே பகுதி தேர்வை அழிக்கவும்."
                    : "Nothing fit the plant part you picked — but these match your symptoms. Check them anyway, or clear the part filter above."}
                </p>
              )}
              {(results.length > 0 ? results : relaxed).map(({ d, s }) => renderResult(d, s))}
            </div>
          )}
        </section>
      )}

      {/* How to count — the 5-minute field check behind every threshold */}
      <section className="mt-8">
        <SectionTitle>🔢 {lang === "ta" ? "எண்ணுவது எப்படி" : "How to count before you spray"}</SectionTitle>
        <Card>
          <ol className={`list-decimal pl-5 space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {(lang === "ta" ? [
              "வயலில் Z வடிவில் நடந்து 10 இடங்களில் நில்லுங்கள் — வரப்போரம் மட்டும் பார்க்க வேண்டாம்.",
              "ஒவ்வொரு இடத்திலும் 10 செடிகளைப் பாருங்கள் (மொத்தம் 100 செடி). பாதித்தவற்றை எண்ணுங்கள்.",
              "சதவீதம் = பாதித்த செடிகள். இதை மேலே உள்ள 'எப்போது மருந்து' அளவுடன் ஒப்பிடுங்கள்.",
              "அளவைத் தாண்டவில்லை என்றால் 3 நாள் கழித்து மீண்டும் எண்ணுங்கள் — பெரும்பாலான தாக்குதல்கள் தானே நிற்கும்.",
              "பூச்சிகளை எண்ணும்போது இலையின் அடிப்பகுதியைப் பாருங்கள் — அங்குதான் அவை ஒளியும்.",
            ] : [
              "Walk the field in a zig-zag and stop at 10 spots — never judge from the bund alone.",
              "At each spot check 10 plants (100 plants total). Count how many are affected.",
              "Percent = affected plants. Compare it with the 'spray only if' rule on the result above.",
              "Below the threshold? Count again in 3 days — most attacks stall on their own.",
              "When counting insects, look under the leaves — that is where they hide.",
            ]).map((x, i) => <li key={i}>{x}</li>)}
          </ol>
          <p className={`mt-3 text-sm text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "ஒரு செடியில் பூச்சி தெரிந்ததும் மருந்து அடிப்பது பணத்தை எரிப்பதற்குச் சமம் — எதிரி பூச்சிகளையும் கொன்றுவிடும்."
              : "Spraying at the first insect you see burns money — and kills the beneficial insects too."}
          </p>
        </Card>
      </section>

      {/* Spray smart — Plantix's "best time to spray" wisdom, offline */}
      <section className="mt-8">
        <SectionTitle>🌤️ {lang === "ta" ? "தெளிப்பதற்கு முன்" : "Before you spray"}</SectionTitle>
        <Card>
          <ul className={`list-disc pl-5 space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {(lang === "ta" ? [
              "காலை 6–9 அல்லது மாலை 4–6 மணிக்குத் தெளிக்கவும் — வெயிலில் மருந்து ஆவியாகி, பூச்சிகள் ஒளிந்துகொள்ளும்.",
              "மழை வரும் 6 மணி நேரத்திற்குள் தெளிக்க வேண்டாம் — மருந்து கழுவப்பட்டு பணம் வீண்.",
              "லேபிள் அளவையே பயன்படுத்துங்கள். 'கொஞ்சம் அதிகம்' என்பது பூச்சியைக் கொல்லாது — எதிர்ப்பை உருவாக்கும்.",
              "கையுறை, முகமூடி அணியுங்கள்; தெளித்த கையால் சாப்பிட வேண்டாம். குழந்தைகளை வயலுக்குள் விட வேண்டாம்.",
              "அறுவடைக்கு முன் காத்திருப்பு காலம்: லேபிளில் உள்ள நாட்களை மதியுங்கள் — எச்சம் உங்கள் குடும்ப உணவில் வரும்.",
            ] : [
              "Spray between 6–9 AM or 4–6 PM — midday sun evaporates the spray and insects hide.",
              "Never spray within 6 hours of expected rain — it washes off and wastes your money.",
              "Use exactly the label dose. 'A little extra' doesn't kill more pests — it breeds resistance.",
              "Wear gloves and a mask; don't eat with sprayed hands. Keep children out of the field.",
              "Respect the waiting period before harvest on the label — residues end up in your family's food.",
            ]).map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </Card>
      </section>

      {/* IPM ladder — the Plantix/FAO "combat options" ordering made
          explicit: cultural → mechanical → biological → chemical last.
          Dealers sell the chemical first; the ladder says otherwise. */}
      <section className="mt-8">
        <SectionTitle>🪜 {lang === "ta" ? "தீர்வு ஏணி — முதலில் எது?" : "The solution ladder — what first?"}</SectionTitle>
        <Card>
          <p className={`text-sm text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "பூச்சிக்கொல்லி கடைசி படி, முதல் படி அல்ல. தாக்குதலை இந்த வரிசையில் எதிர்கொள்ளுங்கள்:"
              : "Pesticide is the LAST step, not the first. Fight the attack in this order:"}
          </p>
          <ol className="space-y-3">
            {([
              { n: "1", t: lang === "ta" ? "வயல் நடைமுறை" : "Cultural", d: lang === "ta" ? "பாதித்த இலைகளைக் கிள்ளி எரியுங்கள்; பயிர் இடைவெளி சரி செய்யுங்கள்; வயலைச் சுத்தம் வையுங்கள். இலவசம் — அதிக தாக்குதல்களை இங்கேயே நிறுத்தலாம்." : "Pick and burn affected leaves; fix plant spacing; keep the field clean. Free — and stops many attacks right here." },
              { n: "2", t: lang === "ta" ? "இயந்திர/கைமுறை" : "Mechanical", d: lang === "ta" ? "கையால் பூச்சி பிடித்தல், மஞ்சள் ஒட்டும் பொறி, விளக்குப் பொறி, பறவை அமரும் கம்பு. குறைந்த செலவு, எதிரி பூச்சிகளுக்குப் பாதுகாப்பு." : "Hand-pick insects, yellow sticky traps, light traps, bird perches. Cheap, and spares the beneficial insects." },
              { n: "3", t: lang === "ta" ? "உயிரியல்" : "Biological", d: lang === "ta" ? "வேப்பெண்ணெய், பேசிலஸ் துரிஞ்சியென்சிஸ் (Bt), டிரைக்கோகிராமா முட்டை அட்டை. பூச்சியை மட்டும் கொல்லும் — உங்களுக்கும் மண்ணுக்கும் பாதுகாப்பு." : "Neem oil, Bacillus thuringiensis (Bt), Trichogramma egg cards. Kills the pest, not you or the soil." },
              { n: "4", t: lang === "ta" ? "இரசாயன — கடைசியாக" : "Chemical — last resort", d: lang === "ta" ? "மேலே உள்ளவை தோற்று, 'எப்போது மருந்து' அளவைத் தாண்டினால் மட்டும். சரியான மருந்து, சரியான அளவு, கீழே உள்ள லேபிள் விதிகளுடன்." : "Only when the steps above fail AND the 'spray only if' threshold is crossed. Right chemical, right dose, with the label rules below." },
            ]).map((s) => (
              <li key={s.n} className="flex gap-3 items-start">
                <span className="headline text-lg font-bold w-8 h-8 shrink-0 flex items-center justify-center border border-[var(--color-accent)] bg-[var(--color-accent-wash)] text-[var(--color-accent-deep)]" aria-hidden="true">{s.n}</span>
                <div>
                  <p className={`font-bold ${lang === "ta" ? "ta-fallback" : ""}`}>{s.t}</p>
                  <p className={`text-sm text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* Read the label — India's mandatory toxicity colour bands
          (Insecticides Rules, 1971, researched 20 Oct 2026): red/yellow/
          blue/green tell you how dangerous the bottle is before you open
          it. Farmers read the brand name and ignore the band — this card
          fixes that. */}
      <section className="mt-8">
        <SectionTitle>🏷️ {lang === "ta" ? "லேபிளைப் படியுங்கள்" : "Read the label first"}</SectionTitle>
        <Card>
          <p className={`text-sm text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "ஒவ்வொரு பூச்சிக்கொல்லி பாட்டிலிலும் நிறக் குறி கட்டாயம் — அது அந்த மருந்தின் ஆபத்து அளவைச் சொல்கிறது:"
              : "Every pesticide bottle in India must carry a colour band — it tells you how dangerous what's inside is:"}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {([
              { band: "#b3261e", name: lang === "ta" ? "சிவப்பு — அதிக ஆபத்து" : "Red — extremely toxic", line: lang === "ta" ? "☠ 'POISON' + மண்டை எலும்பு குறி இருக்கும். முழு கவச உடை இல்லாமல் தொட வேண்டாம்." : "☠ Skull mark + the word 'POISON'. Never handle without full protection." },
              { band: "#d9a111", name: lang === "ta" ? "மஞ்சள் — அதிக ஆபத்து" : "Yellow — highly toxic", line: lang === "ta" ? "'POISON — குழந்தைகளிடமிருந்து தூரம்' என்றிருக்கும். கையுறை, முகமூடி கட்டாயம்." : "'POISON — keep out of the reach of children'. Gloves and mask are mandatory." },
              { band: "#2c5f7c", name: lang === "ta" ? "நீலம் — மிதமான ஆபத்து" : "Blue — moderately toxic", line: lang === "ta" ? "'DANGER — குழந்தைகளிடமிருந்து தூரம்'. முன்னெச்சரிக்கை அவசியம்." : "'DANGER — keep out of the reach of children'. Still demands caution." },
              { band: "#4f7048", name: lang === "ta" ? "பச்சை — குறைந்த ஆபத்து" : "Green — slightly toxic", line: lang === "ta" ? "'CAUTION' — குறைந்த ஆபத்து என்றாலும் குழந்தைகள் கையில் தர வேண்டாம்." : "'CAUTION' — least dangerous, but never hand it to children." },
            ]).map((b) => (
              <div key={b.name} className="flex gap-3 border border-[var(--color-line)] p-3 items-start">
                <span aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 border border-black/20" style={{ backgroundColor: b.band }} />
                <div>
                  <p className={`font-bold ${lang === "ta" ? "ta-fallback" : ""}`}>{b.name}</p>
                  <p className={`text-sm text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>{b.line}</p>
                </div>
              </div>
            ))}
          </div>
          <ul className={`list-disc pl-5 space-y-2 text-sm text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>
            {(lang === "ta" ? [
              "சிவப்பு/மஞ்சள் மருந்துக்கு: கையுறை, கண்ணாடி, முகமூடி, நீண்ட கை உடை, பூட் — இவை இல்லாமல் தெளிக்க வேண்டாம்.",
              "காற்றடிக்கும்போது தெளிக்க வேண்டாம் — மருந்து உங்கள் முகத்தில் வந்துவிடும்.",
              "மருந்தை எப்போதும் பூட்டிய இடத்தில், உணவு/குடிநீரிலிருந்து தூரம், குழந்தைகள் கைக்கு எட்டாமல் வையுங்கள்.",
              "வெற்று டப்பாவை வீட்டு வேலைக்குப் பயன்படுத்த வேண்டாம் — மூன்று முறை கழுவி, துளையிட்டுப் புதையுங்கள்.",
              "தெளித்த பின் கை-கால் கழுவி, உடையைத் தனியே துவையுங்கள்.",
            ] : [
              "For red/yellow-label bottles: gloves, goggles, mask, long sleeves, boots — never spray without them.",
              "Never spray when it is windy — the mist blows back into your face.",
              "Store locked up, away from food and drinking water, where children cannot reach.",
              "Never reuse an empty bottle at home — rinse it three times, punch holes in it, bury it.",
              "After spraying, wash hands and feet and launder the clothes separately.",
            ]).map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </Card>
      </section>

      {/* Ask the officer — Plantix/FAO pattern: app diagnosis is a strong
          guess, never a lab test. The free 5-minute confirmation from the
          block agriculture officer decides the real treatment. */}
      <section className="mt-8">
        <SectionTitle>🧑‍🌾 {lang === "ta" ? "அலுவலரிடம் உறுதி செய்யுங்கள்" : "Confirm with your officer"}</SectionTitle>
        <Card>
          <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "பயிரின் கண்டறிதல் வலுவான ஊகம் — ஆய்வகப் பரிசோதனை அல்ல. உங்கள் வட்டார வேளாண் அலுவலரிடம் 5 நிமிடம் காட்டுங்கள்; தவறான மருந்துக்குப் போகாமல் காப்பீர்கள்."
              : "Payir's diagnosis is a strong guess — not a lab test. Show it to your block agriculture officer for 5 minutes; it protects you from spraying the wrong thing."}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4 no-print">
            <label className="block">
              <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">
                {lang === "ta" ? "அலுவலர் பெயர்" : "Officer name"}
              </span>
              <input
                className="field"
                type="text"
                value={officer.name}
                onChange={(e) => setAgriOfficer({ ...officer, name: e.target.value })}
                placeholder={lang === "ta" ? "எ.கா: வட்டார வேளாண் அலுவலர்" : "e.g. Block Agri Officer"}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">
                {lang === "ta" ? "தொலைபேசி" : "Phone"}
              </span>
              <input
                className="field"
                type="tel"
                value={officer.phone}
                onChange={(e) => setAgriOfficer({ ...officer, phone: e.target.value })}
                placeholder="98…"
                inputMode="tel"
              />
            </label>
          </div>
          <ul className="space-y-2">
            {([
              { key: "confirm:photos", en: "Take 3 photos of the damage — one close, one whole plant, one whole field", ta: "சேதத்தின் 3 புகைப்படங்கள் — நெருக்கமாக ஒன்று, முழுச் செடி ஒன்று, முழு வயல் ஒன்று" },
              { key: "confirm:note", en: "Carry this diagnosis note — use the print button on the result above", ta: "இந்தக் கண்டறிதல் குறிப்பை எடுத்துச் செல்லுங்கள் — மேலே உள்ள அச்சு பொத்தானைப் பயன்படுத்துங்கள்" },
              { key: "confirm:plot", en: "Tell the officer the plot name, crop, and the date you first noticed it", ta: "வயல் பெயர், பயிர், முதலில் கண்ட தேதி ஆகியவற்றை அலுவலரிடம் சொல்லுங்கள்" },
            ]).map((c) => {
              const on = !!db.checks[c.key];
              return (
                <li key={c.key}>
                  <button
                    onClick={() => setCheck(c.key, !on)}
                    aria-pressed={on}
                    className={`w-full text-left p-3 border flex items-start gap-3 ${on ? "border-[var(--color-accent)] bg-[var(--color-accent-wash)]" : "border-[var(--color-line)] bg-[var(--color-card)]"}`}
                  >
                    <span className="mt-0.5">{on ? "☑" : "☐"}</span>
                    <span className={lang === "ta" ? "ta-fallback" : ""}>{lang === "ta" ? c.ta : c.en}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      {/* Rain rules — the standing advice in every IMD/TNAU-KVK block
          advisory (DAMU bulletins, every Tue & Fri). Spray timing already has
          its own card above; these are the rain rules farmers miss. */}
      <section className="mt-8">
        <SectionTitle>🌧️ {lang === "ta" ? "மழை விதிகள்" : "Rain rules"}</SectionTitle>
        <Card className="!border-[var(--color-sky)]">
          <p className={`text-sm text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "வானிலை அறிவிப்புகளில் (IMD + வேளாண் பல்கலைக்கழக வட்டார அறிக்கைகள்) ஒவ்வொரு முறையும் திரும்ப வரும் விதிகள்:"
              : "The rules that repeat in every weather advisory (IMD + agri-university block bulletins):"}
          </p>
          <ul className={`list-disc pl-5 space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {(lang === "ta" ? [
              "அடுத்த 2 நாட்களில் மழை என்றால் நீர்ப்பாசனம் வேண்டாம் — டீசல்/மின்சாரம் வீண், வேர் மூழ்கும்.",
              "மழை என்றால் உரம், களை வேலையும் நிறுத்தவும் — யூரியா வடிகாலில் போகும், வேருக்குப் போகாது.",
              "முதிர்ந்த பயிர் வயலில் + மழை வருகிறது → முதலில் அறுவடை. ஈரத் தானியம் சில நாட்களில் பூஞ்சை பிடிக்கும் — சேமிக்கும் முன் மூடிய இடத்தில் உலர்த்தவும்.",
              "மழை பெய்ததும் இலை காயும் வரை தெளிக்க வேண்டாம் — ஈர இலையில் மருந்து இலையை எரிக்கும்.",
              "இந்த அறிவிப்புகள் இலவசம்: ஒவ்வொரு செவ்வாய், வெள்ளியும் வரும். WhatsApp-ல் பெறுவது எப்படி என்று உங்கள் KVK அல்லது வேளாண் அலுவலரிடம் கேளுங்கள்.",
            ] : [
              "Rain expected in the next 2 days → skip irrigation. Watering before rain wastes diesel and drowns the roots.",
              "Rain expected → hold fertilizer and field work too — urea washes into the drain, not the roots.",
              "Matured crop in the field + rain coming → harvest first. Wet harvested grain moulds in days — dry it under cover before storing.",
              "Just rained → wait for leaves to dry before any spray — spray on wet leaves burns them.",
              "These advisories are free: they arrive every Tuesday and Friday. Ask your KVK or agriculture officer how to get them on WhatsApp.",
            ]).map((x, i) => <li key={i}>{x}</li>)}
          </ul>
          <p className={`mt-3 text-xs text-[var(--color-ink-faint)] ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "அடிப்படை: IMD வேளாண் ஆலோசனை + TNAU/KVK வட்டார அறிக்கைகள் (DAMU) முறை."
              : "Based on the IMD Agro Advisory + TNAU/KVK block bulletin (DAMU) pattern."}
          </p>
        </Card>
      </section>
      {db.doctorHistory.length > 0 && (
        <section className="mt-8">
          <SectionTitle>📋 {lang === "ta" ? "என் கண்காணிப்புகள்" : "My field watch"}</SectionTitle>
          <p className={`text-sm text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
            {lang === "ta"
              ? "பாதித்த இடத்தைக் குறித்து சில நாட்களில் மீண்டும் பாருங்கள் — தாக்குதல் நிற்கிறதா, மருந்து வேலை செய்ததா என்று தெரியும்."
              : "Mark the affected spot and look again in a few days — you'll know if the attack stalled or the spray worked."}
          </p>
          <div className="space-y-2">
            {db.doctorHistory.map((h) => {
              const d = DIAGNOSES.find((x) => x.id === h.diagId);
              if (!d) return null;
              const status = h.status ?? "watching";
              const recheck = h.recheckAt ? daysUntilLocal(h.recheckAt) : null;
              const STATUS_BADGE_F: Record<string, string> = { watching: "badge-amber", treated: "badge-accent", resolved: "badge-green" };
              const STATUS_LABEL = lang === "ta"
                ? { watching: "கண்காணிப்பில்", treated: "மருந்து அடித்தாயிற்று", resolved: "தீர்ந்தது" }
                : { watching: "Watching", treated: "Treated", resolved: "Resolved" };
              return (
                <div key={h.id} className="card card-pad !py-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold">{lang === "ta" ? d.nameTa : d.nameEn}</p>
                      <p className="text-sm text-[var(--color-ink-faint)]">
                        {new Date(h.at).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${STATUS_BADGE_F[status]}`}>{STATUS_LABEL[status]}</span>
                      {recheck != null && status !== "resolved" && (
                        <span className={`badge ${recheck < 0 ? "badge-coral" : recheck <= 1 ? "badge-amber" : ""}`}>
                          {recheck < 0
                            ? (lang === "ta" ? `${-recheck} நாள் தாமதம் — மீண்டும் பார்க்கவும்` : `${-recheck}d overdue — re-check`)
                            : recheck === 0
                              ? (lang === "ta" ? "இன்று மீண்டும் பார்க்கவும்" : "Re-check today")
                              : (lang === "ta" ? `${recheck} நாளில் மீண்டும் பார்க்கவும்` : `Re-check in ${recheck}d`)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 no-print">
                    {status === "watching" && (
                      <button className="btn btn-ghost !min-h-0 !py-1 !px-2.5 text-xs" onClick={() => setDiagnosisStatus(h.id, "treated")}>
                        {lang === "ta" ? "மருந்து அடித்தேன்" : "I treated it"}
                      </button>
                    )}
                    {status === "treated" && (
                      <button className="btn btn-ghost !min-h-0 !py-1 !px-2.5 text-xs" onClick={() => setDiagnosisStatus(h.id, "resolved")}>
                        {lang === "ta" ? "தீர்ந்தது ✓" : "Resolved ✓"}
                      </button>
                    )}
                    {status !== "resolved" && (
                      <button
                        className="btn btn-ghost !min-h-0 !py-1 !px-2.5 text-xs"
                        onClick={() => setDiagnosisRecheck(h.id, new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10))}
                      >
                        ↻ {lang === "ta" ? "3 நாளில் மீண்டும்" : "+3 days"}
                      </button>
                    )}
                    <button className="text-[var(--color-coral)] text-xs ml-auto" onClick={() => removeDiagnosis(h.id)} aria-label={lang === "ta" ? "நீக்கு" : "Remove"}>
                      ✕
                    </button>
                  </div>
                  {/* "What worked" — the personal knowledge base: next season, the same
                      symptom hits and the farmer can see which treatment worked last time. */}
                  {(status === "treated" || status === "resolved") && (
                    <div className={`mt-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
                      <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1" htmlFor={`outcome-${h.id}`}>
                        {lang === "ta" ? "என்ன வேலை செய்தது? (அடுத்த பருவத்துக்கு நினைவில் இருக்க)" : "What worked? (so next season you remember)"}
                      </label>
                      <textarea
                        id={`outcome-${h.id}`}
                        className="field no-print"
                        rows={2}
                        maxLength={500}
                        defaultValue={h.outcome ?? ""}
                        placeholder={lang === "ta" ? "எ.கா. வேப்பெண்ணெய் தெளிப்பு 2 முறை — தாக்குதல் நின்றது" : "e.g. neem oil spray twice — attack stopped"}
                        onBlur={(e) => setDiagnosisOutcome(h.id, e.target.value.trim())}
                      />
                      {h.outcome ? (
                        <p className="text-sm mt-1 text-[var(--color-accent-deep)]">
                          <span className="font-semibold">{lang === "ta" ? "பதிவு:" : "Recorded:"}</span> {h.outcome}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Print-only diagnosis slip for the agriculture officer */}
      {printDiag && (
        <div className="print-only mt-8">
          <h2 className="headline text-2xl font-bold mb-1">
            {lang === "ta" ? "பயிர் — நோய் கண்டறிதல் குறிப்பு" : "Payir — Crop Diagnosis Note"}
          </h2>
          <p className="text-sm mb-4">
            {lang === "ta" ? "பயிர்" : "Crop"}: {lang === "ta" ? cropObj?.nameTa : cropObj?.nameEn}
            {" · "}{t(`urgency_${printDiag.urgency}`)}
          </p>
          <h3 className="headline text-xl font-bold mb-2">{lang === "ta" ? printDiag.nameTa : printDiag.nameEn}</h3>
          <p className="mb-3">{lang === "ta" ? printDiag.aboutTa : printDiag.aboutEn}</p>
          <p className="kicker mb-1">{lang === "ta" ? "கண்ட அறிகுறிகள்" : "Symptoms observed"}</p>
          <ul className="list-disc pl-5 mb-3">
            {symptoms.map((sid) => {
              const s = SYMPTOMS.find((x) => x.id === sid);
              return s ? <li key={sid}>{lang === "ta" ? s.ta : s.en}</li> : null;
            })}
          </ul>
          {([["organic", t("tab_organic")], ["chemical", t("tab_chemical")], ["prevent", t("tab_prevent")]] as const).map(([k, label]) => (
            <div key={k} className="mb-3">
              <p className="kicker mb-1">{label}</p>
              <ul className="list-disc pl-5">
                {(lang === "ta"
                  ? (k === "organic" ? printDiag.organicTa : k === "chemical" ? printDiag.chemicalTa : printDiag.preventTa)
                  : (k === "organic" ? printDiag.organicEn : k === "chemical" ? printDiag.chemicalEn : printDiag.preventEn)
                ).map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          ))}
          <p className="text-xs mt-4">
            {lang === "ta"
              ? "இது வழிகாட்டுதல், ஆய்வக முடிவு அல்ல. பெரிய தெளிப்புக்கு முன் வட்டார வேளாண் அலுவலரிடம் உறுதி செய்யவும்."
              : "Guidance, not a lab test. Confirm with your block agriculture officer before a major spray."}
          </p>
        </div>
      )}

      <BackHome />
    </div>
  );
}
