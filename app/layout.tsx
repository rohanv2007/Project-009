import type { Metadata, Viewport } from "next";
import "./globals.css";
import Shell from "../components/shell";
import { LangProvider } from "../lib/i18n";
import { DBProvider } from "../lib/db";

export const metadata: Metadata = {
  title: "Payir — The farmer's season companion",
  description:
    "Season calendar, MSP price board, crop doctor, cost ledger and scheme desk for Tamil Nadu farmers. Private, bilingual, fully offline.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Payir", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2f5233",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <LangProvider>
          <DBProvider>
            <Shell>{children}</Shell>
          </DBProvider>
        </LangProvider>
      </body>
    </html>
  );
}
