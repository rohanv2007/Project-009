"use client";

/* Tiny localStorage store. Everything stays on the family's device —
   no account, no backend, no network calls. */

import React, { createContext, useContext, useEffect, useState } from "react";

export interface Plot {
  id: string;
  name: string;
  acres: number;
  crop: string;
  season: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  plotId: string;
  category: string;
  amount: number;
  note: string;
  at: string;
}

export interface Sale {
  id: string;
  plotId: string;
  quintals: number;
  rate: number;
  channel: string; // SALE_CHANNELS id; "" for legacy records
  note: string;
  at: string;
}

export type SchemeStatus = "not" | "progress" | "done" | "na";

export type DoctorStatus = "watching" | "treated" | "resolved";

export interface DoctorEntry {
  id: string;
  crop: string;
  diagId: string;
  at: string;
  status: DoctorStatus;
  recheckAt: string; // YYYY-MM-DD — "check this spot again by"
  outcome: string; // free-text "what worked" — the personal knowledge base for next season
}

export interface Reminder {
  id: string;
  label: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface ClaimLog {
  id: string;
  crop: string;
  lossType: string; // flood | drought | pest | storm | other
  note: string;
  at: string; // ISO timestamp when damage was first noticed
  createdAt: string;
}

/* KCC / farm loan tracker: short-term crop loans run at concessional 7%;
   a 3% prompt-repayment incentive brings the effective rate to 4%
   (RBI/MISS circular, FY2025-26). Discount applies up to ₹3 lakh. */
export interface FarmLoan {
  id: string;
  bank: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  note: string;
  createdAt: string;
}

/* Trader quote book: every price a trader or mandi names, logged before the
   farmer decides. Compared against MSP at render time. */
export interface PriceQuote {
  id: string;
  crop: string; // MSP_2026_27 cropEn key
  rate: number; // ₹ per quintal quoted
  note: string; // e.g. "Kumbakonam mandi"
  at: string; // ISO
}

export interface AgriOfficer {
  name: string;
  phone: string;
}

/* Generic persisted tick-boxes, keyed by checklist id: "confirm:<diagId>",
   "evidence:<claimId>", "harvest", "procure"... All checklists share this. */
interface DB {
  plots: Plot[];
  expenses: Expense[];
  sales: Sale[];
  schemeStatus: Record<string, SchemeStatus>;
  doctorHistory: DoctorEntry[];
  reminders: Reminder[];
  kisanInstalments: Record<string, string>; // "FY:n" -> date received (presence = received)
  claimLogs: ClaimLog[];
  priceQuotes: PriceQuote[];
  farmLoans: FarmLoan[];
  agriOfficer: AgriOfficer;
  checks: Record<string, boolean>;
}

const KEY = "payir:db:v1";
const BACKUP_VERSION = 1;

const EMPTY: DB = { plots: [], expenses: [], sales: [], schemeStatus: {}, doctorHistory: [], reminders: [], kisanInstalments: {}, claimLogs: [], priceQuotes: [], farmLoans: [], agriOfficer: { name: "", phone: "" }, checks: {} };

function sanitize(parsed: any): DB {
  if (!parsed || typeof parsed !== "object") return EMPTY;
  // Backup files wrap the db in { payirBackup: 1, db: {...} }.
  const body = parsed.db && typeof parsed.db === "object" ? parsed.db : parsed;
  const officer = body.agriOfficer && typeof body.agriOfficer === "object" ? body.agriOfficer : {};
  return {
    plots: Array.isArray(body.plots) ? body.plots : [],
    expenses: Array.isArray(body.expenses) ? body.expenses : [],
    sales: Array.isArray(body.sales)
      ? body.sales.map((s: any) => ({ ...s, channel: typeof s.channel === "string" ? s.channel : "" }))
      : [],
    schemeStatus: body.schemeStatus && typeof body.schemeStatus === "object" ? body.schemeStatus : {},
    doctorHistory: Array.isArray(body.doctorHistory)
      ? body.doctorHistory.map((h: any) => ({ ...h, outcome: typeof h.outcome === "string" ? h.outcome : "" }))
      : [],
    reminders: Array.isArray(body.reminders) ? body.reminders : [],
    kisanInstalments: body.kisanInstalments && typeof body.kisanInstalments === "object" ? body.kisanInstalments : {},
    claimLogs: Array.isArray(body.claimLogs) ? body.claimLogs : [],
    priceQuotes: Array.isArray(body.priceQuotes) ? body.priceQuotes : [],
    farmLoans: Array.isArray(body.farmLoans) ? body.farmLoans : [],
    agriOfficer: { name: typeof officer.name === "string" ? officer.name : "", phone: typeof officer.phone === "string" ? officer.phone : "" },
    checks: body.checks && typeof body.checks === "object" ? body.checks : {},
  };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return sanitize(JSON.parse(raw));
  } catch {
    return EMPTY;
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const DBCtx = createContext<{
  db: DB;
  addPlot: (p: Omit<Plot, "id" | "createdAt">) => void;
  removePlot: (id: string) => void;
  addExpense: (e: Omit<Expense, "id" | "at">) => void;
  removeExpense: (id: string) => void;
  addSale: (s: Omit<Sale, "id" | "at">) => void;
  removeSale: (id: string) => void;
  setSchemeStatus: (schemeId: string, s: SchemeStatus) => void;
  logDiagnosis: (crop: string, diagId: string) => void;
  setDiagnosisStatus: (id: string, s: DoctorStatus) => void;
  setDiagnosisRecheck: (id: string, date: string) => void;
  setDiagnosisOutcome: (id: string, note: string) => void;
  removeDiagnosis: (id: string) => void;
  addReminder: (r: Omit<Reminder, "id" | "createdAt">) => void;
  removeReminder: (id: string) => void;
  toggleKisan: (key: string) => void;
  addClaimLog: (c: Omit<ClaimLog, "id" | "createdAt">) => void;
  removeClaimLog: (id: string) => void;
  addQuote: (q: Omit<PriceQuote, "id" | "at">) => void;
  removeQuote: (id: string) => void;
  addLoan: (l: Omit<FarmLoan, "id" | "createdAt">) => void;
  removeLoan: (id: string) => void;
  setAgriOfficer: (o: AgriOfficer) => void;
  setCheck: (key: string, val: boolean) => void;
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
}>({
  db: EMPTY,
  addPlot: () => {},
  removePlot: () => {},
  addExpense: () => {},
  removeExpense: () => {},
  addSale: () => {},
  removeSale: () => {},
  setSchemeStatus: () => {},
  logDiagnosis: () => {},
  setDiagnosisStatus: () => {},
  setDiagnosisRecheck: () => {},
  setDiagnosisOutcome: () => {},
  removeDiagnosis: () => {},
  addReminder: () => {},
  removeReminder: () => {},
  toggleKisan: () => {},
  addClaimLog: () => {},
  removeClaimLog: () => {},
  addQuote: () => {},
  removeQuote: () => {},
  addLoan: () => {},
  removeLoan: () => {},
  setAgriOfficer: () => {},
  setCheck: () => {},
  exportBackup: () => "",
  importBackup: () => false,
});

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDb(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
  }, [db, ready]);

  const api = {
    db,
    addPlot: (p: Omit<Plot, "id" | "createdAt">) =>
      setDb((d) => ({ ...d, plots: [...d.plots, { ...p, id: uid(), createdAt: new Date().toISOString() }] })),
    removePlot: (id: string) =>
      setDb((d) => ({
        ...d,
        plots: d.plots.filter((p) => p.id !== id),
        expenses: d.expenses.filter((e) => e.plotId !== id),
        sales: d.sales.filter((s) => s.plotId !== id),
      })),
    addExpense: (e: Omit<Expense, "id" | "at">) =>
      setDb((d) => ({ ...d, expenses: [...d.expenses, { ...e, id: uid(), at: new Date().toISOString() }] })),
    removeExpense: (id: string) =>
      setDb((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) })),
    addSale: (s: Omit<Sale, "id" | "at">) =>
      setDb((d) => ({ ...d, sales: [...d.sales, { ...s, id: uid(), at: new Date().toISOString() }] })),
    removeSale: (id: string) =>
      setDb((d) => ({ ...d, sales: d.sales.filter((s) => s.id !== id) })),
    setSchemeStatus: (schemeId: string, s: SchemeStatus) =>
      setDb((d) => ({ ...d, schemeStatus: { ...d.schemeStatus, [schemeId]: s } })),
    logDiagnosis: (crop: string, diagId: string) =>
      setDb((d) => ({
        ...d,
        doctorHistory: [{
          id: uid(), crop, diagId, at: new Date().toISOString(), status: "watching" as DoctorStatus,
          recheckAt: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
          outcome: "",
        }, ...d.doctorHistory].slice(0, 30),
      })),
    setDiagnosisStatus: (id: string, s: DoctorStatus) =>
      setDb((d) => ({
        ...d,
        doctorHistory: d.doctorHistory.map((h) => (h.id === id ? { ...h, status: s } : h)),
      })),
    setDiagnosisRecheck: (id: string, date: string) =>
      setDb((d) => ({
        ...d,
        doctorHistory: d.doctorHistory.map((h) => (h.id === id ? { ...h, recheckAt: date } : h)),
      })),
    setDiagnosisOutcome: (id: string, note: string) =>
      setDb((d) => ({
        ...d,
        doctorHistory: d.doctorHistory.map((h) => (h.id === id ? { ...h, outcome: note.slice(0, 500) } : h)),
      })),
    removeDiagnosis: (id: string) =>
      setDb((d) => ({
        ...d,
        doctorHistory: d.doctorHistory.filter((h) => h.id !== id),
      })),
    addReminder: (r: Omit<Reminder, "id" | "createdAt">) =>
      setDb((d) => ({ ...d, reminders: [...d.reminders, { ...r, id: uid(), createdAt: new Date().toISOString() }] })),
    removeReminder: (id: string) =>
      setDb((d) => ({ ...d, reminders: d.reminders.filter((r) => r.id !== id) })),
    toggleKisan: (key: string) =>
      setDb((d) => {
        const next = { ...d.kisanInstalments };
        if (next[key]) delete next[key];
        else next[key] = new Date().toISOString().slice(0, 10);
        return { ...d, kisanInstalments: next };
      }),
    addClaimLog: (c: Omit<ClaimLog, "id" | "createdAt">) =>
      setDb((d) => ({ ...d, claimLogs: [{ ...c, id: uid(), createdAt: new Date().toISOString() }, ...d.claimLogs].slice(0, 20) })),
    removeClaimLog: (id: string) =>
      setDb((d) => ({ ...d, claimLogs: d.claimLogs.filter((c) => c.id !== id) })),
    addQuote: (q: Omit<PriceQuote, "id" | "at">) =>
      setDb((d) => ({ ...d, priceQuotes: [{ ...q, id: uid(), at: new Date().toISOString() }, ...d.priceQuotes].slice(0, 30) })),
    removeQuote: (id: string) =>
      setDb((d) => ({ ...d, priceQuotes: d.priceQuotes.filter((q) => q.id !== id) })),
    addLoan: (l: Omit<FarmLoan, "id" | "createdAt">) =>
      setDb((d) => ({ ...d, farmLoans: [{ ...l, id: uid(), createdAt: new Date().toISOString() }, ...d.farmLoans].slice(0, 10) })),
    removeLoan: (id: string) =>
      setDb((d) => ({ ...d, farmLoans: d.farmLoans.filter((l) => l.id !== id) })),
    setAgriOfficer: (o: AgriOfficer) =>
      setDb((d) => ({ ...d, agriOfficer: { name: o.name.slice(0, 80), phone: o.phone.replace(/[^\d+\-\s]/g, "").slice(0, 20) } })),
    setCheck: (key: string, val: boolean) =>
      setDb((d) => {
        const next = { ...d.checks };
        if (val) next[key] = true;
        else delete next[key];
        return { ...d, checks: next };
      }),
    exportBackup: () => JSON.stringify({ payirBackup: BACKUP_VERSION, exportedAt: new Date().toISOString(), db }),
    importBackup: (json: string) => {
      try {
        const parsed = JSON.parse(json);
        const body = parsed.db && typeof parsed.db === "object" ? parsed.db : parsed;
        if (!body || typeof body !== "object") return false;
        // Must look like a Payir backup or a raw db: at least one known collection.
        const known = ["plots", "expenses", "sales", "doctorHistory", "reminders", "kisanInstalments", "claimLogs", "schemeStatus", "priceQuotes", "farmLoans", "agriOfficer", "checks"];
        if (!known.some((k) => k in body)) return false;
        setDb(sanitize(parsed));
        return true;
      } catch {
        return false;
      }
    },
  };

  return <DBCtx.Provider value={api}>{children}</DBCtx.Provider>;
}

export function useDB() {
  return useContext(DBCtx);
}

export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
