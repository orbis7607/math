import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduCraft | 나만의 교육용 웹앱 만들기",
  description: "선생님과 학생들이 자유롭게 활용할 수 있는 심플하고 강력한 교육용 웹앱 보일러플레이트입니다. 쉽고 빠른 개발을 시작해 보세요.",
  keywords: ["교육", "웹앱", "보일러플레이트", "선생님", "코딩 교육", "Next.js", "Tailwind CSS"],
  authors: [{ name: "EduCraft Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Graduation Cap Logo */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-5.5 w-5.5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A5.905 5.905 0 0 1 8 3.447M6.738 13.5c0-1.906.1-3.805.298-5.696m15.482 0a50.57 50.57 0 0 1 2.658.813A5.905 5.905 0 0 1 16 20.553M17.262 13.5c0-1.906-.1-3.805-.298-5.696m-1.025 8.163a3.375 3.375 0 1 1-6.914 0m6.914 0a3.375 3.375 0 0 0-6.914 0"
                  />
                </svg>
              </div>
              <Link
                id="header-logo"
                href="/"
                className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400"
              >
                EduCraft
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link
                id="nav-home"
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors dark:text-slate-300 dark:hover:text-indigo-400"
              >
                홈
              </Link>
              <Link
                id="nav-features"
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors dark:text-slate-300 dark:hover:text-indigo-400"
              >
                주요 기능
              </Link>
              <Link
                id="nav-templates"
                href="#templates"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors dark:text-slate-300 dark:hover:text-indigo-400"
              >
                템플릿
              </Link>
              <Link
                id="nav-docs"
                href="#docs"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors dark:text-slate-300 dark:hover:text-indigo-400"
              >
                가이드
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                id="btn-nav-start"
                href="#get-started"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                시작하기
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">EduCraft</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  선생님들의 혁신적인 수업과 교육을 지원합니다.
                </p>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                &copy; {new Date().getFullYear()} EduCraft. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

