"use client";

import React from "react";
import Link from "next/link";
import { useLang } from "../lib/i18n";

export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="kicker mb-2">{children}</p>;
}

export function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  const { lang } = useLang();
  return (
    <header className="mb-6">
      <Kicker>{kicker}</Kicker>
      <h1 className={`headline text-3xl md:text-4xl font-bold ${lang === "ta" ? "ta-fallback" : ""}`}>{title}</h1>
      {sub && <p className={`mt-3 text-[1.02rem] text-[var(--color-ink-soft)] max-w-2xl ${lang === "ta" ? "ta-fallback" : ""}`}>{sub}</p>}
    </header>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card card-pad ${className}`}>{children}</div>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="headline text-xl font-bold mb-3">{children}</h2>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  return (
    <div className={`card card-pad text-center text-[var(--color-ink-soft)] ${lang === "ta" ? "ta-fallback" : ""}`}>
      {children}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card card-pad">
      <p className="kicker mb-1">{label}</p>
      <p className="headline text-2xl font-bold">{value}</p>
      {sub && <p className="text-sm text-[var(--color-ink-soft)] mt-1">{sub}</p>}
    </div>
  );
}

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-semibold mb-1 text-[var(--color-ink-soft)]">{label}</span>
      {children}
    </label>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto card-pad rounded-b-none sm:rounded-b-[2px]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="headline text-xl font-bold">{title}</h3>
          <button className="btn btn-ghost !min-h-0 !py-1 !px-3 text-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function BackHome() {
  const { t } = useLang();
  return (
    <div className="no-print mt-8">
      <Link href="/" className="btn btn-ghost">← {t("back_home")}</Link>
    </div>
  );
}
