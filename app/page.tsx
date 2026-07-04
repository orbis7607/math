"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

// Types
interface ComplexPair {
  id: number;
  num: string;
  conj: string;
}

interface Card {
  id: string;
  pairId: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: "original" | "conjugate";
}

interface LeaderboardEntry {
  id: string;
  created_at: string;
  player_name: string;
  score: number;
  time_spent: number;
  difficulty: "easy" | "medium" | "hard";
  is_completed: boolean;
}

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

// Complex Numbers Pool
const COMPLEX_POOL: ComplexPair[] = [
  { id: 1, num: "2 + 3i", conj: "2 - 3i" },
  { id: 2, num: "-4 + i", conj: "-4 - i" },
  { id: 3, num: "5 - 2i", conj: "5 + 2i" },
  { id: 4, num: "-1 - 5i", conj: "-1 + 5i" },
  { id: 5, num: "7i", conj: "-7i" },
  { id: 6, num: "-3i", conj: "3i" },
  { id: 7, num: "4 + 4i", conj: "4 - 4i" },
  { id: 8, num: "-2 - 2i", conj: "-2 + 2i" },
  { id: 9, num: "1 + 6i", conj: "1 - 6i" },
  { id: 10, num: "-5 + 3i", conj: "-5 - 3i" },
  { id: 11, num: "8 - i", conj: "8 + i" },
  { id: 12, num: "-6 - 4i", conj: "-6 + 4i" },
];

const DIFFICULTY_CONFIG = {
  easy: { pairsCount: 4, timeLimit: 40, gridCols: "grid-cols-4" },
  medium: { pairsCount: 6, timeLimit: 60, gridCols: "grid-cols-4" },
  hard: { pairsCount: 8, timeLimit: 80, gridCols: "grid-cols-4" },
};

export default function Home() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [cards, setCards] = useState<Card[]>([]);
  const [firstSelected, setFirstSelected] = useState<Card | null>(null);
  const [shakeCardIds, setShakeCardIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [score, setScore] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Player info & Leaderboard state
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [dbStatusMsg, setDbStatusMsg] = useState("");

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiAnimationRef = useRef<number | null>(null);

  // Play retro synthesised sound using Web Audio API
  const playSound = useCallback((type: "flip" | "match" | "mismatch" | "victory" | "gameover") => {
    if (isMuted || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      
      if (type === "flip") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "match") {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.25);
        });
      } else if (type === "mismatch") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.setValueAtTime(120, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "victory") {
        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.08, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.5);
        });
      } else if (type === "gameover") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.8);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start();
        osc.stop(now + 0.8);
      }
    } catch (e) {
      console.warn("Audio Context init blocked or failed: ", e);
    }
  }, [isMuted]);

  // Get Leaderboard Data
  const loadLocalLeaderboard = useCallback(() => {
    try {
      const localData = localStorage.getItem("complex_leaderboard");
      if (localData) {
        const parsed = JSON.parse(localData);
        setTimeout(() => setLeaderboard(parsed), 0);
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("complex_game_results")
          .select("*")
          .eq("is_completed", true)
          .order("score", { ascending: false })
          .limit(10);

        if (error) throw error;
        setLeaderboard(data || []);
      } catch (err) {
        console.error("Supabase load error, falling back to local storage:", err);
        loadLocalLeaderboard();
      }
    } else {
      loadLocalLeaderboard();
    }
  }, [loadLocalLeaderboard]);

  const saveLocalScore = useCallback((result: Omit<LeaderboardEntry, "id" | "created_at">) => {
    try {
      const localData = localStorage.getItem("complex_leaderboard");
      let list: LeaderboardEntry[] = localData ? JSON.parse(localData) : [];
      
      const newEntry: LeaderboardEntry = {
        ...result,
        id: Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString(),
      };
      
      list.push(newEntry);
      list.sort((a, b) => b.score - a.score);
      list = list.slice(0, 10);
      
      localStorage.setItem("complex_leaderboard", JSON.stringify(list));
      setLeaderboard(list);
    } catch (e) {
      console.error("Local storage save error:", e);
    }
  }, []);

  // Save Leaderboard Data
  const saveScore = useCallback(async () => {
    if (!playerName.trim()) return;
    setIsSubmitting(true);
    setDbStatusMsg("");

    const newResult = {
      player_name: playerName.trim(),
      score: score,
      time_spent: DIFFICULTY_CONFIG[difficulty].timeLimit - timeRemaining,
      matched_count: matchedCount,
      total_pairs: DIFFICULTY_CONFIG[difficulty].pairsCount,
      difficulty: difficulty,
      is_completed: true,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("complex_game_results")
          .insert([newResult]);

        if (error) throw error;
        setDbStatusMsg("Supabase 데이터베이스에 기록을 성공적으로 저장했습니다! 🎉");
        await loadLeaderboard();
        setTimeout(() => setShowSubmitModal(false), 1500);
      } catch (err: unknown) {
        console.error("Supabase insert error, saving locally:", err);
        const errMsg = err instanceof Error ? err.message : "알 수 없는 오류";
        setDbStatusMsg(`서버 저장 실패 (${errMsg}). 로컬에 임시 저장됩니다.`);
        saveLocalScore(newResult);
        setTimeout(() => setShowSubmitModal(false), 2000);
      }
    } else {
      setDbStatusMsg("Supabase 설정이 없어 웹 브라우저 로컬 저장소에 저장했습니다! 💻");
      saveLocalScore(newResult);
      setTimeout(() => setShowSubmitModal(false), 2000);
    }
    setIsSubmitting(false);
  }, [playerName, score, difficulty, timeRemaining, matchedCount, loadLeaderboard, saveLocalScore]);

  const handleGameOver = useCallback(() => {
    setIsGameOver(true);
    playSound("gameover");
    if (timerRef.current) clearInterval(timerRef.current);
  }, [playSound]);

  const handleVictory = useCallback(() => {
    setIsCompleted(true);
    playSound("victory");
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Auto-open scoreboard save modal
    setTimeout(() => {
      setShowSubmitModal(true);
    }, 1200);
  }, [playSound]);

  // Start the Game
  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const config = DIFFICULTY_CONFIG[difficulty];
    
    // Choose random pairs from pool
    const shuffledPool = [...COMPLEX_POOL].sort(() => Math.random() - 0.5);
    const selectedPairs = shuffledPool.slice(0, config.pairsCount);
    
    // Create card structures
    const cardSet: Card[] = [];
    selectedPairs.forEach((pair) => {
      cardSet.push({
        id: `card-${pair.id}-num`,
        pairId: pair.id,
        value: pair.num,
        isFlipped: false,
        isMatched: false,
        type: "original",
      });
      cardSet.push({
        id: `card-${pair.id}-conj`,
        pairId: pair.id,
        value: pair.conj,
        isFlipped: false,
        isMatched: false,
        type: "conjugate",
      });
    });

    // Shuffle final card list
    const shuffledCards = cardSet.sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setFirstSelected(null);
    setShakeCardIds([]);
    setIsChecking(false);
    setTimeRemaining(config.timeLimit);
    setScore(0);
    setMatchedCount(0);
    setIsCompleted(false);
    setIsGameOver(false);
    setIsStarted(true);
    setDbStatusMsg("");
  }, [difficulty]);

  // Card Selection Handler
  const handleCardClick = useCallback((card: Card) => {
    if (!isStarted || isCompleted || isGameOver || isChecking) return;
    if (card.isFlipped || card.isMatched) return;

    // Play flip audio
    playSound("flip");

    // Temporarily flip the selected card
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c))
    );

    if (!firstSelected) {
      setFirstSelected(card);
    } else {
      setIsChecking(true);
      
      // Compare cards
      const match = firstSelected.pairId === card.pairId;

      if (match) {
        // Success Match
        setTimeout(() => {
          playSound("match");
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === card.pairId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          
          const newMatchedCount = matchedCount + 1;
          setMatchedCount(newMatchedCount);
          
          // Calculate score: match base + speed multiplier
          const baseMatchScore = 150;
          const speedBonus = Math.floor(timeRemaining * 1.5);
          setScore((prev) => prev + baseMatchScore + speedBonus);

          setFirstSelected(null);
          setIsChecking(false);

          // Win verification
          const config = DIFFICULTY_CONFIG[difficulty];
          if (newMatchedCount === config.pairsCount) {
            handleVictory();
          }
        }, 600);
      } else {
        // Mismatch
        setTimeout(() => {
          playSound("mismatch");
          setShakeCardIds([firstSelected.id, card.id]);
          
          // Apply time penalty
          setTimeRemaining((prev) => Math.max(0, prev - 3));
          // Apply score penalty
          setScore((prev) => Math.max(0, prev - 30));

          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstSelected.id || c.id === card.id
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setShakeCardIds([]);
            setFirstSelected(null);
            setIsChecking(false);
          }, 400); // end of shake
        }, 600);
      }
    }
  }, [
    isStarted,
    isCompleted,
    isGameOver,
    isChecking,
    firstSelected,
    matchedCount,
    difficulty,
    timeRemaining,
    playSound,
    handleVictory,
  ]);

  // Load leaderboard on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeaderboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [difficulty, loadLeaderboard]);

  // Handle Game Timer
  useEffect(() => {
    if (isStarted && !isCompleted && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isCompleted, isGameOver, handleGameOver]);

  // Handle Confetti Canvas Rendering
  useEffect(() => {
    if (isCompleted && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ["#6366f1", "#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];
      const particles: ConfettiParticle[] = Array.from({ length: 120 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
      }));

      const resizeHandler = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener("resize", resizeHandler);

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotationSpeed;

          if (p.y < canvas.height) {
            active = true;
          } else {
            // Respawn at top
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });

        if (active) {
          confettiAnimationRef.current = requestAnimationFrame(render);
        }
      };

      render();

      return () => {
        window.removeEventListener("resize", resizeHandler);
        if (confettiAnimationRef.current) {
          cancelAnimationFrame(confettiAnimationRef.current);
        }
      };
    }
  }, [isCompleted]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4 overflow-x-hidden font-sans">
      {/* Floating AI Tutor Button */}
      <Link
        href="/chatbot"
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all"
      >
        <span className="text-lg">🤖</span>
        <span className="hidden sm:block">수학 AI 튜터</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white/70" />
        </span>
      </Link>
      
      {/* 3D and utility custom CSS injector */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes card-shake {
          0%, 100% { transform: rotateY(180deg) translateX(0); }
          20%, 60% { transform: rotateY(180deg) translateX(-5px); }
          40%, 80% { transform: rotateY(180deg) translateX(5px); }
        }
        .animate-card-shake {
          animation: card-shake 0.4s ease-in-out;
        }
      `}</style>

      {/* Confetti effect canvas */}
      {isCompleted && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-50 w-full h-full"
        />
      )}

      {/* Main Container */}
      <div className="w-full max-w-4xl flex flex-col gap-8 z-10">
        
        {/* Header Block */}
        <div className="text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full -z-10" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs font-semibold text-indigo-400">
            <span>수학 놀이터</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>복소수 Conjugate</span>
          </div>

          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            켤레복소수 카드 뒤집기
          </h1>
          
          <p className="mt-3 text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            시간 제한 내에 원래 복소수 <span className="text-indigo-300 font-bold">a + bi</span>와 
            켤레복소수 <span className="text-pink-300 font-bold">a - bi</span> 카드를 짝지어 보세요.
          </p>
        </div>

        {/* Global Controls & DB State Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">난이도:</span>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              {(["easy", "medium", "hard"] as const).map((lvl) => (
                <button
                  key={lvl}
                  disabled={isStarted && !isCompleted && !isGameOver}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    difficulty === lvl
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200 disabled:opacity-30"
                  }`}
                >
                  {lvl === "easy" ? "쉬움 (8장)" : lvl === "medium" ? "보통 (12장)" : "어려움 (16장)"}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Status Indicators */}
          <div className="flex items-center gap-4">
            {/* Database indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
              <span className="text-slate-400">
                {isSupabaseConfigured ? "Supabase 연결됨" : "로컬 모드"}
              </span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-colors"
              title={isMuted ? "음소거 해제" : "음소거"}
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Game Arena Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Center - The Game Board */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Stats Dashboard */}
            {isStarted && (
              <div className="grid grid-cols-3 gap-4">
                {/* Timer Box */}
                <div className="relative overflow-hidden p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">남은 시간</span>
                  <span className={`text-2xl font-black mt-1 tabular-nums ${timeRemaining <= 10 ? "text-rose-500 animate-pulse" : "text-indigo-400"}`}>
                    {timeRemaining}초
                  </span>
                  {/* Visual timer bar at bottom */}
                  <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
                    <div 
                      className={`h-full transition-all duration-1000 ${timeRemaining <= 10 ? "bg-rose-500" : timeRemaining <= 25 ? "bg-amber-500" : "bg-indigo-500"}`}
                      style={{ width: `${(timeRemaining / DIFFICULTY_CONFIG[difficulty].timeLimit) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Score Box */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">현재 점수</span>
                  <span className="text-2xl font-black mt-1 text-purple-400 tabular-nums">
                    {score}
                  </span>
                </div>

                {/* Matches Box */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">맞춘 카드 쌍</span>
                  <span className="text-2xl font-black mt-1 text-emerald-400 tabular-nums">
                    {matchedCount} / {DIFFICULTY_CONFIG[difficulty].pairsCount}
                  </span>
                </div>
              </div>
            )}

            {/* Board Container */}
            <div className="min-h-[380px] p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm flex flex-col items-center justify-center relative">
              
              {!isStarted && !isCompleted && !isGameOver && (
                <div className="text-center p-6 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20 mb-6">
                    🎮
                  </div>
                  <h3 className="text-xl font-bold">준비되셨나요?</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm">
                    상단의 난이도를 선택하고 아래의 시작 버튼을 클릭하면 {DIFFICULTY_CONFIG[difficulty].timeLimit}초 타이머와 함께 카드가 무작위 배치됩니다.
                  </p>
                  <button
                    onClick={startGame}
                    className="mt-6 px-6 py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition-all shadow-lg shadow-indigo-600/30"
                  >
                    게임 시작하기
                  </button>
                </div>
              )}

              {/* Game Over Screen */}
              {isGameOver && (
                <div className="absolute inset-0 bg-slate-950/90 rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-3xl mb-4 text-rose-500">
                    ☠️
                  </div>
                  <h3 className="text-2xl font-black text-rose-500">시간 초과!</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-xs">
                    제한 시간이 끝났습니다. 최종 매칭 쌍: {matchedCount}개, 획득 점수: {score}점
                  </p>
                  <button
                    onClick={startGame}
                    className="mt-6 px-5 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
                  >
                    다시 시도하기
                  </button>
                </div>
              )}

              {/* Victory Screen */}
              {isCompleted && (
                <div className="absolute inset-0 bg-slate-950/90 rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mb-4 text-emerald-400">
                    👑
                  </div>
                  <h3 className="text-2xl font-black text-emerald-400">미션 완료!</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-xs">
                    축하합니다! 모든 켤레복소수 쌍을 연결했습니다.
                    <br />
                    최종 점수: <strong className="text-indigo-400">{score}점</strong>
                  </p>
                  
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="px-5 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/30"
                    >
                      기록 등록하기
                    </button>
                    <button
                      onClick={startGame}
                      className="px-5 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
                    >
                      한 판 더 하기
                    </button>
                  </div>
                </div>
              )}

              {/* Cards Grid */}
              {isStarted && !isGameOver && (
                <div className="grid grid-cols-4 gap-4 w-full max-w-2xl">
                  {cards.map((card) => {
                    const isFlippedOrMatched = card.isFlipped || card.isMatched;
                    const isShaking = shakeCardIds.includes(card.id);
                    return (
                      <div
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        className="h-24 md:h-28 cursor-pointer perspective-1000 select-none group"
                      >
                        <div
                          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                            isShaking ? "animate-card-shake" : ""
                          }`}
                          style={{
                            transform: isFlippedOrMatched ? "rotateY(180deg)" : "rotateY(0deg)",
                          }}
                        >
                          {/* Card Front (Value shown) */}
                          <div
                            className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl flex flex-col items-center justify-center p-2 border-2 text-center transition-all ${
                              card.isMatched
                                ? "bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10 text-emerald-400"
                                : "bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/5 group-hover:border-indigo-400"
                            }`}
                          >
                            <span className="text-xs text-slate-500 mb-1 font-mono uppercase tracking-widest scale-90">
                              {card.type === "original" ? "Original" : "Conjugate"}
                            </span>
                            <span className="text-base md:text-lg font-black tracking-tight select-none">
                              {card.value}
                            </span>
                          </div>

                          {/* Card Back (Decorative math style) */}
                          <div className="absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-slate-800 flex items-center justify-center group-hover:border-indigo-500/40 transition-colors shadow-lg">
                            <span className="text-xl font-bold bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                              z
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Math concept brief details */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5">
                💡 켤레복소수(Complex Conjugate) 핵심 가이드
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                복소수 <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-300">z = a + bi</code> (a, b는 실수)가 있을 때, 
                허수부분의 부호를 바꾼 복소수 <code className="bg-slate-950 px-1 py-0.5 rounded text-pink-300">z̄ = a - bi</code>를 
                그 복소수의 <strong>켤레복소수</strong>라고 합니다.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div className="p-2 bg-slate-950/60 rounded-lg text-center border border-slate-800">
                  <div className="text-[10px] text-slate-500">기본 매칭</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">2 + 3i &harr; 2 - 3i</div>
                </div>
                <div className="p-2 bg-slate-950/60 rounded-lg text-center border border-slate-800">
                  <div className="text-[10px] text-slate-500">부호 주의</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">-4 + i &harr; -4 - i</div>
                </div>
                <div className="p-2 bg-slate-950/60 rounded-lg text-center border border-slate-800">
                  <div className="text-[10px] text-slate-500">순허수</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">7i &harr; -7i</div>
                </div>
                <div className="p-2 bg-slate-950/60 rounded-lg text-center border border-slate-800">
                  <div className="text-[10px] text-slate-500">음의 순허수</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">-3i &harr; 3i</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/80 shadow-xl flex flex-col min-h-[480px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  🏆 명예의 전당 (Top 10)
                </h3>
                <button
                  onClick={loadLeaderboard}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  title="새로고침"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  새로고침
                </button>
              </div>

              {/* Leaderboard Entries */}
              <div className="flex-1 mt-4 overflow-y-auto max-h-[420px] pr-1 space-y-2.5">
                {leaderboard.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                    <span className="text-3xl mb-2">📜</span>
                    <p className="text-xs">아직 등록된 명예의 전당 기록이 없습니다.</p>
                    <p className="text-[10px] mt-1">게임을 완료하고 첫 기록을 세워보세요!</p>
                  </div>
                ) : (
                  leaderboard.map((entry, index) => {
                    const isGold = index === 0;
                    const isSilver = index === 1;
                    const isBronze = index === 2;
                    return (
                      <div
                        key={entry.id || index}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isGold
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : isSilver
                            ? "bg-slate-300/10 border-slate-300/20 text-slate-300"
                            : isBronze
                            ? "bg-amber-700/10 border-amber-700/20 text-amber-600"
                            : "bg-slate-950/40 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center text-sm font-black">
                            {isGold ? "🥇" : isSilver ? "🥈" : isBronze ? "🥉" : `${index + 1}`}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                              {entry.player_name}
                              <span className={`text-[9px] px-1.5 py-0.2 rounded border ${
                                entry.difficulty === "hard" 
                                  ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                                  : entry.difficulty === "medium"
                                  ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              }`}>
                                {entry.difficulty === "hard" ? "상" : entry.difficulty === "medium" ? "중" : "하"}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {entry.time_spent}초 소요
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-sm text-indigo-400 font-mono">
                            {entry.score}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Record Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md transform overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 text-left align-middle shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                ✍️ 명예의 전당 등록
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-around text-center">
                <div>
                  <div className="text-[10px] text-slate-500">난이도</div>
                  <div className="text-xs font-bold text-slate-300 uppercase mt-0.5">
                    {difficulty === "hard" ? "어려움" : difficulty === "medium" ? "보통" : "쉬움"}
                  </div>
                </div>
                <div className="w-px bg-slate-800" />
                <div>
                  <div className="text-[10px] text-slate-500">소요시간</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">
                    {DIFFICULTY_CONFIG[difficulty].timeLimit - timeRemaining}초
                  </div>
                </div>
                <div className="w-px bg-slate-800" />
                <div>
                  <div className="text-[10px] text-slate-500">최종점수</div>
                  <div className="text-xs font-black text-indigo-400 mt-0.5">
                    {score}점
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  도전자 이름 (최대 10자)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="이름을 입력하세요"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>

              {dbStatusMsg && (
                <div className={`p-3 rounded-xl text-xs ${
                  dbStatusMsg.includes("실패") || dbStatusMsg.includes("오류")
                    ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                }`}>
                  {dbStatusMsg}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
              >
                취소
              </button>
              <button
                onClick={saveScore}
                disabled={isSubmitting || !playerName.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    등록 중...
                  </>
                ) : (
                  "등록하기"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
