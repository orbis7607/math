"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "복소수와 켤레복소수의 관계를 설명해줘",
  "이차방정식의 근의 공식 유도 과정을 알려줘",
  "삼각함수 sin, cos, tan의 차이가 뭐야?",
  "미분이 뭔지 쉽게 설명해줘",
  "확률과 통계의 기본 개념을 알려줘",
  "수열의 극한을 어떻게 구해?",
];

// Simple markdown renderer for bold, code, newlines
function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold **text**
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={j} className="px-1.5 py-0.5 rounded bg-slate-700 text-indigo-300 text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={j}>{part}</span>;
    });
    return (
      <span key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "안녕하세요! 저는 EduCraft 수학 AI 튜터입니다. 🎓\n\n수학에 대한 어떤 질문이든 자유롭게 물어보세요! 개념 설명, 풀이 과정, 공식 유도 등 단계별로 친절하게 도와드리겠습니다. 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: Message = { role: "user", content: trimmed };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "서버 오류가 발생했습니다.");
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "오류가 발생했습니다.";
        setError(msg);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "안녕하세요! 저는 EduCraft 수학 AI 튜터입니다. 🎓\n\n수학에 대한 어떤 질문이든 자유롭게 물어보세요! 개념 설명, 풀이 과정, 공식 유도 등 단계별로 친절하게 도와드리겠습니다. 😊",
      },
    ]);
    setError("");
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-8 gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs font-semibold text-indigo-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>GPT-4o mini 기반</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            수학 AI 튜터
          </h1>
          <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
            수학 개념, 풀이 과정, 공식 유도까지 — 무엇이든 물어보세요!
          </p>
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Chat Window */}
          <div className="flex-1 flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-md shadow-indigo-500/20">
                  🤖
                </div>
                <div>
                  <p className="font-bold text-sm text-white">EduCraft 수학 튜터</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400">온라인</span>
                  </div>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-all"
                title="대화 초기화"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                초기화
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[400px] max-h-[500px]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white"
                  }`}>
                    {msg.role === "user" ? "나" : "🤖"}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50"
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex gap-2 items-start p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="수학 질문을 입력하세요... (Shift+Enter로 줄바꿈)"
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 resize-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 min-h-[46px] max-h-[120px] overflow-y-auto"
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all active:scale-95 shadow-md shadow-indigo-600/20"
                >
                  {isLoading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </form>
              <p className="text-[10px] text-slate-600 mt-2 text-center">
                Enter로 전송 · Shift+Enter로 줄바꿈 · AI 답변은 참고용으로만 활용하세요
              </p>
            </div>
          </div>

          {/* Right sidebar: quick questions */}
          <div className="lg:w-72 flex flex-col gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
                <span className="text-base">⚡</span> 빠른 질문
              </h3>
              <div className="space-y-2">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="w-full text-left text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2.5 rounded-xl transition-all border border-transparent hover:border-slate-700 leading-relaxed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Info card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/20 shadow-xl">
              <h3 className="font-bold text-sm text-indigo-300 mb-3 flex items-center gap-2">
                <span>💡</span> 이런 질문을 해보세요
              </h3>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <li className="flex gap-2"><span className="text-indigo-400 flex-shrink-0">•</span><span>특정 개념의 뜻을 물어보기</span></li>
                <li className="flex gap-2"><span className="text-indigo-400 flex-shrink-0">•</span><span>풀이 과정 단계별 설명 요청</span></li>
                <li className="flex gap-2"><span className="text-indigo-400 flex-shrink-0">•</span><span>공식 유도 과정 설명</span></li>
                <li className="flex gap-2"><span className="text-indigo-400 flex-shrink-0">•</span><span>예제 문제 풀이 요청</span></li>
                <li className="flex gap-2"><span className="text-indigo-400 flex-shrink-0">•</span><span>틀린 풀이 어디가 잘못됐는지 확인</span></li>
              </ul>
            </div>

            {/* Stats card */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="font-bold text-sm text-slate-200 mb-3">📊 이번 세션</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xl font-black text-indigo-400">
                    {messages.filter((m) => m.role === "user").length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">내 질문</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xl font-black text-purple-400">
                    {messages.filter((m) => m.role === "assistant").length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">AI 답변</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
