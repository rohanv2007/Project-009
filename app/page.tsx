"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "../lib/i18n";
import { useDB, inr, FarmLoan } from "../lib/db";
import { SEASONS, MSP_2026_27, MONTHS_EN, MONTHS_TA, PEST_FORECAST, DOCTOR_CROPS, DIAGNOSES } from "../lib/data";
import { Kicker, Card, SectionTitle, Stat } from "../components/ui";

function monthRange(a: number, b: number): number[] {
  const out: number[] = [];
  let m = a;
  while (true) { out.push(m); if (m === b) break; m = (m + 1) % 12; }
  return out;
}

function inRange(m: number, a: number, b: number): boolean {
  return monthRange(a, b).includes(m);
}

function daysUntil(dateStr: string): number {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const target = new Date(y, mo - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function RemindersBlock() {
  const { lang } = useLang();
  const { db, addReminder, removeReminder } = useDB();
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); }, []);

  const sorted = [...db.reminders].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card>
      {sorted.length === 0 ? (
        <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>
          {lang === "ta"
            ? "உங்கள் மாவட்ட காப்பீடு காலக்கெடு, கடன் தவணை, மானிய விண்ணப்ப நாள் — இங்கே குறித்து வையுங்கள். Payir நாட்களை எண்ணும்."
            : "Your district's insurance deadline, a loan due date, a subsidy application day — note it here and Payir counts the days."}
        </p>
      ) : (
        <ul className="space-y-2 mb-4">
          {sorted.map((r) => {
            const left = daysUntil(r.date);
            const urgent = left <= 7;
            return (
              <li key={r.id} className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] pb-2">
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    {new Date(r.date + "T00:00:00").toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className="flex items-center gap-2">
                  <span className={`badge ${left < 0 ? "badge-coral" : urgent ? "badge-amber" : "badge-green"}`}>
                    {left < 0
                      ? (lang === "ta" ? `${-left} நாள் தாமதம்` : `${-left}d overdue`)
                      : left === 0
                        ? (lang === "ta" ? "இன்று!" : "Today!")
                        : (lang === "ta" ? `${left} நாள்` : `${left}d left`)}
                  </span>
                  <button className="text-[var(--color-coral)] text-sm" onClick={() => removeReminder(r.id)} aria-label={lang === "ta" ? "நீக்கு" : "Delete"}>✕</button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 no-print">
        <input
          className="field"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={lang === "ta" ? "எ.கா. காப்பீடு காலக்கெடு" : "e.g. Insurance deadline"}
          aria-label={lang === "ta" ? "நினைவூட்டல்" : "Reminder"}
        />
        <input
          className="field"
          type="date"
          value={date}
          min={today ?? undefined}
          onChange={(e) => setDate(e.target.value)}
          aria-label={lang === "ta" ? "தேதி" : "Date"}
        />
        <button
          className="btn btn-primary"
          onClick={() => { if (label.trim() && date) { addReminder({ label: label.trim(), date }); setLabel(""); setDate(""); } }}
        >
          {lang === "ta" ? "சேர்" : "Add"}
        </button>
      </div>
    </Card>
  );
}

/* Unfinished business: one board for every pending checklist in the app —
   pre-harvest (harvest:*), post-harvest storage (post:*), procurement
   paperwork (procure:*), officer confirmation (confirm:*), and PMFBY
   evidence kits (evidence:<claimId>:*). A farmer with 3 checks half-done
   on 3 different pages gets one nudge, not silence. Silent when
   everything is ticked. */
function OpenWork() {
  const { lang } = useLang();
  const { db } = useDB();
  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";
  const done = (key: string) => !!db.checks[key];

  const HARVEST_IDS = ["combine", "tarpaulin", "bags", "labour", "moisture", "dpc"];
  const POST_IDS = ["moisture", "pallets", "neem", "nomix", "grade", "fifo"];
  const ENAM_IDS = ["register", "grade", "assay", "testlot", "watch", "records"];
  const PROCURE_IDS = ["register", "docs", "mobile", "dates"];
  const CONFIRM_IDS = ["photos", "note", "plot"];
  const DOCS_IDS = ["aadhaar", "patta", "passbook", "mobile", "photos", "ration", "lease"];
  const EVIDENCE_IDS = ["photos", "aadhaar", "bank", "sowing", "intimation"];

  const harvestDone = HARVEST_IDS.filter((id) => done(`harvest:${id}`)).length;
  const postDone = POST_IDS.filter((id) => done(`post:${id}`)).length;
  const enamDone = ENAM_IDS.filter((id) => done(`enam:${id}`)).length;
  const procureDone = PROCURE_IDS.filter((id) => done(`procure:${id}`)).length;
  const confirmDone = CONFIRM_IDS.filter((id) => done(`confirm:${id}`)).length;
  const docsDone = DOCS_IDS.filter((id) => done(`docs:${id}`)).length;
  const claimsOpen = db.claimLogs
    .map((c) => ({ c, n: EVIDENCE_IDS.filter((id) => done(`evidence:${c.id}:${id}`)).length }))
    .filter((x) => x.n < EVIDENCE_IDS.length);

  const rows: { key: string; label: string; detail: string; href: string }[] = [];
  if (confirmDone < CONFIRM_IDS.length && db.doctorHistory.length > 0)
    rows.push({
      key: "confirm",
      label: ta ? "அலுவலரிடம் உறுதி" : "Officer confirmation",
      detail: ta ? `${CONFIRM_IDS.length - confirmDone} மீதம் — கண்டறிதலைக் காட்டுங்கள்` : `${CONFIRM_IDS.length - confirmDone} left — show the diagnosis`,
      href: "/doctor",
    });
  if (harvestDone < HARVEST_IDS.length)
    rows.push({
      key: "harvest",
      label: ta ? "அறுவடைத் தயார்நிலை" : "Pre-harvest readiness",
      detail: ta ? `${harvestDone}/${HARVEST_IDS.length} தயார்` : `${harvestDone}/${HARVEST_IDS.length} ready`,
      href: "/field-guide",
    });
  if (postDone < POST_IDS.length)
    rows.push({
      key: "post",
      label: ta ? "அறுவடைக்குப் பின் சேமிப்பு" : "Post-harvest storage",
      detail: ta ? `${postDone}/${POST_IDS.length} முடிந்தது — இழப்பைத் தவிர்க்க` : `${postDone}/${POST_IDS.length} done — stop the storage losses`,
      href: "/field-guide",
    });
  if (procureDone < PROCURE_IDS.length)
    rows.push({
      key: "procure",
      label: ta ? "அரசு கொள்முதல் ஆவணங்கள்" : "MSP procurement paperwork",
      detail: ta ? `${procureDone}/${PROCURE_IDS.length} தயார் — இது MSP-ஐ நிஜமாக்கும்` : `${procureDone}/${PROCURE_IDS.length} ready — this is what makes MSP real`,
      href: "/schemes",
    });
  if (enamDone < ENAM_IDS.length)
    rows.push({
      key: "enam",
      label: ta ? "e-NAM முதல் விற்பனை" : "e-NAM first sale",
      detail: ta ? `${enamDone}/${ENAM_IDS.length} முடிந்தது — ஆன்லைன் ஏலத்திற்குத் தயார்` : `${enamDone}/${ENAM_IDS.length} done — get ready to auction online`,
      href: "/prices",
    });
  if (docsDone < DOCS_IDS.length)
    rows.push({
      key: "docs",
      label: ta ? "குடும்ப ஆவணப் பை" : "Family document wallet",
      detail: ta ? `${docsDone}/${DOCS_IDS.length} ஆவணம் தயார் — திட்டங்கள் இவற்றையே கேட்கும்` : `${docsDone}/${DOCS_IDS.length} papers ready — every scheme asks for these`,
      href: "/schemes",
    });
  claimsOpen.forEach(({ c, n }) =>
    rows.push({
      key: `claim:${c.id}`,
      label: ta ? `காப்பீடு ஆதாரம் — ${c.crop}` : `Insurance evidence — ${c.crop}`,
      detail: ta ? `${n}/${EVIDENCE_IDS.length} ஆவணம் தயார்` : `${n}/${EVIDENCE_IDS.length} papers ready`,
      href: "/schemes",
    })
  );
  if (rows.length === 0) return null;

  return (
    <section className="mt-8 no-print" aria-label={ta ? "மீதமுள்ள வேலை" : "Open work"}>
      <SectionTitle>📌 {ta ? "முடிக்க வேண்டிய வேலை" : "Unfinished business"}</SectionTitle>
      <Card className="!border-[var(--color-amber)]">
        <ul className={`space-y-2.5 ${taFont}`}>
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] pb-2 last:border-0 last:pb-0">
              <div>
                <p className="font-semibold">{r.label}</p>
                <p className="text-sm text-[var(--color-ink-soft)]">{r.detail}</p>
              </div>
              <Link href={r.href} className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-sm shrink-0">
                {ta ? "தொடரவும் →" : "Continue →"}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

/* Records backup: everything lives in this device's storage, so one phone
   reset wipes the whole ledger. The family downloads a backup file after the
   season's big entries, and restores from it on any device. */
function BackupCard() {
  const { lang } = useLang();
  const { db, exportBackup, importBackup } = useDB();
  const [status, setStatus] = useState<string | null>(null);
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); }, []);

  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";
  const entries = db.plots.length + db.expenses.length + db.sales.length + db.doctorHistory.length + db.reminders.length + db.claimLogs.length + db.priceQuotes.length + db.farmLoans.length;

  const download = () => {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payir-backup-${today ?? "records"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(ta ? "காப்புப் பிரதி பதிவிறக்கப்பட்டது. பத்திரமாக வையுங்கள்." : "Backup downloaded. Keep it somewhere safe.");
  };

  const restore = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importBackup(String(reader.result ?? ""));
      setStatus(ok
        ? (ta ? "பழைய பதிவுகள் மீட்டெடுக்கப்பட்டன." : "Records restored from the backup file.")
        : (ta ? "இந்தக் கோப்பு பயிர் காப்புப் பிரதி போல் தெரியவில்லை." : "That file does not look like a Payir backup."));
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <p className={`text-[var(--color-ink-soft)] mb-4 ${taFont}`}>
        {ta
          ? `உங்கள் அனைத்துப் பதிவுகளும் இந்தச் சாதனத்தில் மட்டுமே உள்ளன (தற்போது ${entries} உள்ளீடுகள்). ஃபோன் மாற்றுவதற்கு முன் அல்லது மாதத்திற்கு ஒருமுறை, காப்புப் பிரதி எடுத்து வையுங்கள்.`
          : `All your records live only on this device (${entries} entries right now). Take a backup before changing phones, or once a month.`}
      </p>
      <div className="flex flex-wrap gap-2 no-print">
        <button className="btn btn-primary" onClick={download}>
          ⬇ {ta ? "காப்புப் பிரதி பதிவிறக்கு" : "Download backup"}
        </button>
        <label className="btn btn-ghost cursor-pointer">
          ⬆ {ta ? "மீட்டெடு" : "Restore from file"}
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => { restore(e.target.files?.[0]); e.target.value = ""; }}
          />
        </label>
      </div>
      {status && <p className={`mt-3 text-sm font-semibold ${taFont}`}>{status}</p>}
      <p className={`mt-3 text-xs text-[var(--color-ink-faint)] ${taFont}`}>
        {ta
          ? "மீட்டெடுப்பது தற்போதைய பதிவுகளை மாற்றிவிடும் — முதலில் காப்புப் பிரதி எடுத்துக்கொள்ளுங்கள்."
          : "Restoring replaces the current records — download a fresh backup first."}
      </p>
    </Card>
  );
}

/* 72-hour claim window: the single most time-critical event in the whole
   app. If a logged damage incident still sits inside its 72-hour PMFBY
   reporting window, the season board raises a red flag — the schemes page
   is too far down for a ticking clock. */
function ClaimAlert() {
  const { lang } = useLang();
  const { db } = useDB();
  // Client-only clock (Next 16 prerender).
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); }, []);
  if (!now) return null;
  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";

  const open = db.claimLogs
    .map((c) => ({ c, leftH: (new Date(c.at).getTime() + 72 * 3600000 - now) / 3600000 }))
    .filter((x) => x.leftH > 0 && x.leftH <= 72);
  if (open.length === 0) return null;

  const types: Record<string, { en: string; ta: string }> = {
    flood: { en: "Flood / waterlogging", ta: "வெள்ளம் / தண்ணீர் தேக்கம்" },
    drought: { en: "Drought / dry spell", ta: "வறட்சி" },
    pest: { en: "Pest / disease outbreak", ta: "பூச்சி / நோய் தாக்குதல்" },
    storm: { en: "Storm / hail / cyclone", ta: "புயல் / ஆலங்கட்டி மழை" },
    other: { en: "Other", ta: "மற்றவை" },
  };
  const typeName = (id: string) => (types[id] ? (ta ? types[id].ta : types[id].en) : id);
  const fmt = (h: number) =>
    h < 1
      ? (ta ? `${Math.max(1, Math.round(h * 60))} நிமிடம்` : `${Math.max(1, Math.round(h * 60))} min`)
      : (ta ? `${Math.round(h)} மணி` : `${Math.round(h)}h`);

  return (
    <section className="mt-8" aria-label={ta ? "72 மணி நேர எச்சரிக்கை" : "72-hour alert"}>
      <Card className="!border-[var(--color-coral)]">
        <SectionTitle>🚨 {ta ? "72 மணி நேர விதி — நேரம் ஓடுகிறது" : "72-hour rule — the clock is running"}</SectionTitle>
        <p className={`text-sm text-[var(--color-ink-soft)] mb-3 ${taFont}`}>
          {ta
            ? "காப்பீடு கோரிக்கை நிலைக்க இந்தச் சேதங்களை 72 மணி நேரத்திற்குள் புகார் செய்ய வேண்டும்:"
            : "For the insurance claim to survive, these incidents must be reported within 72 hours of being noticed:"}
        </p>
        <ul className={`space-y-2.5 ${taFont}`}>
          {open.map(({ c, leftH }) => (
            <li key={c.id} className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] pb-2">
              <span>
                <strong>{c.crop}</strong>
                <span className="block text-sm text-[var(--color-ink-soft)]">
                  {typeName(c.lossType)}{c.note ? ` — ${c.note}` : ""}
                </span>
              </span>
              <span className="badge badge-coral shrink-0">{ta ? `${fmt(leftH)} மீதம்` : `${fmt(leftH)} left`}</span>
            </li>
          ))}
        </ul>
        <Link href="/schemes" className="btn btn-primary mt-4 no-print">
          {ta ? "திட்ட மேசையிலிருந்து புகார் செய்" : "Report from the Schemes desk"}
        </Link>
      </Card>
    </section>
  );
}

/* Field rechecks due: the Crop Doctor stamps every diagnosis with a "look
   again by" date. Unresolved entries due within the next 7 days (or already
   overdue) surface on the season board so the follow-up is not forgotten. */
function RechecksStrip() {
  const { lang } = useLang();
  const { db } = useDB();
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); }, []);
  if (!today) return null;
  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";

  const due = db.doctorHistory
    .filter((h) => h.status !== "resolved" && h.recheckAt)
    .map((h) => ({ h, left: Math.round((new Date(h.recheckAt + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000) }))
    .filter((x) => x.left <= 7)
    .sort((a, b) => a.left - b.left);
  if (due.length === 0) return null;

  const diagName = (crop: string, diagId: string) => {
    const d = DIAGNOSES.find((x) => x.id === diagId && x.crop === crop);
    const c = DOCTOR_CROPS.find((x) => x.id === crop);
    const dName = d ? (ta ? d.nameTa : d.nameEn) : diagId;
    const cName = c ? (ta ? c.nameTa : c.nameEn) : crop;
    return `${cName} — ${dName}`;
  };

  return (
    <section className="mt-8" aria-label={ta ? "மீண்டும் பார்க்க வேண்டியவை" : "Field rechecks due"}>
      <SectionTitle>🔍 {ta ? "வயலை மீண்டும் பார்க்க வேண்டிய நேரம்" : "Time to walk the field again"}</SectionTitle>
      <Card className="!border-[var(--color-amber)]">
        <ul className={`space-y-2.5 ${taFont}`}>
          {due.map(({ h, left }) => (
            <li key={h.id} className="flex items-center justify-between gap-3">
              <span>
                <strong>{diagName(h.crop, h.diagId)}</strong>
                <span className="block text-sm text-[var(--color-ink-soft)]">
                  {ta ? "நிலை: " : "Status: "}
                  {h.status === "treated" ? (ta ? "மருந்து தெளித்தது" : "treated") : (ta ? "கண்காணிப்பில்" : "watching")}
                </span>
              </span>
              <span className={`badge shrink-0 ${left < 0 ? "badge-coral" : "badge-amber"}`}>
                {left < 0 ? (ta ? `${-left} நாள் தாமதம்` : `${-left}d overdue`)
                  : left === 0 ? (ta ? "இன்று" : "today")
                  : (ta ? `${left} நாளில்` : `in ${left}d`)}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/doctor" className="btn btn-ghost mt-4">{ta ? "பயிர் மருத்துவரைத் திற" : "Open the Crop Doctor"}</Link>
      </Card>
    </section>
  );
}

/* Season outlook: pick a plot, enter the expected yield, and see the
   projected profit at MSP (or your own price) against what the plot has
   cost so far. A planning number — the card says so. */
function ProjectionCard() {
  const { lang } = useLang();
  const { db } = useDB();
  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";
  const [plotId, setPlotId] = useState("");
  const [yieldQ, setYieldQ] = useState("25");
  const [price, setPrice] = useState("");

  const plot = db.plots.find((p) => p.id === plotId) ?? db.plots[0] ?? null;
  const first = plot?.crop.trim().toLowerCase().split(" ")[0] ?? "";
  const msp = first ? MSP_2026_27.find((m) => m.cropEn.toLowerCase().includes(first)) : undefined;
  const priceNum = parseFloat(price);
  const effPrice = priceNum > 0 ? priceNum : msp?.msp ?? 0;
  const y = parseFloat(yieldQ) || 0;
  const quintals = plot ? plot.acres * y : 0;
  const revenue = quintals * effPrice;
  const spentPlot = plot ? db.expenses.filter((e) => e.plotId === plot.id).reduce((a, e) => a + e.amount, 0) : 0;
  const profit = revenue - spentPlot;

  if (!plot) return null;

  return (
    <section className="mt-8" aria-label={ta ? "பருவ முன்னோட்டம்" : "Season outlook"}>
      <SectionTitle>🔮 {ta ? "பருவ முன்னோட்டம்" : "Season outlook"}</SectionTitle>
      <Card>
        <p className={`text-sm text-[var(--color-ink-soft)] mb-4 ${taFont}`}>
          {ta
            ? "அறுவடைக்கு முன் லாபத்தை மதிப்பிடுங்கள் — திட்டமிட உதவும் எண், வாக்குறுதி அல்ல."
            : "Estimate the season's profit before harvest — a planning number, not a promise."}
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mb-4 no-print">
          <label className="block">
            <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{ta ? "நிலம்" : "Plot"}</span>
            <select className="field" value={plot.id} onChange={(e) => setPlotId(e.target.value)}>
              {db.plots.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.acres} ac · {p.crop})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">
              {ta ? "எதிர்பார்க்கும் மகசூல் (குவி/ஏக்கர்)" : "Expected yield (q/acre)"}
            </span>
            <input className="field" type="number" min="0" step="1" value={yieldQ} onChange={(e) => setYieldQ(e.target.value)} inputMode="decimal" />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">
              {ta ? "விலை ₹/குவிண்டால்" : "Price ₹/quintal"}
            </span>
            <input
              className="field"
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
              placeholder={msp ? `MSP ₹${msp.msp.toLocaleString("en-IN")}` : undefined}
            />
          </label>
        </div>
        {quintals > 0 && effPrice > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-live="polite">
            <div className="border border-[var(--color-line)] p-3">
              <p className="kicker mb-1">{ta ? "அறுவடை" : "Harvest"}</p>
              <p className="headline text-xl font-bold">{quintals.toLocaleString("en-IN")} q</p>
            </div>
            <div className="border border-[var(--color-line)] p-3">
              <p className="kicker mb-1">{ta ? "வருவாய்" : "Revenue"}</p>
              <p className="headline text-xl font-bold">{inr(revenue)}</p>
              <p className="text-xs text-[var(--color-ink-faint)]">{ta ? `@ ₹${Math.round(effPrice).toLocaleString("en-IN")}${msp && !(priceNum > 0) ? " (MSP)" : ""}` : `@ ₹${Math.round(effPrice).toLocaleString("en-IN")}${msp && !(priceNum > 0) ? " (MSP)" : ""}`}</p>
            </div>
            <div className="border border-[var(--color-line)] p-3">
              <p className="kicker mb-1">{ta ? "இதுவரை செலவு" : "Spent so far"}</p>
              <p className="headline text-xl font-bold">{inr(spentPlot)}</p>
            </div>
            <div className={`border p-3 ${profit >= 0 ? "border-[var(--color-sage)] bg-[var(--color-sage-wash)]" : "border-[var(--color-coral)] bg-[var(--color-coral-wash)]"}`}>
              <p className="kicker mb-1">{ta ? "மதிப்பிடப்பட்ட லாபம்" : "Projected profit"}</p>
              <p className="headline text-xl font-bold">{inr(profit)}</p>
            </div>
          </div>
        ) : (
          <p className={`text-sm text-[var(--color-ink-soft)] ${taFont}`}>
            {ta
              ? "மகசூலையும் விலையையும் உள்ளிடுங்கள் — மதிப்பீடு இங்கே வரும்."
              : "Enter a yield and a price — the projection appears here."}
          </p>
        )}
        {!msp && (
          <p className={`mt-3 text-xs text-[var(--color-ink-faint)] ${taFont}`}>
            {ta
              ? `"${plot.crop}" பயிருக்கு MSP இல்லை — உங்கள் எதிர்பார்ப்பு விலையை உள்ளிடுங்கள்.`
              : `No MSP for "${plot.crop}" — enter your expected price.`}
          </p>
        )}
      </Card>
    </section>
  );
}

/* Agriculture-officer call strip: the number is saved on the Crop Doctor
   page, but when the field is flooding at 6 AM the family should not have to
   remember which page holds it. One tap to call from the season board. */
function OfficerStrip() {
  const { lang } = useLang();
  const { db } = useDB();
  const ta = lang === "ta";
  const taFont = ta ? "ta-fallback" : "";
  const { name, phone } = db.agriOfficer;

  return (
    <section className="mt-8" aria-label={ta ? "வேளாண் அலுவலர்" : "Agriculture officer"}>
      <SectionTitle>📞 {ta ? "உங்கள் வேளாண் அலுவலர்" : "Your agriculture officer"}</SectionTitle>
      <Card className={phone ? "!border-[var(--color-accent)]" : ""}>
        {phone ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className={taFont}>
              <p className="font-bold text-lg">{name || (ta ? "வட்டார வேளாண் அலுவலர்" : "Block agriculture officer")}</p>
              <p className="text-sm text-[var(--color-ink-soft)]">
                {ta
                  ? "கண்டறிதல், காப்பீட்டு ஆவணங்கள், காலக்கெடுகள் — செயல்படுமுன் இவரிடம் உறுதி செய்யுங்கள்."
                  : "Confirm diagnoses, claim paperwork, and deadlines with them before you act."}
              </p>
            </div>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn btn-primary no-print shrink-0">
              {ta ? "📞 அழை" : "📞 Call"}
            </a>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={`text-[var(--color-ink-soft)] ${taFont}`}>
              {ta
                ? "வட்டார வேளாண் அலுவலரின் பெயரையும் எண்ணையும் சேமித்து வையுங்கள் — அவசர நேரத்தில் இங்கிருந்தே ஒரே தொடுதலில் அழைக்கலாம்."
                : "Save your block agriculture officer's name and number — then call them in one tap from right here when it matters."}
            </p>
            <Link href="/doctor" className="btn btn-ghost no-print shrink-0">
              {ta ? "பயிர் மருத்துவரில் சேர்" : "Add it in the Crop Doctor"}
            </Link>
          </div>
        )}
      </Card>
    </section>
  );
}

export default function HomePage() {
  const { t, lang } = useLang();
  const { db } = useDB();
  // Time is client-only: Next 16 prerender fails on `new Date()` during the
  // server pass, so read the clock after mount.
  const [month, setMonth] = useState<number | null>(null);
  useEffect(() => { setMonth(new Date().getMonth()); }, []);
  const [pmfbyLeft, setPmfbyLeft] = useState<number | null>(null);
  useEffect(() => { setPmfbyLeft(daysUntil("2026-11-15")); }, []);

  const sowing = month == null ? [] : SEASONS.filter((s) => inRange(month, s.sow[0], s.sow[1]));
  const harvesting = month == null ? [] : SEASONS.filter((s) => inRange(month, s.harvest[0], s.harvest[1]));

  const spent = db.expenses.reduce((a, e) => a + e.amount, 0);
  const earned = db.sales.reduce((a, s) => a + s.quintals * s.rate, 0);
  const totalAcres = db.plots.reduce((a, p) => a + (p.acres || 0), 0);
  const profitPerAcre = totalAcres > 0 ? (earned - spent) / totalAcres : earned - spent;
  const doneSchemes = Object.values(db.schemeStatus).filter((s) => s === "done").length;

  const mName = month == null ? "" : (lang === "ta" ? MONTHS_TA[month] : MONTHS_EN[month]);

  /* KCC loans due within 30 days (or overdue) belong on the season board's
     deadline strip, not hidden on the schemes page — missing the repayment
     date costs the 3% prompt-repayment incentive (7% instead of 4%). */
  const loansDue: { loan: FarmLoan; left: number }[] = db.farmLoans
    .map((loan) => ({ loan, left: daysUntil(loan.dueDate) }))
    .filter((x) => x.left <= 30)
    .sort((a, b) => a.left - b.left);

  return (
    <div>
      <Kicker>{t("dash_kicker")}</Kicker>
      <h1 className={`headline text-3xl md:text-[2.6rem] font-bold max-w-2xl ${lang === "ta" ? "ta-fallback" : ""}`}>
        {t("dash_title")}
      </h1>
      <p className={`mt-3 text-[1.02rem] text-[var(--color-ink-soft)] max-w-2xl ${lang === "ta" ? "ta-fallback" : ""}`}>
        {t("dash_sub")}
      </p>

      {/* This month */}
      <section className="mt-8" aria-label={t("this_month")}>
        <SectionTitle>{t("this_month")} · {mName}</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <p className="kicker mb-2">🌱 {t("sowing_now")}</p>
            {sowing.length === 0 ? (
              <p className="text-[var(--color-ink-soft)]">—</p>
            ) : (
              <ul className="space-y-1.5">
                {sowing.map((s) => (
                  <li key={s.id} className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{lang === "ta" ? s.nameTa : s.nameEn}</span>
                    <span className="text-sm text-[var(--color-ink-soft)]">{s.cropEn}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <p className="kicker mb-2">🌾 {t("harvesting_now")}</p>
            {harvesting.length === 0 ? (
              <p className="text-[var(--color-ink-soft)]">—</p>
            ) : (
              <ul className="space-y-1.5">
                {harvesting.map((s) => (
                  <li key={s.id} className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{lang === "ta" ? s.nameTa : s.nameEn}</span>
                    <span className="text-sm text-[var(--color-ink-soft)]">{s.cropEn}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        {month != null && sowing.length === 0 && harvesting.length === 0 && (
          <p className={`mt-3 text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>{t("nothing_now")}</p>
        )}
        {/* Harvest is open somewhere: pull the pre-harvest checklist progress
            onto the board — the two weeks before harvest decide the price. */}
        {harvesting.length > 0 && (() => {
          const TOTAL = 6;
          const done = Object.keys(db.checks).filter((k) => k.startsWith("harvest:") && db.checks[k]).length;
          const ta = lang === "ta";
          return (
            <Link href="/field-guide" className="block mt-4 no-print">
              <div className={`card card-pad flex items-center justify-between gap-3 ${done < TOTAL ? "!border-[var(--color-amber)]" : "!border-[var(--color-accent)]"}`}>
                <div>
                  <p className="kicker mb-1">🌾 {ta ? "அறுவடைக்காலம் — தயார்நிலை" : "Harvest window — readiness"}</p>
                  <p className={`font-semibold ${ta ? "ta-fallback" : ""}`}>
                    {ta
                      ? `${done}/${TOTAL} தயார் — மீதமுள்ளதை முடிக்க இங்கே தொடவும்`
                      : `${done}/${TOTAL} ready — tap to finish the rest`}
                  </p>
                </div>
                <span className="text-2xl shrink-0" aria-hidden="true">→</span>
              </div>
            </Link>
          );
        })()}
      </section>

      {/* Stats */}
      <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label={t("stat_msp")} value={String(MSP_2026_27.length)} sub="KMS 2026-27" />
        <Stat label={t("stat_schemes")} value={`${doneSchemes}/6`} sub={t("stat_schemes_sub")} />
        <Stat label={t("stat_spent")} value={inr(spent)} />
        <Stat label={t("profit_acre")} value={inr(profitPerAcre)} sub={earned > 0 ? t("total_earned") : undefined} />
      </section>

      {/* Season outlook: projected profit per plot */}
      {db.plots.length > 0 && <ProjectionCard />}

      {/* Coming up: windows that open in the next 30 days */}
      {month != null && (
        <section className="mt-8" aria-label={lang === "ta" ? "அடுத்த 30 நாட்கள்" : "Next 30 days"}>
          <SectionTitle>📅 {lang === "ta" ? "அடுத்த 30 நாட்களில்" : "In the next 30 days"}</SectionTitle>
          {(() => {
            const nextMonth = (month + 1) % 12;
            const opening = SEASONS.filter(
              (s) => !inRange(month, s.sow[0], s.sow[1]) && inRange(nextMonth, s.sow[0], s.sow[1])
            );
            const harvestSoon = SEASONS.filter(
              (s) => !inRange(month, s.harvest[0], s.harvest[1]) && inRange(nextMonth, s.harvest[0], s.harvest[1])
            );
            if (opening.length === 0 && harvestSoon.length === 0) return null;
            return (
              <Card>
                <ul className="space-y-2">
                  {opening.map((s) => (
                    <li key={s.id} className="flex items-start gap-2">
                      <span className="badge badge-green shrink-0 mt-0.5">{t("legend_sow")}</span>
                      <span>
                        <strong>{lang === "ta" ? s.nameTa : s.nameEn}</strong> ({s.cropEn}) —{" "}
                        <span className="text-[var(--color-ink-soft)]">{lang === "ta" ? s.noteTa : s.noteEn}</span>
                      </span>
                    </li>
                  ))}
                  {harvestSoon.map((s) => (
                    <li key={s.id} className="flex items-start gap-2">
                      <span className="badge badge-amber shrink-0 mt-0.5">{t("legend_harvest")}</span>
                      <span>
                        <strong>{lang === "ta" ? s.nameTa : s.nameEn}</strong> ({s.cropEn}) —{" "}
                        <span className="text-[var(--color-ink-soft)]">
                          {lang === "ta" ? "அறுவடை இயந்திரம்/கூலியை முன்பதிவு செய்யுங்கள்." : "Book your harvester and labour now."}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })()}
        </section>
      )}

      {/* Pest watch: what is striking this month, per TN pest seasonality */}
      {month != null && (() => {
        const watch = PEST_FORECAST.filter((w) => w.months.includes(month));
        if (watch.length === 0) return null;
        /* Scope the watch to the farmer's own crops when the ledger names
           plots — alerts for crops they don't grow are noise on the board. */
        const myCropIds = new Set(
          db.plots
            .map((p) => {
              const first = p.crop.trim().toLowerCase().split(" ")[0];
              const c = DOCTOR_CROPS.find(
                (x) => x.id === first || first.includes(x.id) || x.id.includes(first)
              );
              return c?.id;
            })
            .filter(Boolean) as string[]
        );
        const scoped = myCropIds.size > 0 ? watch.filter((w) => myCropIds.has(w.cropId)) : watch;
        const list = scoped.length > 0 ? scoped : watch;
        const isScoped = scoped.length > 0 && myCropIds.size > 0;
        return (
          <section className="mt-8" aria-label={lang === "ta" ? "பூச்சி கண்காணிப்பு" : "Pest watch"}>
            <SectionTitle>
              ⚠️ {lang === "ta" ? "இந்த மாதம் கவனிக்க வேண்டியவை" : "Pest watch this month"}
              <span className="text-base font-normal text-[var(--color-ink-soft)]">
                {isScoped
                  ? (lang === "ta" ? " · உங்கள் பயிர்களுக்கு" : " · for your crops")
                  : (lang === "ta" ? " · அனைத்துப் பயிர்களுக்கும்" : " · all crops")}
              </span>
            </SectionTitle>
            <Card>
              <p className={`text-sm text-[var(--color-ink-soft)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
                {lang === "ta"
                  ? "தமிழ்நாட்டில் இந்த மாதம் பொதுவாகத் தாக்கும் பூச்சி/நோய்கள். வயலைச் சுற்றிப் பாருங்கள் — ஆரம்பத்தில் பிடித்தால் மருந்து மிச்சம்."
                  : "What usually strikes Tamil Nadu fields this month. Walk your field — catching it early saves a spray."}
              </p>
              <ul className={`space-y-2.5 ${lang === "ta" ? "ta-fallback" : ""}`}>
                {list.map((w) => {
                  const c = DOCTOR_CROPS.find((x) => x.id === w.cropId);
                  return (
                    <li key={`${w.cropId}-${w.diagId ?? w.nameEn}`} className="flex items-start gap-2">
                      <span className="badge badge-coral shrink-0 mt-0.5">{lang === "ta" ? c?.nameTa : c?.nameEn}</span>
                      <span>
                        <strong>{lang === "ta" ? w.nameTa : w.nameEn}</strong> —{" "}
                        <span className="text-[var(--color-ink-soft)]">{lang === "ta" ? w.tipTa : w.tipEn}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <Link href="/doctor" className="btn btn-ghost mt-4">{t("doctor_teaser_cta")}</Link>
            </Card>
          </section>
        );
      })()}

      {/* Crop-doctor rechecks due this week */}
      <RechecksStrip />

      {/* Unfinished business across all four checklist systems */}
      <OpenWork />

      {/* 72-hour insurance reporting window — loudest alert on the board */}
      <ClaimAlert />

      {/* Deadlines */}
      <section className="mt-8">        <SectionTitle>⏰ {t("deadlines_title")}</SectionTitle>
        <Card className="!border-[var(--color-amber)]">
          <ul className={`space-y-2 ${lang === "ta" ? "ta-fallback" : ""}`}>
            <li>
              <strong>PMFBY</strong> — {lang === "ta"
                ? "ரபி (சம்பா/தாளடி) காப்பீடு பதிவு நவம்பர்–டிசம்பரில் முடியும். தஞ்சாவூர் 2026 காலக்கெடு: நவ 15."
                : "Rabi (samba/thaladi) crop-insurance enrolment closes Nov–Dec. Thanjavur's 2026 deadline: Nov 15."}{" "}
              {pmfbyLeft != null && (
                <span className={`badge ${pmfbyLeft < 0 ? "badge-coral" : pmfbyLeft <= 14 ? "badge-amber" : "badge-green"}`}>
                  {pmfbyLeft < 0
                    ? (lang === "ta" ? `${-pmfbyLeft} நாட்களுக்கு முன் முடிந்தது` : `closed ${-pmfbyLeft}d ago`)
                    : pmfbyLeft === 0
                      ? (lang === "ta" ? "இன்று முடிகிறது!" : "closes today!")
                      : (lang === "ta" ? `${pmfbyLeft} நாட்கள் உள்ளன` : `${pmfbyLeft}d left`)}
                </span>
              )}
            </li>
            <li>
              <strong>PM-KISAN</strong> — {lang === "ta"
                ? "e-KYC தவறினால் தவணை நிற்கும். இந்தப் பருவம் நிலையைச் சரிபார்க்கவும்."
                : "Instalments stop if e-KYC lapses. Check your status this season."}
            </li>
            {loansDue.map(({ loan, left }) => (
              <li key={loan.id}>
                <strong>{loan.bank}</strong> — {lang === "ta" ? `கடன் ₹${Math.round(loan.amount).toLocaleString("en-IN")}` : `Loan ${inr(loan.amount)}`}{" "}
                <span className={`badge ${left < 0 ? "badge-coral" : left <= 14 ? "badge-amber" : "badge-green"}`}>
                  {left < 0
                    ? (lang === "ta" ? `${-left} நாள் தாமதம்` : `${-left}d overdue`)
                    : left === 0
                      ? (lang === "ta" ? "இன்று கட்ட வேண்டும்!" : "due today!")
                      : (lang === "ta" ? `${left} நாள்` : `${left}d left`)}
                </span>
                {(left < 0 || left <= 14) && (
                  <span className="text-sm text-[var(--color-ink-soft)]">
                    {lang === "ta"
                      ? " — நேரத்தில் கட்டினால் 7% வட்டியில் 3% மானியம் (உண்மை 4% மட்டுமே)."
                      : " — on-time repayment keeps the 3% incentive (effective 4% instead of 7%)."}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <Link href="/schemes" className="btn btn-primary mt-4">{t("nav_schemes")}</Link>
        </Card>
      </section>

      {/* My reminders — user-set deadline countdowns */}
      <section className="mt-8" aria-label={lang === "ta" ? "என் நினைவூட்டல்கள்" : "My reminders"}>
        <SectionTitle>🔔 {lang === "ta" ? "என் நினைவூட்டல்கள்" : "My reminders"}</SectionTitle>
        <RemindersBlock />
      </section>

      {/* Agriculture officer — one tap to call when it matters */}
      <OfficerStrip />

      {/* Records backup */}
      <section className="mt-8 no-print" aria-label={lang === "ta" ? "பதிவுகள் காப்பு" : "Records backup"}>
        <SectionTitle>💾 {lang === "ta" ? "பதிவுகள் காப்பு" : "Records backup"}</SectionTitle>
        <BackupCard />
      </section>

      {/* Teasers */}
      <section className="mt-8 grid md:grid-cols-3 gap-4">
        <Card>
          <SectionTitle>🩺 {t("doctor_teaser_title")}</SectionTitle>
          <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>{t("doctor_teaser_body")}</p>
          <Link href="/doctor" className="btn btn-ghost">{t("doctor_teaser_cta")}</Link>
        </Card>
        <Card>
          <SectionTitle>📒 {t("ledger_teaser_title")}</SectionTitle>
          <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>{t("ledger_teaser_body")}</p>
          <Link href="/ledger" className="btn btn-ghost">{t("nav_ledger")}</Link>
        </Card>
        <Card>
          <SectionTitle>💰 {t("price_teaser_title")}</SectionTitle>
          <p className={`text-[var(--color-ink-soft)] mb-4 ${lang === "ta" ? "ta-fallback" : ""}`}>{t("price_teaser_body")}</p>
          <Link href="/prices" className="btn btn-ghost">{t("price_teaser_cta")}</Link>
        </Card>
      </section>

      <p className={`mt-8 text-xs text-[var(--color-ink-faint)] max-w-2xl ${lang === "ta" ? "ta-fallback" : ""}`}>
        {t("honesty_line")}
      </p>
    </div>
  );
}
