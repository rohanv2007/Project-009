"use client";

import React, { useEffect, useState } from "react";
import { useLang } from "../../lib/i18n";
import { useDB } from "../../lib/db";
import { SEASONS, MONTHS_EN, MONTHS_TA, SeasonBand } from "../../lib/data";
import { PageHead, Card, SectionTitle, BackHome } from "../../components/ui";

function range(a: number, b: number): number[] {
  const out: number[] = [];
  let m = a;
  while (true) { out.push(m); if (m === b) break; m = (m + 1) % 12; }
  return out;
}

type Cell = "sow" | "harvest" | "grow" | null;

function cellFor(seasonId: string, m: number): Cell {
  const s = SEASONS.find((x) => x.id === seasonId)!;
  if (range(s.sow[0], s.sow[1]).includes(m)) return "sow";
  if (range(s.harvest[0], s.harvest[1]).includes(m)) return "harvest";
  // growing = everything between sowing end and harvest start
  const afterSow = (s.sow[1] + 1) % 12;
  if (range(afterSow, s.harvest[0]).includes(m) && m !== s.sow[0] && m !== s.sow[1]) {
    // exclude the wrap tail beyond harvest
    const grow = range(afterSow, s.harvest[0]);
    if (grow.includes(m)) return "grow";
  }
  return null;
}

const CELL_STYLE: Record<Exclude<Cell, null>, string> = {
  sow: "bg-[var(--color-sage-wash)] border-[var(--color-sage)]",
  harvest: "bg-[var(--color-amber-wash)] border-[var(--color-amber)]",
  grow: "bg-[var(--color-accent-wash)] border-[var(--color-accent)]",
};

/* One-tap season reminders: from an expanded season row, the farmer drops a
   "Samba sowing" / "Samba harvest" reminder onto the home board's countdown
   list, dated at the next upcoming sowing/harvest month. */
function RemindButtons({ s }: { s: SeasonBand }) {
  const { lang } = useLang();
  const { db, addReminder } = useDB();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);
  if (!now) return null;
  const ta = lang === "ta";

  const iso = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const upcoming = (m: number) => {
    const y = now.getFullYear();
    return new Date(y, m, 1).getTime() <= now.getTime() ? iso(y + 1, m) : iso(y, m);
  };
  const mk = (kind: "sow" | "harvest") => {
    const m = kind === "sow" ? s.sow[0] : s.harvest[0];
    const date = upcoming(m);
    const label = ta
      ? kind === "sow" ? `${s.nameTa} விதைப்பு` : `${s.nameTa} அறுவடை`
      : kind === "sow" ? `${s.nameEn} sowing` : `${s.nameEn} harvest`;
    return { label, date };
  };
  const exists = (kind: "sow" | "harvest") => {
    const { label, date } = mk(kind);
    return db.reminders.some((r) => r.label === label && r.date === date);
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 no-print">
      {(["sow", "harvest"] as const).map((k) => {
        const { label, date } = mk(k);
        const done = exists(k);
        const dstr = new Date(date + "T00:00:00").toLocaleDateString(ta ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });
        return (
          <button
            key={k}
            onClick={() => { if (!done) addReminder({ label, date }); }}
            disabled={done}
            aria-pressed={done}
            title={dstr}
            className={`btn !min-h-0 !py-1.5 !px-3 text-sm ${done ? "btn-ghost opacity-60" : "btn-primary"}`}
          >
            {done
              ? (ta ? `✓ நினைவூட்டல் · ${dstr}` : `✓ Reminder · ${dstr}`)
              : (ta ? `🔔 ${k === "sow" ? "விதைப்பு" : "அறுவடை"} நினைவூட்டு · ${dstr}` : `🔔 Remind me at ${k} · ${dstr}`)}
          </button>
        );
      })}
    </div>
  );
}

/* Get ready this month: the calendar shows windows; this card says what
   to DO. Grounded in the season bands above and the scheme deadlines the
   schemes desk tracks (PMFBY kharif ~Jul 31, samba/thaladi Nov 15 in
   Thanjavur 2026). Three prep tasks per month, in both languages. */
const PREP: Record<number, { en: string[]; ta: string[] }> = {
  0: {
    en: ["Navarai is growing — keep the field flooded and watch for leaf folder.", "Samba harvest is wrapping up — sell before Feb; book your combine early.", "PMFBY rabi enrolment closes this month — check your insurance receipt."],
    ta: ["நவரை வளர்கிறது — நீரைப் பிடித்து, இலை சுருட்டுப் புழுவைக் கவனியுங்கள்.", "சம்பா அறுவடை முடிகிறது — பிப்ரவரிக்கு முன் விற்கவும்; இயந்திரத்தை முன்பதிவு செய்யுங்கள்.", "பரபி காப்பீடு பதிவு இந்த மாதம் முடிகிறது — ரசீதைச் சரிபார்க்கவும்."],
  },
  1: {
    en: ["Sornavari nursery prep — treat seeds and ready the nursery beds.", "Summer cotton sowing window (Feb–Mar) opens — check your seed stock.", "Send a soil sample for testing; results come back in time for kuruvai."],
    ta: ["சொர்ணவாரி நாற்று தயார் — விதை நேர்த்தி செய்து நாற்றுமேடையைத் தயார் செய்யுங்கள்.", "கோடை பருத்தி விதைப்புக் காலம் (பிப்–மார்) திறக்கிறது — விதை இருப்பைப் பார்க்கவும்.", "மண் மாதிரியைப் பரிசோதனைக்கு அனுப்புங்கள்; குறுவைக்கு முடிவு வந்துவிடும்."],
  },
  2: {
    en: ["Summer cotton is sowing — sow within the window, not late.", "Clear the last samba straw; repair bunds before the summer showers.", "Settle last season's ledger — know your real profit before planning kuruvai."],
    ta: ["கோடை பருத்தி விதைப்பு — காலத்தில் விதையுங்கள், தாமதம் வேண்டாம்.", "கடைசி சம்பா வைக்கோலை அகற்றி, கோடை மழைக்கு முன் வரப்பைப் பழுது பார்க்கவும்.", "கடந்த பருவக் கணக்கை முடியுங்கள் — குறுவைத் திட்டத்திற்கு முன் உண்மை லாபம் தெரிய வேண்டும்."],
  },
  3: {
    en: ["Navarai harvest this month — keep the moisture at ≤17% if selling to the DPC.", "Sornavari is sowing — transplant within the window.", "PM-KISAN: check this season's instalment landed; if not, check e-KYC first."],
    ta: ["நவரை அறுவடை இந்த மாதம் — DPC-க்கு விற்பதானால் ஈரப்பதம் 17%-க்குள்.", "சொர்ணவாரி விதைப்பு — காலத்தில் நடவு செய்யுங்கள்.", "PM-KISAN: இந்தப் பருவத் தவணை வந்ததா எனப் பார்க்கவும்; இல்லையேல் முதலில் e-KYC-ஐப் பார்க்கவும்."],
  },
  4: {
    en: ["Kuruvai nursery starts next month — plough and green-manure the field now.", "Pre-monsoon repairs: bunds, channels, pump set, sprayer serviced.", "Review your KCC limit — renewal before the kharif rush saves a branch visit."],
    ta: ["குறுவை நாற்று அடுத்த மாதம் — இப்போதே உழுது பசுந்தாள் உரமிடுங்கள்.", "முன்-பருவ பழுது: வரப்பு, வாய்க்கால், பம்ப்செட், தெளிப்பான் சரிபார்க்கவும்.", "KCC வரம்பை மதிப்பாய்வு செய்யுங்கள் — காரீஃப் அவசரத்திற்கு முன் புதுப்பித்தால் கிளை வேலை மிச்சம்."],
  },
  5: {
    en: ["Kuruvai sowing window (Jun–Jul) is open — sow early, sow even.", "Keep seed treatment fresh — treated seed is the cheapest insurance there is.", "Watch the monsoon forecast weekly; nursery and rain must not collide."],
    ta: ["குறுவை விதைப்புக் காலம் (ஜூன்–ஜூலை) திறந்தது — சீக்கிரம், சீராக விதையுங்கள்.", "விதை நேர்த்தி புதிதாக இருக்க வேண்டும் — மலிவான காப்பீடு அதுதான்.", "மழை முன்னறிவிப்பை வாரந்தோறும் பார்க்கவும்; நாற்றும் மழையும் மோதக் கூடாது."],
  },
  6: {
    en: ["Kuruvai is growing — first top-dressing of urea at tillering.", "PMFBY kharif enrolment closes ~Jul 31 — do not let it pass quietly.", "Walk for stem borer and leaf folder now; early catch saves a spray."],
    ta: ["குறுவை வளர்கிறது — தூர் கட்டும்போது முதல் யூரியா மேலுரம்.", "காரீஃப் காப்பீடு பதிவு ~ஜூலை 31-ல் முடிகிறது — தவறவிட வேண்டாம்.", "தண்டு துளைப்பான், இலை சுருட்டுப்புழுவுக்கு இப்போதே நடங்கள்; ஆரம்பம் மருந்தை மிச்சப்படுத்தும்."],
  },
  7: {
    en: ["Samba sowing window (Aug–Sep) opens — the season that decides the year.", "Winter cotton sowing (Aug–Sep) — soil moisture must be right at sowing.", "Get your PMFBY samba enrolment done with the kharif momentum."],
    ta: ["சம்பா விதைப்புக் காலம் (ஆக–செப்) திறக்கிறது — ஆண்டைத் தீர்மானிக்கும் பருவம்.", "குளிர் பருத்தி விதைப்பு (ஆக–செப்) — விதைக்கும்போது மண் ஈரம் சரியாக இருக்க வேண்டும்.", "காரீஃப் வேகத்தோடு சம்பா காப்பீடு பதிவையும் முடியுங்கள்."],
  },
  8: {
    en: ["Samba and thaladi sowing continue — nursery health decides everything.", "Pishanam sowing window — keep the nursery bed weed-free.", "PM-KISAN e-KYC check: instalments stop if it lapses; verify this month."],
    ta: ["சம்பா, தாளடி விதைப்பு தொடர்கிறது — நாற்று ஆரோக்கியமே எல்லாம்.", "பிசாணம் விதைப்புக் காலம் — நாற்றுமேடையைக் களையற்று வையுங்கள்.", "PM-KISAN e-KYC சரிபார்ப்பு: தவறினால் தவணை நிற்கும்; இந்த மாதம் உறுதி செய்யுங்கள்."],
  },
  9: {
    en: ["Crops are in the ground — the next 60 days are all about watching.", "Plan navarai sowing (Dec) — seed and nursery bed arrangements now.", "PMFBY rabi enrolment opens — file early, not in the November rush."],
    ta: ["பயிர்கள் நிலத்தில் — அடுத்த 60 நாள் கண்காணிப்புதான் எல்லாம்.", "நவரை விதைப்பை (டிச) திட்டமிடுங்கள் — விதை, நாற்றுமேடை ஏற்பாடு இப்போதே.", "ரபி காப்பீடு பதிவு திறக்கிறது — நவம்பர் அவசரத்திற்குக் காத்திருக்காமல் சீக்கிரம் செய்யுங்கள்."],
  },
  10: {
    en: ["⚠ PMFBY samba/thaladi enrolment closes Nov 15 (Thanjavur, 2026) — the year's last insurance window.", "Dry and store kuruvai grain properly — storage pests strike in winter.", "Book navarai nursery labour for December."],
    ta: ["⚠ சம்பா/தாளடி காப்பீடு பதிவு நவ 15-ல் முடிகிறது (தஞ்சாவூர், 2026) — ஆண்டின் கடைசி காப்பீடு வாய்ப்பு.", "குறுவை தானியத்தை நன்கு உலர்த்திச் சேமியுங்கள் — குளிரில் சேமிப்புப் பூச்சி தாக்கும்.", "டிசம்பர் நவரை நாற்றுக்கு ஆட்களை முன்பதிவு செய்யுங்கள்."],
  },
  11: {
    en: ["Navarai sowing window (Dec–Jan) is open — the bonus season.", "PMFBY rabi enrolment enters its final weeks — last call.", "Service the sprayer and thresher before the january harvest rush."],
    ta: ["நவரை விதைப்புக் காலம் (டிச–ஜன) திறந்தது — கூடுதல் பருவம்.", "ரபி காப்பீடு பதிவு இறுதி வாரங்கள் — கடைசி அழைப்பு.", "ஜனவரி அறுவடை அவசரத்திற்கு முன் தெளிப்பான், திரேசரைப் பழுது பார்க்கவும்."],
  },
};

function PrepCard() {
  const { lang } = useLang();
  const [month, setMonth] = useState<number | null>(null);
  useEffect(() => { setMonth(new Date().getMonth()); }, []);
  if (month == null) return null;
  const ta = lang === "ta";
  const tasks = PREP[month];
  return (
    <section className="mb-8" aria-label={ta ? "இந்த மாதம் செய்ய வேண்டியது" : "Get ready this month"}>
      <Card className="!border-[var(--color-accent)]">
        <SectionTitle>
          🧭 {ta ? "இந்த மாதம் — " : "This month — "}
          {(ta ? MONTHS_TA : MONTHS_EN)[month]}
        </SectionTitle>
        <p className={`text-sm text-[var(--color-ink-soft)] mb-3 ${ta ? "ta-fallback" : ""}`}>
          {ta
            ? "அட்டவணை காலங்களைக் காட்டும்; இது செய்ய வேண்டிய வேலைகள்:"
            : "The table below shows the windows; here is what to actually do:"}
        </p>
        <ol className={`list-decimal pl-5 space-y-2 ${ta ? "ta-fallback" : ""}`}>
          {(ta ? tasks.ta : tasks.en).map((x, i) => <li key={i}>{x}</li>)}
        </ol>
      </Card>
    </section>
  );
}

export default function CalendarPage() {
  const { t, lang } = useLang();
  const [nowMonth, setNowMonth] = useState<number | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { setNowMonth(new Date().getMonth()); }, []);
  const months = lang === "ta" ? MONTHS_TA : MONTHS_EN;

  const rice = SEASONS.filter((s) => s.cropEn === "Paddy");
  const other = SEASONS.filter((s) => s.cropEn !== "Paddy");

  const renderTable = (bands: typeof SEASONS, title: string) => (
    <Card className="mb-8 !p-0 overflow-hidden">
      <div className="card-pad !pb-2"><SectionTitle>{title}</SectionTitle></div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[640px]">
          <thead>
            <tr>
              <th className="text-left p-2 border-b border-[var(--color-line)] w-32"></th>
              {months.map((m, i) => (
                <th
                  key={m}
                  className={`p-1.5 border-b border-[var(--color-line)] font-bold text-[0.68rem] uppercase tracking-wide ${
                    i === nowMonth ? "text-[var(--color-accent-deep)] bg-[var(--color-accent-wash)]" : "text-[var(--color-ink-faint)]"
                  }`}
                >
                  {m.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bands.map((s) => (
              <React.Fragment key={s.id}>
              <tr
                className="border-b border-[var(--color-line)] cursor-pointer hover:bg-[var(--color-paper-deep)]/40"
                onClick={() => setOpen(open === s.id ? null : s.id)}
                aria-expanded={open === s.id}
              >
                <td className="p-2 font-semibold align-top">
                  <div className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="text-[var(--color-ink-faint)] text-xs">{open === s.id ? "▾" : "▸"}</span>
                    <span>
                      <div>{lang === "ta" ? s.nameTa : s.nameEn}</div>
                      <div className="text-xs font-normal text-[var(--color-ink-faint)]">{s.cropEn}</div>
                    </span>
                  </div>
                </td>
                {months.map((_, i) => {
                  const c = cellFor(s.id, i);
                  return (
                    <td key={i} className={`p-1 ${i === nowMonth ? "bg-[var(--color-accent-wash)]/50" : ""}`}>
                      {c && (
                        <div
                          className={`h-5 border-l-4 ${CELL_STYLE[c]}`}
                          title={`${lang === "ta" ? s.nameTa : s.nameEn} — ${t(`legend_${c}`)}`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
              {open === s.id && (
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-card)]">
                  <td colSpan={13} className="p-3">
                    <p className={`text-sm ${lang === "ta" ? "ta-fallback" : ""}`}>
                      <strong>{t("legend_sow")}:</strong> {months[s.sow[0]]} – {months[s.sow[1]]}
                      {" · "}<strong>{t("legend_harvest")}:</strong> {months[s.harvest[0]]} – {months[s.harvest[1]]}
                    </p>
                    <p className={`text-sm text-[var(--color-ink-soft)] mt-1 ${lang === "ta" ? "ta-fallback" : ""}`}>
                      {lang === "ta" ? s.noteTa : s.noteEn}
                    </p>
                    <RemindButtons s={s} />
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-pad !pt-3 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 border-l-4 border-[var(--color-sage)] bg-[var(--color-sage-wash)]" /> {t("legend_sow")}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 border-l-4 border-[var(--color-accent)] bg-[var(--color-accent-wash)]" /> {t("legend_grow")}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 border-l-4 border-[var(--color-amber)] bg-[var(--color-amber-wash)]" /> {t("legend_harvest")}</span>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHead kicker={t("cal_kicker")} title={t("cal_title")} sub={t("cal_sub")} />
      <PrepCard />
      {renderTable(rice, lang === "ta" ? "நெல் பருவங்கள்" : "Rice seasons")}
      {renderTable(other, lang === "ta" ? "பருத்தி & கரும்பு" : "Cotton & sugarcane")}

      <BackHome />
    </div>
  );
}
