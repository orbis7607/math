"use client";

import { useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Features list to showcase what teachers can build
  const features = [
    {
      title: "랜덤 발표기",
      description: "우리 반 학생 중 오늘 발표할 사람을 공정하고 재미있게 무작위로 추첨해 줍니다.",
      icon: "🎯",
      badge: "인기",
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "집중 타이머",
      description: "퀴즈나 개별 활동 시간 동안 칠판에 크게 띄워둘 수 있는 시각적인 타이머입니다.",
      icon: "⏱️",
      badge: "필수",
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "미니 퀴즈 대결",
      description: "수업 후 배운 내용을 OX 퀴즈나 객관식으로 점검하는 간단한 복습용 게임입니다.",
      icon: "⚡",
      badge: "재미",
      color: "from-indigo-500 to-blue-600",
    },
  ];

  return (
    <div className="relative isolate overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background decorative glowing blobs */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-950/30 dark:text-indigo-400">
            <span>선생님을 위한 쉬운 코딩 놀이터</span>
            <span className="h-4 w-px bg-indigo-200 dark:bg-indigo-900" />
            <span>EduCraft v1.0 🚀</span>
          </div>

          {/* Hero Heading */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            나만의{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              교육용 웹앱
            </span>{" "}
            만들기
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            코딩을 전혀 몰라도 괜찮습니다. 이미 준비된 교실용 템플릿과 컴포넌트들을 이리저리 조합하여
            우리 반 학생들만을 위한 특별하고 유용한 수업 도구를 직접 디자인해 보세요.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              id="btn-add-feature"
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:scale-[1.03] active:scale-[0.98] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              <span>여기에 기능 추가해보기</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>

            <a
              id="link-guides"
              href="#docs"
              className="text-sm font-semibold leading-6 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              사용 가이드 보기 <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Features Showcase Section */}
        <div id="features" className="mx-auto mt-24 max-w-5xl sm:mt-32">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              이런 재미있는 수업 도구들을 만들 수 있어요
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              필요에 따라 복사하고 편집하여 언제든지 교실에 최적화된 앱을 만들 수 있습니다.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${feature.color} text-2xl shadow-sm`}>
                    {feature.icon}
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex justify-end">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors dark:text-slate-500 dark:group-hover:text-indigo-400">
                    도구 수정하기 &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background decorative glowing blobs */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Interactive Feature Modal (Placeholder) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div
            id="modal-content"
            className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold leading-6 text-slate-900 dark:text-white">
                🛠️ 나만의 교실 도구 추가
              </h3>
              <button
                id="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                이 보일러플레이트는 선생님들과 학생들이 바로 커스텀 기능을 제작하여 배포할 수 있는 뼈대 코드입니다.
                <br />
                <br />
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">app/page.tsx</code>에서 새로운 콤포넌트를 작성하거나 다른 라우트를 손쉽게 연결할 수 있습니다!
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                id="btn-modal-cancel"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                닫기
              </button>
              <button
                id="btn-modal-ok"
                onClick={() => {
                  alert("준비 완료! 이제 자신만의 코드를 추가해 보세요!");
                  setIsModalOpen(false);
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                시작해보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

