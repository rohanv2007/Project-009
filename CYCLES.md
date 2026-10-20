# CYCLES.md — Payir (internal build log, not user-facing)

Project 009. Local only — nothing pushed, nothing deployed, nothing messaged.
Each cycle ends with `npm run build` green before the next begins.

## Cycle 1 — 23:35 IST
- Kickoff: scaffolded Next.js 16 + TS + Tailwind 4 app in `2026-10-19/`; wrote PROJECT_BRIEF.md; built the full v1: bilingual (EN/தமிழ்) shell with language toggle, home season board (live month sowing/harvest from the TN calendar, stats, deadline nudges), price board (all 15 kharif MSP 2026-27 rows with hikes, filters, fair-price checklist), crop doctor (3-question symptom flow over 16 curated diagnoses × 5 crops with organic/chemical/prevent tabs + saved notes), 12-month season calendar grid with "now" column, ledger (plots, expenses by category, sales, per-acre profit, break-even vs MSP badge), schemes desk (6 schemes with eligibility/docs/deadlines/how-to + personal status tracking). localStorage only.
- `npm run build` green.
- Deployed: no

## Cycle 2 — 23:52 IST
- Crop Doctor expansion: added coconut (தென்னை) with 3 diagnoses (bud rot, rhinoceros beetle, eriophyid mite) — 19 diagnoses across 6 crops now. Also fixed the pre-symptom state: before part/symptoms are picked, the page now shows a browsable library list for the chosen crop instead of every diagnosis at 0% match.
- `npm run build` green.
- Deployed: no

## Cycle 3 — 00:04 IST
- Price board: added a harvest revenue planner — pick crop, acres, expected yield and price; it shows harvest quintals, revenue at your price, and revenue at MSP with the exact "left on the table" gap highlighted in coral (or "Above MSP ✓" in green). Makes the MSP floor tangible before the trader names a price.
- `npm run build` green.
- Deployed: no

## Cycle 4 — 00:14 IST
- Ledger depth: each plot card now shows a "Where the money goes" category breakdown with proportional bars (sorted, labelled, screen-reader friendly), plus a print-only season summary table (plot/acres/spent/earned/profit + totals) with a "Print season summary" button — a paper copy for the family file or the bank.
- `npm run build` green.
- Deployed: no

## Cycle 5 — 00:26 IST
- Home board: added an "In the next 30 days" action list — sowing windows opening next month (with the season's field note) and harvests arriving next month (with a "book harvester/labour now" nudge), computed live from the TN season calendar. Also fixed a stray edit artifact in the deadlines section markup.
- `npm run build` green.
- Deployed: no

## Cycle 6 — 00:34 IST
- Schemes desk: added a coral-bordered "Crop damaged? The 72-hour rule" emergency card at the top — the 5-step loss-report checklist (geotagged photos, Crop Insurance App report, docket number, bank intimation, helpline 14447), fully bilingual. This is the researched step that decides whether a PMFBY claim lives.
- `npm run build` green.
- Deployed: no

## Cycle 7 — 00:43 IST
- Crop Doctor: added a "Print for the officer" button on every diagnosis result — renders a print-only slip (crop, diagnosis, urgency, observed symptoms, all three control lists, the confirm-with-officer honesty line) so the farmer can carry paper to the block agriculture office instead of trying to explain from a phone screen.
- `npm run build` green.
- Deployed: no

## Cycle 8 — 00:52 IST
- QA sweep: replaced the fragile `t("my_status") === "My status"` language hack in the home stats with a proper `stat_schemes_sub` i18n key; verified zero internal-ID leaks in app/components/lib (no "009" or "Project 00N" anywhere in UI code); gated the "nothing this month" empty state on the client clock being loaded so it never flashes before mount. All 97 UI strings have Tamil.
- `npm run build` green.
- Deployed: no

## Cycle 9 — 01:01 IST
- Season calendar: rows are now tappable — expanding a season reveals its sowing/harvest months in words plus the field note, so the grid is glanceable and the detail is one tap away on a phone. Removed the now-redundant static field-notes card below the tables.
- `npm run build` green.
- Deployed: no

## Cycle 10 — 01:10 IST
- Correctness fix: the home "profit per acre" stat was showing the season total, not per-acre — now divides by total plot acres (falls back to total when no plots exist). Also removed the field-notes card made redundant by cycle 9's expandable calendar rows.
- `npm run build` green.
- Deployed: no

## Cycle 11 — 01:22 IST
- Home board: added "My reminders" — the farmer sets their own deadlines (district insurance date, loan due date, subsidy day) with a date picker; Payir shows a live countdown badge (green/amber within 7 days/coral overdue) and lets them delete. Stored in localStorage; survives reloads.
- `npm run build` green.
- Deployed: no

## Cycle 12 — 01:30 IST
- Crop Doctor transparency: every result card now lists the observed symptoms it matched as green ✓ chips, so the farmer can see exactly why this diagnosis was suggested and judge it against what is in the field.
- `npm run build` green.
- Deployed: no

## Cycle 13 — 23:59 IST (watchdog recovery)
- Crop Doctor dead-end fix: when a plant-part + symptom combination matches nothing, the page now falls back to symptom matches that ignore the part filter, labelled honestly ("Nothing fit the plant part you picked — but these match your symptoms"), instead of a bare "no match". Also added a Clear button on the part question so the farmer can widen the search in one tap. Result cards were refactored into a shared renderer so strict and relaxed results behave identically (tabs, save-to-notes, print slip).
- `npm run build` green.
- Deployed: no

## Cycle 14 — 00:07 IST (watchdog recovery)
- Ledger: every sale line now carries a "below MSP ₹X" coral badge when the recorded rate undercuts the MSP for that plot's crop (matching reused from the break-even badge, hoisted into a shared `mspForCrop` helper). A farmer scanning their sales list sees at a glance which deals lost money to the trader vs MSP.
- `npm run build` green.
- Deployed: no

## Cycle 15 — 00:13 IST (watchdog recovery)
- Home deadlines: the PMFBY rabi enrolment line now carries a live countdown badge to the Nov 15, 2026 Thanjavur deadline (green → amber under 14 days → coral after it closes, bilingual, "26d left" style). Countdown reads the clock client-side only — the first attempt called `daysUntil` during render and broke the Next 16 prerender; fixed by gating behind mounted state.
- `npm run build` green.
- Deployed: no

## Cycle 16 — 00:16 IST
- Field guide page (Plantix-researched: their fertilizer calculator is the flagship beyond diagnosis): new "Field guide" nav tab with a fertilizer calculator — pick one of 6 crops, enter acres (or palm/plant count for banana/coconut), get exact DAP/urea/MOP kg + bag counts from TNAU blanket doses (DAP-first nutrient maths: P via DAP 18-46-0, remaining N via urea, K via MOP), a bilingual split-dose schedule per crop, and the "soil test beats blanket dose" honesty line. All bilingual, mobile-first.
- `npm run build` green.
- Deployed: no

## Cycle 17 — 00:17 IST
- Pest forecast (Plantix "disease alerts" analogue, offline): new "Pest watch this month" section on the home board — 16 curated TN pest-seasonality entries (PEST_FORECAST in data.ts) filtered by the live month, each with the crop badge, the threat name, and one prevention tip, plus a Crop Doctor CTA. October shows blast season, tungro vector watch, pink bollworm peak, rust window, etc.
- `npm run build` green.
- Deployed: no

## Cycle 18 — 00:18 IST
- Crop Doctor depth (real IPM practice): every diagnosis card now carries a green "Spray only if" threshold badge (TREAT_RULES in data.ts — 19 bilingual economic thresholds, e.g. dead hearts >5%, trap catches >8 moths/night, "ANY red rot — rogue it"), plus a new "How to count before you spray" section teaching the 5-step zig-zag 100-plant field count. The card already says when to spray; now it says when NOT to.
- `npm run build` green.
- Deployed: no

## Cycle 19 — 00:19 IST
- Follow-up tracking (researched field workflow: "mark the spot and check again in 1–2 days"): saved diagnoses are now a "My field watch" list — each entry carries a status (Watching → Treated → Resolved), an auto-set re-check date 3 days out with live countdown/overdue badges, a "+3 days" snooze, and removal. Old entries without status default to Watching. Stored in the same localStorage DB.
- `npm run build` green.
- Deployed: no

## Cycle 20 — 00:20 IST
- Field guide, second tab (Plantix "cultivation tips across the crop cycle"): "Crop playbook" — bilingual stage-wise timelines for all 6 crops (PLAYBOOK in data.ts: 4–5 stages each with timing + concrete tasks, e.g. paddy's "never let the field dry at flowering", cotton's "destroy stalks by January", coconut's basin rules). Timeline cards with numbered stage badges, sharing the crop picker with the fertilizer tab.
- `npm run build` green.
- Deployed: no

## Cycle 21 — 00:21 IST
- Schemes desk: PM-KISAN instalment tracker — "This year's ₹6,000" card with the three ₹2,000 instalment periods (Apr–Jul, Aug–Nov, Dec–Mar) for the current Indian FY (computed client-side), one-tap "mark received" with date, a running ₹ received/₹6,000 total, and the e-KYC nudge when an instalment is missing. Stored in localStorage; old DBs migrate cleanly.
- `npm run build` green.
- Deployed: no

## Cycle 22 — 00:22 IST
- Price board: new "Sell now or store?" decision card between the revenue planner and the fair-price checklist — five bilingual rules for the harvest-glut dilemma (sell if cash is urgent or moisture >14%; store if dry + pest-proof; wait for the MSP procurement day; the storage-cost-vs-price-rise inequality). Turns the planner's numbers into a decision.
- `npm run build` green.
- Deployed: no

## Cycle 23 — 00:23 IST
- Crop Doctor: new "Before you spray" card (spray timing 6–9 AM / 4–6 PM, no spraying within 6h of rain, exact label dose, protective gear + children out, pre-harvest waiting period) — the practical half of a spray decision the diagnosis cards don't cover. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 24 — 00:23 IST
- i18n/a11y sweep: verified zero internal-ID leaks in app/components/lib (no "009"/"Project 00N"); every new string ships in both EN and Tamil (16 pest-forecast entries, 19 treat rules, 27 playbook stages, fertilizer splits/notes, Kisan tracker, sell/store guide, spray rules); added missing `ta-fallback` font classes on the fertilizer results table, pest-watch list, and Kisan rows so Tamil typesets cleanly. New interactive controls keep the app's established button patterns and aria labels.
- `npm run build` green.
- Deployed: no

## Cycle 25 — 00:24 IST
- Final QA: fertilizer maths verified in node (paddy 1 acre → DAP 44.0 kg / urea 114.8 kg / MOP 33.7 kg, nitrogen balance exact; coconut 100 palms sane); October pest-watch filter yields 8 live entries (blast, sheath blight, tungro, pink bollworm, jassid, rust, sigatoka, bud rot); old doctor-history entries migrate cleanly (default Watching, no recheck badge); all 8 routes prerender static; no internal-ID leaks. Final `npm run build` green — night's work complete, local only.
- `npm run build` green.
- Deployed: no

## Cycle 26 — 00:56 IST (watchdog recovery)
- Records backup & restore: everything lives in this device's localStorage, so one phone reset would wipe the ledger, reminders, diagnoses and Kisan tracker. New `exportBackup`/`importBackup` on the DB store (versioned wrapper `{ payirBackup: 1, exportedAt, db }`, validated on import, rejects non-Payir files) plus a "Records backup" card on the season board — download backup as `payir-backup-YYYY-MM-DD.json`, restore from file (replacing current records, with a download-first warning). Fully bilingual, entry count shown. Old stored DBs migrate cleanly via a shared `sanitize()` (also fixes claimLogs on legacy rows).
- `npm run build` green.
- Deployed: no

## Cycle 27 — 00:58 IST (watchdog recovery)
- Field rechecks surfaced on the season board: unresolved Crop Doctor entries with a recheck date due within 7 days (or already overdue) now appear as a highlighted "Time to walk the field again" strip on the home dashboard, with the crop + diagnosis name (bilingual via DIAGNOSES/DOCTOR_CROPS lookup), watching/treated status, and an overdue/in-N-days badge, linking into the Crop Doctor. The section only renders when something is actually due. Closes the diagnose → follow-up loop that previously lived only on the doctor page.
- `npm run build` green.
- Deployed: no

## Cycle 28 — 01:00 IST (watchdog recovery)
- PMFBY 72-hour claim log on the Schemes desk: the "72-hour rule" card told farmers what to do; now there is a timestamped incident log right under it. Record crop, loss type (flood/drought/pest/storm/other), the exact moment damage was noticed, and an optional note — each entry shows a live 72-hour countdown badge (green >24h left, amber ≤24h, red once the window closes), refreshed every minute, bilingual. Gives the family the written record the bank or agriculture officer asks for, and makes the deadline impossible to miss.
- `npm run build` green.
- Deployed: no

## Cycle 29 — 01:21 IST
- Price board: new "Trader quote book" — log every price a trader or mandi names (crop, ₹/quintal, optional mandi note) before deciding; each quote is badged against the MSP floor (coral "₹X below MSP" / green "₹X above MSP ✓"), with a "best quote this season" line. Stored in localStorage (`priceQuotes`, capped 30, migrates cleanly, included in backup validation). Fully bilingual, `aria-live` on the list.
- `npm run build` green.
- Deployed: no

## Cycle 30 — 01:34 IST
- Field guide: new "Seed calculator" tab (TNAU/Agritech + KVK-researched rates, 19 Oct research): paddy transplanted 25 kg/acre, paddy SRI 3 kg/acre, cotton Bt hybrid 0.6 kg/acre, groundnut 50 kg/acre, sugarcane 30,000 two-budded setts/acre, banana 1,000 suckers/acre, coconut 70 seedlings/acre — enter acres, get the exact qty to buy plus a +10% germination buffer and a buying note per entry (sugarcane copy notes the source conflict honestly). SEED_RATES in data.ts with source comment; tab bar refactored to a TABS array.
- `npm run build` green.
- Deployed: no

## Cycle 31 — 01:47 IST
- Field guide: new "Soil test" tab — a Soil Health Card interpreter (standard Indian/ICAR rating bands from tonight's research): enter pH, EC, organic carbon, N, P, K and get a plain-language reading (green/amber/coral badge) plus what-to-do advice in both languages — lime for acidic, gypsum + leaching for alkaline, FYM for low carbon, fertilizer-tab pointers for low nutrients. `interpretPh/Ec/Oc/N/P/K` + SHC_PARAMS in data.ts with the source bands in comments; tab bar now wraps for the 4th tab.
- `npm run build` green.
- Deployed: no

## Cycle 32 — 01:59 IST
- Field guide playbook: new "Water when it counts" card above the crop stages — irrigation critical stages from TNAU/ICAR research (19 Oct): paddy (seedling, max tillering, panicle initiation, flowering, soft-dough), cotton (square → boll maturation), sugarcane (tillering, grand growth ~90–270 days ≈80% of growth, ripening), groundnut (branching, pegging, pod filling), plus banana/coconut. IRRIGATION_STAGES in data.ts, each stage with when + why, bilingual. Also fixed a stray character in a Tamil string.
- `npm run build` green.
- Deployed: no

## Cycle 33 — 02:11 IST
- Schemes desk: new KCC loan tracker — the researched 7%−3%=4% rule: concessional 7% crop loans, 3% prompt-repayment incentive → effective 4% (RBI MISS FY2025-26), subvention up to ₹3 lakh. Add bank/society, amount, due date; each loan shows a countdown badge and the exact on-time interest (4%/yr) plus rupees saved vs 7%. `farmLoans` in db.tsx (migrates cleanly, in backup validation + entry count).
- `npm run build` green.
- Deployed: no

## Cycle 34 — 02:24 IST
- Crop Doctor: new "Rain rules" card (sky border) — the standing advice that repeats in every IMD + TNAU/KVK block bulletin (DAMU, Tue/Fri): skip irrigation when rain is expected, hold fertilizer and field work, harvest matured crop before rain and dry under cover, wait for leaves to dry before spraying, and how to get the free bulletins on WhatsApp via the KVK. Kept distinct from the existing "Before you spray" card (no duplication). Fully bilingual with a source line.
- `npm run build` green.
- Deployed: no

## Cycle 35 — 02:35 IST
- Home board: new "Season outlook" card — pick one of your ledger plots, enter expected yield (q/acre); Payir computes projected harvest, revenue at that crop's MSP (auto-detected via the ledger's crop matching, or your own price with an MSP placeholder), spend so far from the ledger, and projected profit in a green/coral verdict box. Labelled as a planning number, not a promise. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 36 — 02:47 IST
- Accessibility sweep: added `:focus-visible` keyboard focus outlines on all buttons and a `prefers-reduced-motion` media query (kills animation/transitions for reduced-motion users) in globals.css; verified badge classes exist for the new severity colours, every new input has a label or aria-label, every ✕ delete has an aria-label, delete controls carry `no-print`, and the new results lists use `aria-live`. Also re-verified zero internal-ID ("009"/"Project 00N") leaks in app/components/lib.
- `npm run build` green.
- Deployed: no

## Cycle 37 — 02:58 IST
- Season calendar: expanded season rows now carry "Remind me at sowing / harvest" buttons — one tap drops a bilingual reminder ("Samba sowing", "Samba harvest") onto the home board's countdown list, dated at the next upcoming sowing/harvest month (rolls to next year if the window already opened). Idempotent: existing identical reminders show as "✓ Reminder · date" instead of duplicating. Client-clock gated for prerender safety.
- `npm run build` green.
- Deployed: no

## Cycle 38 — 03:10 IST
- Final QA: verified all researched numbers in node (seed rates 25/3/0.6/50/30000/1000/70; SHC band boundaries pH/EC/OC/N/P/K; irrigation stages present for all 6 crops); verified every new data string ships in both EN and Tamil; re-confirmed zero internal-ID leaks and all 9 routes prerender static. Final `npm run build` green — night's work complete, local only.
- `npm run build` green.
- Deployed: no

## Cycle 39 — 02:06 IST
- Watchdog recovery cycle: the builder declared "night's work complete" at cycle 38 and stopped early — resuming development. Home board deadlines: KCC farm-loan due dates now surface on the "Don't let these pass quietly" strip. Loans due within 30 days (or overdue) appear with green/amber/coral countdown badges, and loans due within 14 days carry the 3% prompt-repayment incentive warning (effective 4% vs 7%). Previously the loans lived only on the schemes page. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 40 — 02:07 IST
- Watchdog recovery cycle: pest watch on the season board is now scoped to the farmer's own crops when the ledger has plots — plot crop names are matched against the Crop Doctor crop list (e.g. "Samba paddy" → paddy alerts only), with a "for your crops" label; falls back to the full "all crops" list when no plots exist or none of the farmer's crops have alerts this month. Alerts for crops they don't grow were pure noise on the board. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 41 — 02:08 IST
- Watchdog recovery cycle: new 72-hour claim-window red alert on the season board. Any logged crop-damage incident still inside its 72-hour PMFBY reporting window now raises a coral-bordered card with a live countdown (hours/minutes), the loss type, and a "Report from the Schemes desk" button pointing at the 5-step checklist — previously the ticking window lived only on the schemes page, too far down for a deadline that decides whether a claim lives. Renders nothing when no window is open. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 42 — 02:16 IST
- Crop Doctor: free-text symptom finder above the symptom chips — type what you see in English or Tamil ("yellow leaf", "மஞ்சள்", "துளை") and the chip grid filters live to matching symptoms (matches symptom wording plus the current crop's diagnosis names). Direct fold of tonight's research (Plantix/thebetterindia, Oct 19): farmers cannot find pest info by textbook names, so the finder accepts their own words instead of requiring chip taps. Shows a match count and a friendly no-match state that points back to the full list. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 43 — 02:17 IST
- Crop Doctor: new "Confirm with your officer" card (Plantix/FAO pattern — diagnosis is a strong guess, never a lab test). Saves the block agriculture officer's name + phone (persisted in db, sanitized, included in backup validation), plus a 3-tick confirmation checklist: 3 damage photos (close/plant/field), carry the printed diagnosis note, tell the officer plot name + crop + first-noticed date. Checklist persists via the new generic `checks` store in lib/db (also migrates old backups cleanly).
- `npm run build` green.
- Deployed: no

## Cycle 44 — 02:18 IST
- Schemes: PMFBY claim evidence kit — every logged damage incident now carries a 5-tick evidence checklist (damage photos with location, Aadhaar + patta/chitta, bank passbook copy, sowing proof, 72h intimation via 14447 / Crop Insurance App / bank) with a live "n/5 ready" counter. Tick state persists per claim through the new generic `checks` store. This closes the loop with the 72h countdown — the intimation was tracked, now the paperwork behind it is too. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 45 — 02:18 IST
- Ledger: new "Where the money went" card — spend by expense category as pure-CSS bars (no chart library), sorted largest-first with rupee amounts and accessible labels. Shows only when expenses exist, so the empty state stays calm. The point is decision value: a farmer who sees fertilizer ate 40% of spend negotiates harder next season. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 46 — 02:19 IST
- Field guide: new "Before harvest — are you ready?" section — a 6-tick pre-harvest readiness checklist (combine booked in writing, tarpaulin + drying yard, gunny bags counted, labour confirmed, target moisture known (≤17% paddy for procurement), DPC registration) with a live n/6 counter, persisted through the generic `checks` store. Sits below the tabbed calculators; renders in both languages.
- `npm run build` green.
- Deployed: no

## Cycle 47 — 02:20 IST
- Prices: new "Sell smart at the mandi" card after the fair-price checklist — the weighment and moisture tricks that cost more per season than the price itself: weigh bags at home and write the number on each, dry grain before selling (17% moisture bar for paddy procurement), get every price in writing in the quote book, count bags at the mandi, and don't let an advance turn into a forced sale. Deliberately distinct from the fair-checklist card above (knowing MSP vs the sale itself). Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 48 — 02:20 IST
- Home board: when any season's harvest window is open this month, a readiness card appears on the season board showing pre-harvest checklist progress (n/6) and deep-linking to the field guide. Amber border while work remains, accent border when complete. The two weeks before harvest decide the price more than anything, so it belongs on the board, not buried two taps away. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 49 — 02:21 IST
- Schemes: new "Government procurement — are you ready?" card — a 4-tick MSP procurement readiness checklist (DPC registration for the season's crop, Aadhaar + patta/chitta + bank passbook copies, linked mobile number, knowing the centre's procurement window dates) with a live n/4 counter, persisted via the generic `checks` store. Deliberately separated from the field guide's harvest-logistics checklist: this one is the paperwork that decides whether MSP is real. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 50 — 02:23 IST
- Final QA for the run: node verification — zero internal-ID ("009"/"Project 00N") leaks in app/components/lib; field-guide harvest checklist item count (6) matches the home board's TOTAL; all `checks`-store key prefixes are consistent across reads and writes (doctor `confirm:`, field-guide `harvest:`, schemes `evidence:`/`procure:`); backup sanitize covers the new `agriOfficer` and `checks` fields. Final `npm run build` green, all 9 routes prerender static — run's work complete, local only.
- `npm run build` green.
- Deployed: no

## Cycle 51 — 02:47 IST (watchdog recovery)
- Prices: the quote book now judges every trader quote against the farmer's own cost of production, not just MSP — the free-text crop matcher moved from the ledger page into a shared `mspForCrop()` in lib/data.ts (one matcher, one behaviour), and a new `useCostByCrop()` hook aggregates ledger spend ÷ sold quintals per MSP crop (only plots with recorded sales count — unsold harvest has no honest cost yet). Each quote line now carries a second verdict: green "Your cost of production ₹X/q — this quote earns you ₹Y/q" or coral "⚠ this sale loses ₹Z/q". A quote that clears MSP can still lose money; now the book says so. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 52 — 02:51 IST (watchdog recovery)
- Crop Doctor: the field watch is now a real knowledge base — every watched entry gains a "What worked?" note (db `outcome` on DoctorEntry, capped 500 chars, old entries migrate cleanly, included in backup through the shared sanitize). Shown when an entry is Treated or Resolved: a saved-on-blur textarea plus the recorded note in accent. Next season the same symptom hits and the farmer can see exactly which spray worked last time instead of guessing again. Fully bilingual, print keeps the recorded note.
- `npm run build` green.
- Deployed: no

## Cycle 53 — 02:55 IST (watchdog recovery)
- Prices: new printable "Mandi slip" card after the quote book — one page to carry to the mandi with, per crop: best quote this season, the MSP floor, your own cost of production (the new useCostByCrop hook, shared with cycle 51's verdict), and the ₹/q margin, plus the rule line "never sell below your cost of production" in both languages. Print-only table + no-print print button, following the ledger's established print pattern; renders nothing until quotes exist. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 54 — 03:17 IST (watchdog recovery)
- Schemes: new PMFBY premium estimator card — pick season class (kharif 2% / rabi 1.5% / commercial-horticulture 5%), enter sum insured, and it shows the farmer's exact payable with the line that the Centre + state pay the rest of the actuarial premium and that the actual premium can only be lower, plus the 14447 helpline. Percentages become rupees so the enrolment decision happens before the deadline, not after. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 55 — 03:18 IST (watchdog recovery)
- Home: new agriculture-officer call strip on the season board — the number is saved on the Crop Doctor page but now surfaces where it matters: with a phone saved it shows the officer's name and a one-tap `tel:` call button; without one it nudges the farmer to add it in the Crop Doctor. Accent-bordered when live, fully bilingual, no horizontal scroll.
- `npm run build` green.
- Deployed: no

## Cycle 56 — 03:18 IST (watchdog recovery)
- Prices: the quote book now draws a per-crop quote trend — pure-CSS bars oldest to newest (min–max normalized, latest bar in the deep accent), with a first→latest ₹/q caption and a rising/falling verdict in both languages. Appears only for crops with 2+ quotes; single-quote crops keep the list alone. Fully bilingual, print-safe.
- `npm run build` green.
- Deployed: no

## Cycle 54 — 03:19 IST
- Crop Doctor: new "Read the label first" section — India's mandatory pesticide toxicity colour bands (Insecticides Rules, 1971, researched tonight): red = extremely toxic (☠ POISON + skull mark), yellow = highly toxic, blue = moderately toxic, green = slightly toxic, each with what the label must say. Plus safe-handling rules: full PPE for red/yellow bottles, never spray in wind, locked storage away from food and children, rinse-empty-bottles-3x-punch-bury rule, wash up and launder separately. Farmers read the brand name and ignore the band — this card fixes that. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 55 — 03:24 IST
- Prices: new "Sell beyond your mandi (e-NAM)" card after the mandi sale tips — researched tonight (govtschemes.in, khetikisaan): e-NAM is the online auction layer inside your own APMC mandi, not a separate market. Free registration with Aadhaar + bank + mobile; free mandi-lab assaying wins a better price; top bid is yours to accept or reject; payment lands in the bank in 24–72h; can sell at any mandi within 100 km. Honest caveat kept: small lots get thin bidding — pool through an FPO; perishables still belong at the local floor. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 56 — 03:31 IST
- Home board: new "Unfinished business" aggregator — one card for every pending checklist in the app: officer confirmation (`confirm:`, only when a diagnosis is logged), pre-harvest readiness (`harvest:` n/6), MSP procurement paperwork (`procure:` n/4), and each PMFBY claim's evidence kit (`evidence:<id>:` n/5). Each row shows what's left and deep-links to the page that finishes it; the card is silent when everything is ticked. A farmer with half-done checks on three pages gets one nudge, not silence. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 57 — 03:35 IST
- Schemes: "What's new with KCC (2026)" strip inside the farm loan tracker — researched tonight (RBI MISS circular, Budget 2025-26 reporting): loan ceiling now ₹5 lakh (7% concession continues on the first ₹3 lakh), collateral-free up to ₹2 lakh, tenant/sharecropper eligibility, single one-page form for PM-KISAN beneficiaries with Aadhaar e-KYC, and the card now runs 6 years with annual review. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 58 — 03:39 IST
- Crop Doctor: new "The solution ladder — what first?" card — the IPM hierarchy the Plantix/FAO pattern implies but never stated: 1) cultural (pick-and-burn, spacing, sanitation — free), 2) mechanical (traps, hand-picking, bird perches), 3) biological (neem, Bt, Trichogramma), 4) chemical LAST — only after the earlier steps fail AND the spray threshold is crossed. Dealers sell the chemical first; the ladder says otherwise. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 59 — 03:43 IST
- Accessibility: big-text toggle in the header (A+/A− button, persisted in `payir:bigtext`) — adds/removes a `big-text` class on `<html>` that lifts the root font size to 118%, so every rem-based size in the app grows at once. Sits next to the language toggle; aimed at the elders and low-vision farmers who actually make the season decisions. Prerender-safe (client-only effect).
- `npm run build` green.
- Deployed: no

## Cycle 60 — 03:47 IST
- Calendar: new "Get ready this month" prep card above the season tables — the tables show windows, this says what to DO: 3 grounded prep tasks per month for all 12 months (e.g. October: watch the fields, plan navarai seed, file PMFBY rabi early; November: the ⚠ Nov 15 samba/thaladi enrolment deadline). Grounded in the season bands and the scheme deadlines the app already tracks. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 61 — 03:51 IST
- Crop Doctor: new maize crop with 4 curated diagnoses — fall armyworm (urgent; whorl-focused neem/spinosad, pheromone traps, resistance warning), turcicum leaf blight, stem borer, maydis leaf blight — each with organic/chemical/prevent tabs in the app's established format, plus a fall armyworm entry in the home pest-forecast for Jan–Apr (young winter–summer maize window). Curated from TNAU maize protection guides; the app's honesty line already covers the guidance-not-lab-test caveat. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 62 — 03:55 IST
- Schemes: new "Family document wallet" card — paperwork is the #1 scheme blocker, and every scheme on the page asks for the same papers. One consolidated 7-tick checklist (Aadhaar, patta/chitta, bank passbook + cancelled cheque, Aadhaar+bank mobile linking, photos, ration card, lease agreement for tenant farmers), each with a where-to-get line (e-services, VAO, bank branch, taluk office), persisted through the generic `checks` store (`docs:<id>`). Also wired into the home board's "Unfinished business" aggregator as its own row. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 63 — 03:58 IST
- Final QA for the run: node verification — zero internal-ID ("009"/"Project 00N") leaks in app/components/lib; `checks` key prefixes consistent across reads and writes (harvest: ×6, procure: ×4, confirm: ×3, evidence: ×5, docs: ×7 — home aggregator arrays match the pages' item ids exactly); PREP covers all 12 months; maize crop renders in the doctor picker. Final `npm run build` green, all 9 routes prerender static — run's work complete, local only.
- `npm run build` green.
- Deployed: no

## Cycle 64 — 03:56 IST (watchdog recovery)
- Crop Doctor: new turmeric crop (மஞ்சள் — the Erode belt staple) with 4 curated diagnoses — leaf spot (Colletotrichum), leaf blotch (Taphrina), rhizome rot (Pythium, urgent), scale insects on rhizome — each with organic/chemical/prevent tabs in the app's established format, plus matching economic-threshold entries (the "count first, spray second" line) in TREAT_RULES. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 65 — 03:57 IST (watchdog recovery)
- Home board: 3 turmeric entries in the pest-forecast (leaf spot season Jun–Nov, rhizome rot risk Sep–Nov, planting prep May–Jul) — the forecast filters by month, so they surface automatically. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 66 — 03:58 IST (watchdog recovery)
- Field guide: turmeric planting rate (~900 kg/acre seed rhizomes, 45×15 cm in raised beds, May–June, TNAU guidance) and fertilizer dose (120:50:90 kg/ha split basal/45-day/90-day, potash-heavy late split fills the rhizome) — both keyed to the new turmeric crop id so they render alongside the other crops. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 67 — 04:24 IST
- Ledger: new "Where sold" channel field per sale (APMC mandi / e-NAM / trader at farm gate / FPO / Govt procurement centre / Other), persisted on the Sale record with legacy-safe sanitize default; new "Where you earned best" card — average ₹/quintal per channel with pure-CSS bars and a gap verdict ("₹X-per-quintal gap between your best and worst channel") so the single biggest price lever stays visible. Folds in tonight's research insight: the biggest money leak is selling without benchmarking channels first. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 68 — 04:30 IST
- Prices: new "Before you load the truck" two-mandi comparator card — enter quantity + two quotes + both transport costs; nets out the transport and names which option pays more (and by how much). Pure local state, aria-live results, fully bilingual. Folds in the researched insight that a ₹100/q quote gap across a full load is real money lost to whoever quotes last.
- `npm run build` green.
- Deployed: no

## Cycle 69 — 04:35 IST
- Field guide: new "After harvest — don't lose it now" section — 6-item persisted post-harvest checklist (safe storage moisture with the crack-not-bend test, pallets off the floor, neem leaves against storage pests, never mix damp with dry, clean-and-grade before selling for better mandi/e-NAM rates, FIFO + fortnightly stack checks). Pre-harvest readiness was covered; the storage-loss half of the chain was missing.
- `npm run build` green.
- Deployed: no

## Cycle 70 — 04:22 IST
- Home board: wired the new post-harvest storage checklist (`post:*`) into the "Unfinished business" aggregator as its own row with live x/6 progress, pointing to /field-guide — keeping the aggregator's arrays in sync with the page's item ids as established in cycle 63.
- `npm run build` green.
- Deployed: no

## Cycle 71 — 04:21 IST
- Prices: new "e-NAM — first-timer's list" card — the researched practical on-ramp (register with Aadhaar+bank at your mandi, grade the produce, get the quality assay, start with a small test lot, watch the bidding window, keep the digital receipt), persisted through the `checks` store and wired into the home board's "Unfinished business" aggregator as its own x/6 row pointing to /prices. Fully bilingual.
- `npm run build` green.
- Deployed: no

## Cycle 72 — 04:26 IST
- Accessibility: `<html lang>` now follows the language toggle (was hardcoded "en" — screen readers would mispronounce Tamil text for the very users the Tamil UI serves); added a keyboard skip-to-main-content link in the shell (sr-only until focused), anchored to `#main-content`. Prerender-safe (client effects only).
- `npm run build` green.
- Deployed: no

## Cycle 73 — 04:28 IST
- QA pass: zero internal-ID ("009"/"Project 00N") leaks across app/components/lib; `checks` prefix arrays verified in sync — harvest: ×6, post: ×6, enam: ×6, procure: ×4, confirm: ×3, docs: ×7, evidence: ×5 — home aggregator matches every page's item ids; shared `.btn`/`.field` styles confirmed at the 44px touch target.
- `npm run build` green.
- Deployed: no

## Cycle 74 — 04:31 IST
- Home board: new third teaser card for the Prices board's selling toolkit — "Don't let the trader set the price." — pointing at the quote book, the two-mandi comparator and the e-NAM list; teasers grid goes 2→3 columns on desktop (stacked on mobile). New bilingual strings in i18n.
- `npm run build` green.
- Deployed: no

## Cycle 75 — 04:24 IST
- Ledger: the "Where you earned best" card now notes how many older sales have no channel marked (excluded from the comparison) so partial data can't quietly mislead; also tidied the ENAM_IDS export in the prices page (module-local now, with a keep-in-sync note for the home aggregator).
- `npm run build` green.
- Deployed: no

## Cycle 76 — 04:52 IST (watchdog recovery)
- Installable app: the offline-first tool can now live on the home screen. New `public/manifest.webmanifest` (standalone display, warm-paper background, field-green theme colour) and `public/icon.svg` (deep-green rounded tile with ப, crop-furrow flourish) wired through layout metadata (manifest link, apple touch icon, apple-mobile-web-app-capable). Static-only, prerender-safe.
- `npm run build` green.
- Deployed: no
