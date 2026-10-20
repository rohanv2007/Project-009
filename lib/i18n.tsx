"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ta";

/* Bilingual copy. Tamil is for the farmers and elders who usually make the
   season decisions — keep every key in both languages. */

const STRINGS: Record<string, { en: string; ta: string }> = {
  app_name: { en: "Payir", ta: "பயிர்" },
  app_tagline: { en: "The farmer's season companion", ta: "விவசாயியின் பருவத் துணை" },
  nav_home: { en: "Home", ta: "முகப்பு" },
  nav_prices: { en: "Prices", ta: "விலைகள்" },
  nav_doctor: { en: "Crop Doctor", ta: "பயிர் மருத்துவர்" },
  nav_calendar: { en: "Season", ta: "பருவம்" },
  nav_ledger: { en: "Ledger", ta: "கணக்கு" },
  nav_guide: { en: "Field guide", ta: "வயல் வழிகாட்டி" },
  nav_schemes: { en: "Schemes", ta: "திட்டங்கள்" },
  lang_toggle: { en: "தமிழ்", ta: "English" },

  dash_kicker: { en: "Season board", ta: "பருவப் பலகை" },
  dash_title: {
    en: "Know your season, your price, and your costs — before the trader tells you.",
    ta: "உங்கள் பருவம், உங்கள் விலை, உங்கள் செலவு — வியாபாரி சொல்வதற்கு முன் தெரிந்துகொள்ளுங்கள்.",
  },
  dash_sub: {
    en: "Payir keeps the whole farming year in one calm place: what is sowing now, what your harvest is really worth, what is eating your crop, every rupee you spent, and every scheme you are owed. On your device, in your language, fully offline.",
    ta: "பயிர் முழு விவசாய ஆண்டையும் ஒரே அமைதியான இடத்தில் வைத்திருக்கிறது: இப்போது என்ன விதைக்கலாம், உங்கள் அறுவடையின் உண்மையான மதிப்பு, பயிரைத் தின்னும் நோய், நீங்கள் செலவிட்ட ஒவ்வொரு ரூபாய், உங்களுக்குரிய திட்டங்கள். உங்கள் சாதனத்தில், உங்கள் மொழியில்.",
  },
  this_month: { en: "This month", ta: "இந்த மாதம்" },
  sowing_now: { en: "Sowing now", ta: "விதைப்பு நடக்கிறது" },
  harvesting_now: { en: "Harvesting now", ta: "அறுவடை நடக்கிறது" },
  nothing_now: {
    en: "No major sowing or harvest window this month — a good time for soil work, repairs, and paperwork.",
    ta: "இந்த மாதம் பெரிய விதைப்பு/அறுவடை இல்லை — மண் வேலை, பழுது, ஆவண வேலைக்கு நல்ல நேரம்.",
  },
  stat_msp: { en: "MSP crops tracked", ta: "MSP பயிர்கள்" },
  stat_schemes: { en: "Schemes on your desk", ta: "திட்டங்கள்" },
  stat_schemes_sub: { en: "completed", ta: "முடிந்தது" },
  stat_spent: { en: "Season spend", ta: "பருவச் செலவு" },
  stat_profit: { en: "Season profit", ta: "பருவ லாபம்" },
  deadlines_title: { en: "Don't let these pass quietly", ta: "இவை அமைதியாகக் கடக்க விடாதீர்கள்" },
  doctor_teaser_title: { en: "Something wrong in the field?", ta: "வயலில் ஏதோ சரியில்லையா?" },
  doctor_teaser_body: {
    en: "Answer three questions about what you see. Payir narrows it to the likely causes, with organic and chemical options and how to stop it next season.",
    ta: "நீங்கள் காண்பதைப் பற்றி மூன்று கேள்விகளுக்குப் பதில் சொல்லுங்கள். காரணங்களைக் கண்டறிந்து, இயற்கை மற்றும் இரசாயன வழிகளையும், அடுத்த பருவத் தடுப்பையும் தரும்.",
  },
  doctor_teaser_cta: { en: "Open the Crop Doctor", ta: "பயிர் மருத்துவரைத் திற" },
  ledger_teaser_title: { en: "Every rupee, accounted.", ta: "ஒவ்வொரு ரூபாயும் கணக்கில்." },
  ledger_teaser_body: {
    en: "Most farmers discover their real profit only at the mandi — when it is too late to change anything. Record costs as you spend and sales as you sell.",
    ta: "பெரும்பாலான விவசாயிகள் உண்மையான லாபத்தை மண்டியில்தான் அறிகிறார்கள் — அப்போது மாற்ற முடியாது. செலவைச் செலவிடும்போதும், விற்பனையை விற்கும்போதும் பதிவு செய்யுங்கள்.",
  },
  price_teaser_title: { en: "Don't let the trader set the price.", ta: "வியாபாரி விலையை நிர்ணயிக்க விடாதீர்கள்." },
  price_teaser_body: {
    en: "Log every quote, compare two mandis net of transport before you load the truck, and walk the e-NAM first-timer's list. The best channel is the one you checked.",
    ta: "ஒவ்வொரு விலையையும் பதிவு செய்யுங்கள்; வண்டி ஏற்றும் முன் இரு மண்டிகளைப் போக்குவரத்து செலவுடன் ஒப்பிடுங்கள்; e-NAM முதல் விற்பனைப் பட்டியலை முடியுங்கள். சரிபார்த்த வழியே சிறந்த வழி.",
  },
  price_teaser_cta: { en: "Open the Price board", ta: "விலைப் பலகையைத் திற" },

  prices_kicker: { en: "Price board", ta: "விலைப் பலகை" },
  prices_title: { en: "What your harvest is really worth.", ta: "உங்கள் அறுவடையின் உண்மையான மதிப்பு." },
  prices_sub: {
    en: "Minimum Support Prices for kharif 2026-27, as approved by the Cabinet on 13 May 2026. MSP is the floor the government promises — never sell below it without knowing exactly what you are giving up.",
    ta: "காரீஃப் 2026-27 குறைந்தபட்ச ஆதரவு விலைகள் — 13 மே 2026 அமைச்சரவை ஒப்புதல். MSP என்பது அரசு உறுதியளிக்கும் அடித்தள விலை — அதற்குக் கீழ் விற்குமுன் என்ன இழக்கிறீர்கள் என்பதை அறியுங்கள்.",
  },
  col_crop: { en: "Crop", ta: "பயிர்" },
  col_msp: { en: "MSP ₹/quintal", ta: "MSP ₹/குவிண்டால்" },
  col_change: { en: "Vs last year", ta: "கடந்த ஆண்டுடன்" },
  col_margin: { en: "Margin over cost", ta: "செலவுக்கு மேல்" },
  fair_title: { en: "The fair-price checklist", ta: "நியாய விலைச் சரிபார்ப்பு" },
  fair_intro: {
    en: "Before you agree to any trader's price, run through this:",
    ta: "வியாபாரியின் விலைக்கு ஒப்புக்கொள்வதற்கு முன் இதைப் பாருங்கள்:",
  },

  doctor_kicker: { en: "Crop doctor", ta: "பயிர் மருத்துவர்" },
  doctor_title: { en: "Tell me what you see.", ta: "நீங்கள் காண்பதைச் சொல்லுங்கள்." },
  doctor_sub: {
    en: "Three questions, then the likely causes — each with organic options, chemical options, and how to prevent it next season. This is guidance, not a lab test: confirm with your block agriculture officer before a big spray.",
    ta: "மூன்று கேள்விகள், பின் காரணங்கள் — இயற்கை வழி, இரசாயன வழி, அடுத்த பருவத் தடுப்புடன். இது வழிகாட்டுதல், ஆய்வக முடிவு அல்ல: பெரிய தெளிப்புக்கு முன் வட்டார வேளாண் அலுவலரிடம் உறுதி செய்யுங்கள்.",
  },
  q_crop: { en: "1 · Which crop?", ta: "1 · எந்தப் பயிர்?" },
  q_part: { en: "2 · Which part of the plant?", ta: "2 · செடியின் எந்தப் பகுதி?" },
  q_symptoms: { en: "3 · What do you see? (pick all that apply)", ta: "3 · என்ன தெரிகிறது? (பொருந்துவதைத் தேர்ந்தெடுக்கவும்)" },
  no_match: {
    en: "No strong match in the library for that combination. Try fewer symptoms, or pick the single most visible one — and ask your agriculture officer; a photo helps them more than words.",
    ta: "இந்தக் கலவைக்கு நூலகத்தில் பொருத்தம் இல்லை. அறிகுறிகளைக் குறைத்து முயற்சிக்கவும், அல்லது வேளாண் அலுவலரிடம் கேட்கவும் — புகைப்படம் வார்த்தைகளை விட உதவும்.",
  },
  match_score: { en: "likely match", ta: "பொருத்தம்" },
  tab_organic: { en: "Organic", ta: "இயற்கை" },
  tab_chemical: { en: "Chemical", ta: "இரசாயன" },
  tab_prevent: { en: "Prevent", ta: "தடுப்பு" },
  urgency_watch: { en: "Watch it", ta: "கண்காணிக்கவும்" },
  urgency_act: { en: "Act this week", ta: "இந்த வாரம் செயல்" },
  urgency_urgent: { en: "Act now", ta: "உடனே செயல்" },

  cal_kicker: { en: "Season calendar", ta: "பருவ நாட்காட்டி" },
  cal_title: { en: "The Tamil Nadu farming year.", ta: "தமிழ்நாடு விவசாய ஆண்டு." },
  cal_sub: {
    en: "Sowing and harvest windows for the state's rice seasons, cotton and sugarcane. The highlighted month is where you are right now.",
    ta: "மாநில நெல் பருவங்கள், பருத்தி, கரும்புக்கான விதைப்பு–அறுவடைக் காலங்கள். ஒளிரும் மாதம் நீங்கள் இருக்கும் இடம்.",
  },
  legend_sow: { en: "Sowing", ta: "விதைப்பு" },
  legend_harvest: { en: "Harvest", ta: "அறுவடை" },
  legend_grow: { en: "Growing", ta: "வளர்ச்சி" },

  ledger_kicker: { en: "Ledger", ta: "கணக்குப் புத்தகம்" },
  ledger_title: { en: "Know your real profit.", ta: "உண்மையான லாபத்தை அறியுங்கள்." },
  ledger_sub: {
    en: "Record what each plot costs you and what it earns. Payir works out profit per acre and the break-even price — so the mandi never surprises you.",
    ta: "ஒவ்வொரு நிலத்தின் செலவையும் வருவாயையும் பதிவு செய்யுங்கள். ஏக்கருக்கு லாபம், இலாப-நட்ட சமநிலை விலை — மண்டி ஆச்சரியம் தராது.",
  },
  add_plot: { en: "Add plot", ta: "நிலம் சேர்" },
  plot_name_ph: { en: "Plot name (e.g. East field)", ta: "நிலப் பெயர் (எ.கா. கிழக்கு வயல்)" },
  acres_ph: { en: "Acres", ta: "ஏக்கர்" },
  crop_ph: { en: "Crop this season", ta: "இந்தப் பருவப் பயிர்" },
  add_expense: { en: "Add expense", ta: "செலவு சேர்" },
  add_sale: { en: "Add sale", ta: "விற்பனை சேர்" },
  amount_ph: { en: "Amount ₹", ta: "தொகை ₹" },
  note_ph: { en: "Note (optional)", ta: "குறிப்பு (விருப்பம்)" },
  qty_ph: { en: "Quintals sold", ta: "விற்ற குவிண்டால்" },
  rate_ph: { en: "Rate ₹/quintal", ta: "விலை ₹/குவிண்டால்" },
  total_spent: { en: "Total spent", ta: "மொத்தச் செலவு" },
  total_earned: { en: "Total earned", ta: "மொத்த வருவாய்" },
  profit_acre: { en: "Profit per acre", ta: "ஏக்கருக்கு லாபம்" },
  breakeven: { en: "Break-even price", ta: "சமநிலை விலை" },
  vs_msp: { en: "vs MSP", ta: "MSP உடன்" },
  delete: { en: "Delete", ta: "நீக்கு" },
  save: { en: "Save", ta: "சேமி" },
  cancel: { en: "Cancel", ta: "ரத்து" },
  empty_ledger: {
    en: "No plots yet. Add your first plot and start recording — the farmers who write it down are the ones who know.",
    ta: "இன்னும் நிலம் இல்லை. முதல் நிலத்தைச் சேர்த்துத் தொடங்குங்கள் — எழுதுபவர்களே அறிந்தவர்கள்.",
  },

  schemes_kicker: { en: "Schemes desk", ta: "திட்ட மேசை" },
  schemes_title: { en: "Money the government owes you.", ta: "அரசு தரவேண்டிய பணம்." },
  schemes_sub: {
    en: "Every scheme with its real benefit, who qualifies, what papers it needs, and the deadline that must not pass quietly. Tick off your own status as you go.",
    ta: "ஒவ்வொரு திட்டத்தின் உண்மையான பலன், தகுதி, தேவையான ஆவணங்கள், தவறவிடக் கூடாத காலக்கெடு. உங்கள் நிலையைக் குறித்துக்கொள்ளுங்கள்.",
  },
  benefit: { en: "Benefit", ta: "பலன்" },
  eligibility: { en: "Who qualifies", ta: "தகுதி" },
  documents: { en: "Papers needed", ta: "தேவையான ஆவணங்கள்" },
  deadline: { en: "Deadline", ta: "காலக்கெடு" },
  how: { en: "How to get it", ta: "பெறுவது எப்படி" },
  my_status: { en: "My status", ta: "என் நிலை" },
  status_options_not: { en: "Not started", ta: "தொடங்கவில்லை" },
  status_options_progress: { en: "In progress", ta: "நடக்கிறது" },
  status_options_done: { en: "Done", ta: "முடிந்தது" },
  status_options_na: { en: "Not for me", ta: "எனக்கில்லை" },

  back_home: { en: "Back to season board", ta: "பருவப் பலகைக்குத் திரும்பு" },
  footer_note: {
    en: "Payir works fully offline. Your data never leaves this device.",
    ta: "பயிர் முழுமையாக ஆஃப்லைனில் இயங்கும். உங்கள் தரவு இந்தச் சாதனத்தை விட்டு வெளியேறாது.",
  },
  honesty_line: {
    en: "Reference data: MSP from the Cabinet press release of 13 May 2026; seasons from TN agriculture department tables; PMFBY terms from the scheme portal. Deadlines move — verify with your agriculture officer before you act on one.",
    ta: "குறிப்புத் தரவு: 13 மே 2026 அமைச்சரவை அறிக்கையிலிருந்து MSP; வேளாண் துறை அட்டவணையிலிருந்து பருவங்கள்; திட்ட இணையதளத்திலிருந்து காப்பீடு விதிகள். காலக்கெடுகள் மாறும் — செயல்படுமுன் அலுவலரிடம் உறுதி செய்யுங்கள்.",
  },
};

const LangCtx = createContext<{ lang: Lang; t: (k: string) => string; setLang: (l: Lang) => void }>({
  lang: "en",
  t: (k) => k,
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("payir:lang");
      if (saved === "ta" || saved === "en") setLangState(saved);
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("payir:lang", l); } catch {}
  };
  /* Screen readers pronounce Tamil text wrong when the document says "en" —
     and the farmers who need the Tamil UI most are also the ones most likely
     to rely on a screen reader. Keep <html lang> in sync with the toggle. */
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const t = (k: string) => STRINGS[k]?.[lang] ?? k;
  return <LangCtx.Provider value={{ lang, t, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

/* Pick the right language string from a bilingual data object. */
export function pick<T extends { en: string; ta: string }>(obj: T, lang: Lang): string {
  return lang === "ta" ? obj.ta : obj.en;
}
