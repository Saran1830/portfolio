import type { Metadata } from "next";
import { Fraunces, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GridBackground from "@/components/GridBackground";
import Sidebar from "@/components/Sidebar";
import GhostCompanion from "@/components/GhostCompanion";

const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Saranya | Portfolio",
  description: "Portfolio of Nunna Lakshmi Saranya — Full Stack & AI Engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}
      >
        <GridBackground />
        {/* black wash: the grid stays visible under the black card and
            fades out into black before the content column begins */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[1] hidden lg:block lg:bg-[linear-gradient(to_right,rgba(11,11,15,0)_21rem,#0b0b0f_26rem)] xl:bg-[linear-gradient(to_right,rgba(11,11,15,0)_25rem,#0b0b0f_30rem)] 2xl:bg-[linear-gradient(to_right,rgba(11,11,15,0)_27rem,#0b0b0f_32rem)]"
        />
        <Sidebar />
        <div className="relative z-10 lg:pl-[22.5rem] xl:pl-[26.5rem] 2xl:pl-[28.5rem]">
          {children}
        </div>
        {/* outside the z-10 content wrapper so the ghost, chat, and
            sticky note can layer above the z-20 sidebar */}
        <GhostCompanion />
      </body>
    </html>
  );
}
