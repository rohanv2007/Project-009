"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "../lib/i18n";

const NAV = [
  { href: "/", key: "nav_home" },
  { href: "/prices", key: "nav_prices" },
  { href: "/doctor", key: "nav_doctor" },
  { href: "/calendar", key: "nav_calendar" },
  { href: "/field-guide", key: "nav_guide" },
  { href: "/ledger", key: "nav_ledger" },
  { href: "/schemes", key: "nav_schemes" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useLang();
  const path = usePathname();
  /* Big-text mode: persisted on the device, applied to the root so all
     rem sizes scale. Client-only (prerender-safe). */
  const [big, setBig] = useState(false);
  useEffect(() => {
    try {
      const v = localStorage.getItem("payir:bigtext") === "1";
      setBig(v);
      document.documentElement.classList.toggle("big-text", v);
    } catch {}
  }, []);
  const toggleBig = () => {
    const v = !big;
    setBig(v);
    try { localStorage.setItem("payir:bigtext", v ? "1" : "0"); } catch {}
    document.documentElement.classList.toggle("big-text", v);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[var(--color-card)] focus:text-[var(--color-ink)] focus:px-4 focus:py-2 focus:border focus:border-[var(--color-accent)] focus:font-semibold"
      >
        {lang === "ta" ? "முக்கிய உள்ளடக்கத்திற்குச் செல்" : "Skip to main content"}
      </a>
      <header className="no-print border-b border-[var(--color-line)] bg-[var(--color-card)] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="headline text-2xl font-bold text-[var(--color-accent-deep)]">🌾 {t("app_name")}</span>
            <span className="hidden sm:inline text-xs text-[var(--color-ink-faint)]">{t("app_tagline")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-sm"
              onClick={toggleBig}
              aria-pressed={big}
              aria-label={lang === "ta" ? "பெரிய எழுத்து" : "Larger text"}
              title={lang === "ta" ? "பெரிய எழுத்து" : "Larger text"}
            >
              A{big ? "−" : "+"}
            </button>
            <button
              className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-sm"
              onClick={() => setLang(lang === "en" ? "ta" : "en")}
              aria-label="Switch language"
            >
              {t("lang_toggle")}
            </button>
          </div>
        </div>
        <nav className="border-t border-[var(--color-line)]" aria-label="Main">
          <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {NAV.map((n) => {
              const active = path === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px ${
                    active
                      ? "border-[var(--color-accent)] text-[var(--color-accent-deep)]"
                      : "border-transparent text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {t(n.key)}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main id="main-content" className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-8">{children}</main>

      <footer className="no-print border-t border-[var(--color-line)] mt-8">
        <div className="max-w-5xl mx-auto px-4 py-5 text-sm text-[var(--color-ink-faint)]">
          <p className={lang === "ta" ? "ta-fallback" : ""}>{t("footer_note")}</p>
        </div>
      </footer>
    </div>
  );
}
