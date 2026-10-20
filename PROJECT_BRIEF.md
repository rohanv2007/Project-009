# PROJECT_BRIEF.md — Project 009 · Payir

## Identity
- **Project number:** 009 (tracker sheet max was 3; local briefs claimed up to 008 — taking 009)
- **Product name:** Payir (பயிர் — "crop") — the farmer's season companion
- **Field:** Farmer support — crop economics, crop health, season planning, scheme access (not covered by any prior project:
  002 = Raktha blood-donor network, 003 = Nivarana disaster resilience,
  004 = Padippu exam prep, 005 = Pathukappu road safety, 006 = Manam mental health,
  007 = Thunai senior citizen care, 008 = Uthavi scholarship mission control;
  earlier ritual builds covered campus complaints (FixMyCampus) and job hunting (PlaceTrack))

## The real, painful problem
Indian farmers lose 15–25% of every crop to pests and diseases — not from bad
luck, but from late or wrong diagnosis: one agri-input dealer's word is the
only advice most smallholders get, and the dealer profits from whatever they
sell. MSP announcements make headlines, but most farmers sell to traders at
mandi rates below MSP because they never registered, never read the
procurement calendar, or couldn't keep the receipts that prove their costs.
PMFBY crop-insurance deadlines (e.g. Nov 15 for samba/thaladi in Thanjavur)
pass quietly every season. Nobody gives a family ONE calm, private, bilingual,
fully-offline tool that closes the loop: plan the season → price the harvest →
diagnose the crop → record every rupee → claim every scheme.

## Vision
A calm, local-first season companion with five jobs: (1) the Season board —
what is sowing/harvesting right now in Tamil Nadu, month by month; (2) the
Price board — the real 2026-27 MSP table with an honest "sell above this"
line and a fair-price checklist; (3) the Crop Doctor — symptom-first
diagnosis with organic AND chemical controls plus prevention, offline-first
like Plantix's library; (4) the Ledger — cost-of-cultivation bookkeeping per
plot and season, profit per acre, break-even vs MSP; (5) the Schemes desk —
PMFBY/PM-KISAN/KCC with eligibility, documents, and deadlines that don't
pass quietly.

## Feature scope (night 1)
- Home dashboard: live season clock ("what is happening this month" from the
  TN calendar), MSP highlights, urgent scheme deadlines, ledger summary.
- Price board: all 14 kharif MSP 2026-27 values (PIB, 13 May 2026), increase
  vs 2025-26, margin-over-cost, plus fair-price trading checklist.
- Crop doctor: paddy, cotton, groundnut, sugarcane, banana — choose plant
  part → symptoms → likely diagnoses with organic / chemical / preventive
  tabs. Honest "this is guidance, not a lab test" line; points to the
  block agriculture officer for confirmation.
- Season calendar: full 12-month grid of TN rice seasons (Kuruvai, Early
  Samba, Samba, Late Samba, Thaladi, Late Thaladi, Navarai, Sornavari, Early
  Kar, Kar, Pishanam), cotton and sugarcane windows, with "now" highlighted.
- Ledger: plots, expenses by category, harvest sales, per-acre profit, season
  totals, break-even price per quintal vs MSP.
- Schemes: PMFBY (2%/1.5%/5% premium rule, 72-hour loss reporting, 14447
  helpline), PM-KISAN, KCC — each with eligibility, documents, deadlines,
  and a personal "my status" tracker.
- Bilingual EN/தமிழ் throughout. All data in localStorage, no backend.

## Researched insights (folded in from night research)
1. MSP 2026-27 (PIB 13 May 2026): Paddy Common ₹2441, Grade A ₹2461, Jowar
   ₹4023, Bajra ₹2900, Ragi ₹5205, Maize ₹2410, Tur ₹8450, Moong ₹8780
   (highest margin-over-cost at 61%), Urad ₹8200, Groundnut ₹7517, Sunflower
   ₹8343, Soybean ₹5708, Sesamum ₹10346, Nigerseed ₹10052, Cotton (medium
   staple) ₹8267. Biggest jumps: sunflower +₹622, cotton +₹557.
2. Plantix pattern (FAO/field studies): diagnosis → customized combat options
   (conventional + alternative) + best practices + prevention; disease library
   works offline. The Doctor copies this exact structure without the AI camera.
3. TN rice seasons (eAgri/TN agri dept): Kuruvai Jun–Sep, Samba Aug–Jan,
   Thaladi Sep–Jan, Navarai Dec–Apr, Sornavari Apr–Aug, Kar May–Sep,
   Pishanam Sep–Jan; cotton winter-irrigated Aug–Sep sowing, summer Feb–Mar;
   sugarcane early/mid/late/special seasons Dec–Jan / Feb–Mar / Apr–May /
   Jun–Jul.
4. PMFBY 2026: farmer premium 2% kharif / 1.5% rabi / 5% commercial-horticulture;
   loss must be reported within 72 hours with geotagged photos; helpline 14447;
   kharif enrolment ~Jul 31 (extended Aug 15, 2026); rabi samba/thaladi
   deadline in Thanjavur was Nov 15, 2026; new 2026 add-ons: wild-animal cover
   and paddy inundation cover.

## UI rules (non-negotiable)
FixMyCampus visual language: warm paper background, serif display headings,
sharp corners, ONE restrained accent (deep field green), editorial layout,
generous whitespace, minimal motion, light theme. NO gradients or generic
AI-looking styling. Fully responsive, touch-friendly, no horizontal scroll.
Tamil text must typeset cleanly (no clipping). Never show the project number
"009" or any tracker label in the app.

## Data
- All user data (plots, expenses, sales, diagnoses history, scheme checklists)
  in localStorage under `payir:db:v1`. No accounts, no network calls.
- Reference data (MSP table, season calendar, doctor diagnoses, schemes)
  ships as curated JSON in `lib/data.ts` with sources noted in comments.

## Success for the night
Boot green; 8–10+ focused cycles, each ending with `npm run build` green;
a genuinely useful farmer's tool the family can open on a phone tomorrow,
entirely offline, in Tamil or English.
