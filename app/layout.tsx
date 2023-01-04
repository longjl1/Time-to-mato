import type { Metadata } from "next";
import "./globals.css";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "Time-to-mato",
  description: "A monochrome focus workspace with a timer, task board, and history views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-frame">
          <header className="site-header">
            <div>
              <p className="site-kicker">Time-to-mato</p>
              <h1 className="site-title">Quiet focus, visible progress.</h1>
            </div>
            <MainNav />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
