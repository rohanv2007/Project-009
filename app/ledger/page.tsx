"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLang } from "../../lib/i18n";
import { useDB, inr } from "../../lib/db";
import { EXPENSE_CATEGORIES, SALE_CHANNELS, mspForCrop } from "../../lib/data";
import { PageHead, Card, SectionTitle, FieldRow, Modal, Empty, BackHome } from "../../components/ui";

type ModalKind = null | { kind: "plot" } | { kind: "expense"; plotId: string } | { kind: "sale"; plotId: string };

export default function LedgerPage() {
  const { t, lang } = useLang();
  const { db, addPlot, removePlot, addExpense, removeExpense, addSale, removeSale } = useDB();
  const [modal, setModal] = useState<ModalKind>(null);
  // Client-only date for the print header (Next 16 prerender rejects new Date()).
  const [printDate, setPrintDate] = useState<string | null>(null);
  useEffect(() => {
    setPrintDate(new Date().toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" }));
  }, [lang]);

  // form state
  const [pName, setPName] = useState("");
  const [pAcres, setPAcres] = useState("");
  const [pCrop, setPCrop] = useState("");
  const [eCat, setECat] = useState(EXPENSE_CATEGORIES[0].id);
  const [eAmt, setEAmt] = useState("");
  const [eNote, setENote] = useState("");
  const [sQty, setSQty] = useState("");
  const [sRate, setSRate] = useState("");
  const [sChannel, setSChannel] = useState(SALE_CHANNELS[0].id);
  const [sNote, setSNote] = useState("");

  const stats = useMemo(() => {
    return db.plots.map((p) => {
      const ex = db.expenses.filter((e) => e.plotId === p.id);
      const sa = db.sales.filter((s) => s.plotId === p.id);
      const spent = ex.reduce((a, e) => a + e.amount, 0);
      const quintals = sa.reduce((a, s) => a + s.quintals, 0);
      const earned = sa.reduce((a, s) => a + s.quintals * s.rate, 0);
      const profit = earned - spent;
      const perAcre = p.acres > 0 ? profit / p.acres : 0;
      const breakeven = quintals > 0 ? spent / quintals : null;
      return { plot: p, ex, sa, spent, quintals, earned, profit, perAcre, breakeven };
    });
  }, [db]);

  const totalSpent = stats.reduce((a, s) => a + s.spent, 0);
  const totalEarned = stats.reduce((a, s) => a + s.earned, 0);

  const catName = (id: string) => {
    const c = EXPENSE_CATEGORIES.find((x) => x.id === id);
    return c ? (lang === "ta" ? c.ta : c.en) : id;
  };

  // Crop -> MSP matching is the shared mspForCrop helper from lib/data.ts.

  const submitPlot = () => {
    if (!pName.trim() || !(parseFloat(pAcres) > 0)) return;
    addPlot({ name: pName.trim(), acres: parseFloat(pAcres), crop: pCrop.trim(), season: "" });
    setPName(""); setPAcres(""); setPCrop(""); setModal(null);
  };
  const submitExpense = (plotId: string) => {
    if (!(parseFloat(eAmt) > 0)) return;
    addExpense({ plotId, category: eCat, amount: parseFloat(eAmt), note: eNote.trim() });
    setEAmt(""); setENote(""); setModal(null);
  };
  const submitSale = (plotId: string) => {
    if (!(parseFloat(sQty) > 0) || !(parseFloat(sRate) > 0)) return;
    addSale({ plotId, quintals: parseFloat(sQty), rate: parseFloat(sRate), channel: sChannel, note: sNote.trim() });
    setSQty(""); setSRate(""); setSChannel(SALE_CHANNELS[0].id); setSNote(""); setModal(null);
  };

  const channelName = (id: string) => {
    const c = SALE_CHANNELS.find((x) => x.id === id);
    return c ? (lang === "ta" ? c.ta : c.en) : "";
  };

  return (
    <div>
      <PageHead kicker={t("ledger_kicker")} title={t("ledger_title")} sub={t("ledger_sub")} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card><p className="kicker mb-1">{lang === "ta" ? "நிலங்கள்" : "Plots"}</p><p className="headline text-2xl font-bold">{db.plots.length}</p></Card>
        <Card><p className="kicker mb-1">{t("total_spent")}</p><p className="headline text-2xl font-bold">{inr(totalSpent)}</p></Card>
        <Card><p className="kicker mb-1">{t("total_earned")}</p><p className="headline text-2xl font-bold">{inr(totalEarned)}</p></Card>
        <Card><p className="kicker mb-1">{t("profit_acre")}</p><p className="headline text-2xl font-bold">{inr(totalEarned - totalSpent)}</p><p className="text-xs text-[var(--color-ink-faint)]">{lang === "ta" ? "மொத்தம்" : "season total"}</p></Card>
      </div>

      {/* Where the money went — spend by category, pure-CSS bars. Farmers
          who see "fertilizer ate 40%" negotiate harder next season. */}
      {db.expenses.length > 0 && (() => {
        const byCat = EXPENSE_CATEGORIES.map((c) => ({
          ...c,
          total: db.expenses.filter((e) => e.category === c.id).reduce((a, e) => a + e.amount, 0),
        })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
        const max = byCat.length ? byCat[0].total : 1;
        return (
          <Card className="mb-8">
            <SectionTitle>💸 {lang === "ta" ? "பணம் எங்கே போனது" : "Where the money went"}</SectionTitle>
            <ul className="space-y-2.5">
              {byCat.map((c) => (
                <li key={c.id}>
                  <div className="flex justify-between gap-2 text-sm mb-1">
                    <span className={`font-semibold ${lang === "ta" ? "ta-fallback" : ""}`}>{lang === "ta" ? c.ta : c.en}</span>
                    <span className="text-[var(--color-ink-soft)]">{inr(c.total)}</span>
                  </div>
                  <div className="h-2.5 bg-[var(--color-line)]" role="img" aria-label={`${lang === "ta" ? c.ta : c.en}: ${inr(c.total)}`}>
                    <div className="h-2.5 bg-[var(--color-accent)]" style={{ width: `${Math.max(4, (c.total / max) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        );
      })()}

      {/* Where you earned best — average ₹/quintal per selling channel, pure-CSS
          bars. Where you sell is the biggest price lever most farmers have;
          this makes it visible instead of hidden in the free-text notes. */}
      {db.sales.length > 0 && (() => {
        const rows = SALE_CHANNELS.map((c) => {
          const mine = db.sales.filter((s) => s.channel === c.id);
          const q = mine.reduce((a, s) => a + s.quintals, 0);
          const earned = mine.reduce((a, s) => a + s.quintals * s.rate, 0);
          return { ...c, lots: mine.length, avg: q > 0 ? earned / q : null as number | null };
        }).filter((r) => r.avg !== null) as { id: string; en: string; ta: string; lots: number; avg: number }[];
        if (rows.length === 0) return null;
        const sorted = [...rows].sort((a, b) => b.avg - a.avg);
        const max = sorted[0].avg;
        const gap = sorted.length > 1 ? sorted[0].avg - sorted[sorted.length - 1].avg : 0;
        const unmarked = db.sales.filter((s) => !s.channel).length;
        return (
          <Card className="mb-8">
            <SectionTitle>⚖️ {lang === "ta" ? "எங்கே அதிகம் சம்பாதித்தீர்கள்" : "Where you earned best"}</SectionTitle>
            {unmarked > 0 && (
              <p className={`text-xs text-[var(--color-ink-faint)] mb-3 ${lang === "ta" ? "ta-fallback" : ""}`}>
                {lang === "ta"
                  ? `(${unmarked} பழைய விற்பனையில் விற்ற இடம் குறிக்கப்படவில்லை — அவை இந்த ஒப்பீட்டில் இல்லை.)`
                  : `(${unmarked} older ${unmarked === 1 ? "sale" : "sales"} ${unmarked === 1 ? "has" : "have"} no channel marked — not counted here.)`}
              </p>
            )}
            <ul className="space-y-2.5">
              {sorted.map((r) => (
                <li key={r.id}>
                  <div className="flex justify-between gap-2 text-sm mb-1">
                    <span className={`font-semibold ${lang === "ta" ? "ta-fallback" : ""}`}>{lang === "ta" ? r.ta : r.en}
                      <span className="font-normal text-[var(--color-ink-faint)]"> · {r.lots} {lang === "ta" ? "விற்பனை" : r.lots === 1 ? "sale" : "sales"}</span>
                    </span>
                    <span className="text-[var(--color-ink-soft)]">{inr(Math.round(r.avg))}{lang === "ta" ? "/கு" : "/q"}</span>
                  </div>
                  <div className="h-2.5 bg-[var(--color-line)]" role="img" aria-label={`${lang === "ta" ? r.ta : r.en}: ${inr(Math.round(r.avg))} per quintal`}>
                    <div className="h-2.5 bg-[var(--color-accent)]" style={{ width: `${Math.max(4, (r.avg / max) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            {gap > 0 && (
              <p className="text-sm mt-3 text-[var(--color-ink-soft)]">
                {lang === "ta"
                  ? `உங்கள் சிறந்த வழியும் மோசமான வழியும் இடையே குவிண்டாலுக்கு ₹${Math.round(gap)} வேறுபாடு — விற்கும் முன் விலையைச் சரிபார்க்கவும்.`
                  : `A ₹${Math.round(gap)}-per-quintal gap between your best and worst channel — always check prices before you load the cart.`}
              </p>
            )}
          </Card>
        );
      })()}

      <div className="no-print mb-6">
        <button className="btn btn-primary" onClick={() => setModal({ kind: "plot" })}>+ {t("add_plot")}</button>
      </div>

      {stats.length === 0 ? (
        <Empty>{t("empty_ledger")}</Empty>
      ) : (
        <div className="space-y-6">
          {stats.map(({ plot, ex, sa, spent, quintals, earned, profit, perAcre, breakeven }) => (
            <Card key={plot.id}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="headline text-xl font-bold">{plot.name}</h3>
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    {plot.acres} {lang === "ta" ? "ஏக்கர்" : "acres"}{plot.crop ? ` · ${plot.crop}` : ""}
                  </p>
                </div>
                <button
                  className="btn btn-ghost !min-h-0 !py-1 !px-2 text-xs no-print"
                  onClick={() => { if (window.confirm(t("delete") + "?")) removePlot(plot.id); }}
                >
                  {t("delete")}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                <div><p className="kicker !text-[0.65rem]">{t("total_spent")}</p><p className="font-bold">{inr(spent)}</p></div>
                <div><p className="kicker !text-[0.65rem]">{t("total_earned")}</p><p className="font-bold">{inr(earned)}</p></div>
                <div><p className="kicker !text-[0.65rem]">{t("profit_acre")}</p><p className={`font-bold ${profit >= 0 ? "text-[var(--color-sage)]" : "text-[var(--color-coral)]"}`}>{inr(perAcre)}</p></div>
                <div>
                  <p className="kicker !text-[0.65rem]">{t("breakeven")}</p>
                  <p className="font-bold">{breakeven == null ? "—" : `${inr(breakeven)}/q`}</p>
                </div>
              </div>

              {breakeven != null && (
                <p className="text-sm mb-4 text-[var(--color-ink-soft)]">
                  {(() => {
                    const msp = mspForCrop(plot.crop);
                    if (!msp) return lang === "ta"
                      ? `குவிண்டாலுக்கு ${inr(breakeven)}-க்கு மேல் விற்றால் லாபம்.`
                      : `Sell above ${inr(breakeven)}/quintal to stay profitable.`;
                    const ok = breakeven <= msp.msp;
                    return (
                      <span className={`badge ${ok ? "badge-green" : "badge-coral"}`}>
                        {lang === "ta" ? msp.cropTa : msp.cropEn} MSP ₹{msp.msp.toLocaleString("en-IN")} · {t("vs_msp")}: {ok ? (lang === "ta" ? "லாபம்" : "profitable") : (lang === "ta" ? "நட்டம்" : "loss-making")}
                      </span>
                    );
                  })()}
                </p>
              )}

              {ex.length > 0 && (
                <div className="mb-4" aria-label={lang === "ta" ? "செலவு பிரிவு" : "Cost breakdown"}>
                  <p className="kicker mb-2">{lang === "ta" ? "எங்கே செலவாகிறது" : "Where the money goes"}</p>
                  {(() => {
                    const byCat = new Map<string, number>();
                    ex.forEach((e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount));
                    const max = Math.max(...byCat.values());
                    return [...byCat.entries()]
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, amt]) => (
                        <div key={cat} className="flex items-center gap-2 mb-1.5 text-sm">
                          <span className="w-32 shrink-0 truncate text-[var(--color-ink-soft)]">{catName(cat)}</span>
                          <div className="flex-1 h-3 bg-[var(--color-paper-deep)]" role="img" aria-label={`${catName(cat)} ${inr(amt)}`}>
                            <div className="h-3 bg-[var(--color-accent)]" style={{ width: `${Math.max(4, (amt / max) * 100)}%` }} />
                          </div>
                          <span className="w-20 text-right font-semibold shrink-0">{inr(amt)}</span>
                        </div>
                      ));
                  })()}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm">{lang === "ta" ? "செலவுகள்" : "Expenses"}</p>
                    <button className="btn btn-ghost !min-h-0 !py-1 !px-2 text-xs no-print" onClick={() => setModal({ kind: "expense", plotId: plot.id })}>+ {t("add_expense")}</button>
                  </div>
                  {ex.length === 0 ? <p className="text-sm text-[var(--color-ink-faint)]">—</p> : (
                    <ul className="space-y-1 text-sm">
                      {ex.map((e) => (
                        <li key={e.id} className="flex items-center justify-between gap-2 border-b border-[var(--color-line)] pb-1">
                          <span>{catName(e.category)}{e.note ? ` · ${e.note}` : ""}</span>
                          <span className="flex items-center gap-2">
                            <strong>{inr(e.amount)}</strong>
                            <button className="text-[var(--color-coral)] no-print" onClick={() => removeExpense(e.id)} aria-label={t("delete")}>✕</button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm">{lang === "ta" ? "விற்பனை" : "Sales"}</p>
                    <button className="btn btn-ghost !min-h-0 !py-1 !px-2 text-xs no-print" onClick={() => setModal({ kind: "sale", plotId: plot.id })}>+ {t("add_sale")}</button>
                  </div>
                  {sa.length === 0 ? <p className="text-sm text-[var(--color-ink-faint)]">—</p> : (
                    <ul className="space-y-1 text-sm">
                      {sa.map((s) => {
                        const saleMsp = mspForCrop(plot.crop);
                        const belowMsp = saleMsp != null && s.rate < saleMsp.msp;
                        return (
                          <li key={s.id} className="flex items-center justify-between gap-2 border-b border-[var(--color-line)] pb-1">
                            <span>
                              {s.quintals} q × {inr(s.rate)}{s.channel ? ` · ${channelName(s.channel)}` : ""}{s.note ? ` · ${s.note}` : ""}
                              {belowMsp && (
                                <span className="badge badge-coral ml-2 !text-[0.65rem]">
                                  {lang === "ta" ? `MSP-க்குக் கீழ் (₹${saleMsp.msp.toLocaleString("en-IN")})` : `below MSP ₹${saleMsp.msp.toLocaleString("en-IN")}`}
                                </span>
                              )}
                            </span>
                            <span className="flex items-center gap-2">
                              <strong>{inr(s.quintals * s.rate)}</strong>
                              <button className="text-[var(--color-coral)] no-print" onClick={() => removeSale(s.id)} aria-label={t("delete")}>✕</button>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal?.kind === "plot" && (
        <Modal title={t("add_plot")} onClose={() => setModal(null)}>
          <FieldRow label={t("plot_name_ph")}>
            <input className="field" value={pName} onChange={(e) => setPName(e.target.value)} placeholder={t("plot_name_ph")} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label={t("acres_ph")}>
              <input className="field" type="number" min="0" step="0.5" value={pAcres} onChange={(e) => setPAcres(e.target.value)} inputMode="decimal" />
            </FieldRow>
            <FieldRow label={t("crop_ph")}>
              <input className="field" value={pCrop} onChange={(e) => setPCrop(e.target.value)} placeholder={lang === "ta" ? "நெல்" : "Paddy"} />
            </FieldRow>
          </div>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-primary" onClick={submitPlot}>{t("save")}</button>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>{t("cancel")}</button>
          </div>
        </Modal>
      )}

      {modal?.kind === "expense" && (
        <Modal title={t("add_expense")} onClose={() => setModal(null)}>
          <FieldRow label={lang === "ta" ? "வகை" : "Category"}>
            <select className="field" value={eCat} onChange={(e) => setECat(e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{lang === "ta" ? c.ta : c.en}</option>)}
            </select>
          </FieldRow>
          <FieldRow label={t("amount_ph")}>
            <input className="field" type="number" min="0" value={eAmt} onChange={(e) => setEAmt(e.target.value)} inputMode="decimal" />
          </FieldRow>
          <FieldRow label={t("note_ph")}>
            <input className="field" value={eNote} onChange={(e) => setENote(e.target.value)} />
          </FieldRow>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-primary" onClick={() => submitExpense(modal.plotId)}>{t("save")}</button>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>{t("cancel")}</button>
          </div>
        </Modal>
      )}

      {modal?.kind === "sale" && (
        <Modal title={t("add_sale")} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label={t("qty_ph")}>
              <input className="field" type="number" min="0" step="0.5" value={sQty} onChange={(e) => setSQty(e.target.value)} inputMode="decimal" />
            </FieldRow>
            <FieldRow label={t("rate_ph")}>
              <input className="field" type="number" min="0" value={sRate} onChange={(e) => setSRate(e.target.value)} inputMode="numeric" />
            </FieldRow>
          </div>
          <FieldRow label={lang === "ta" ? "விற்ற இடம்" : "Where sold"}>
            <select className="field" value={sChannel} onChange={(e) => setSChannel(e.target.value)}>
              {SALE_CHANNELS.map((c) => <option key={c.id} value={c.id}>{lang === "ta" ? c.ta : c.en}</option>)}
            </select>
          </FieldRow>
          <FieldRow label={t("note_ph")}>
            <input className="field" value={sNote} onChange={(e) => setSNote(e.target.value)} placeholder={lang === "ta" ? "எ.கா. மண்டி / கொள்முதல் நிலையம்" : "e.g. mandi / procurement centre"} />
          </FieldRow>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-primary" onClick={() => submitSale(modal.plotId)}>{t("save")}</button>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>{t("cancel")}</button>
          </div>
        </Modal>
      )}

      {/* Print-only season summary for the family file */}
      {printDate && (
      <div className="print-only mt-8">
        <h2 className="headline text-2xl font-bold mb-1">{lang === "ta" ? "பயிர் — பருவக் கணக்கு சுருக்கம்" : "Payir — Season Account Summary"}</h2>
        <p className="text-sm mb-4">{printDate}</p>
        <table className="grid-table">
          <thead>
            <tr><th>{lang === "ta" ? "நிலம்" : "Plot"}</th><th>{lang === "ta" ? "ஏக்கர்" : "Acres"}</th><th>{t("total_spent")}</th><th>{t("total_earned")}</th><th>{lang === "ta" ? "லாபம்/நட்டம்" : "Profit/Loss"}</th></tr>
          </thead>
          <tbody>
            {stats.map(({ plot, spent, earned, profit }) => (
              <tr key={plot.id}>
                <td>{plot.name}{plot.crop ? ` (${plot.crop})` : ""}</td>
                <td>{plot.acres}</td>
                <td>{inr(spent)}</td>
                <td>{inr(earned)}</td>
                <td>{inr(profit)}</td>
              </tr>
            ))}
            <tr>
              <td><strong>{lang === "ta" ? "மொத்தம்" : "Total"}</strong></td>
              <td><strong>{stats.reduce((a, s) => a + s.plot.acres, 0)}</strong></td>
              <td><strong>{inr(totalSpent)}</strong></td>
              <td><strong>{inr(totalEarned)}</strong></td>
              <td><strong>{inr(totalEarned - totalSpent)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      )}
      <div className="no-print mt-6">
        <button className="btn btn-ghost" onClick={() => window.print()}>
          🖨️ {lang === "ta" ? "பருவ சுருக்கத்தை அச்சிடு" : "Print season summary"}
        </button>
      </div>

      <BackHome />
    </div>
  );
}
