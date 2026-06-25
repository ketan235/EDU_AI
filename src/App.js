/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  EduAI — AI-Powered Multilingual Educational Assistant
 *  100% FREE APIs | No Sample Data | Real User Data Only
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  FREE APIs USED:
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │  AI Chat/QA   → Google Gemini 1.5 Flash (100% FREE, no card)   │
 *  │  TTS          → Web Speech API (built into every browser, FREE) │
 *  │  STT          → Web Speech Recognition API (browser, FREE)      │
 *  │  Storage      → localStorage (browser, FREE, no server needed)  │
 *  │  Auth         → localStorage-based (no backend needed)          │
 *  │  Analytics    → Computed from stored user activity (FREE)       │
 *  └─────────────────────────────────────────────────────────────────┘
 *
 *  HOW TO RUN (see bottom of file for detailed guide):
 *  1. Get FREE Gemini API key at aistudio.google.com → Get API Key
 *     (No credit card needed — 15 requests/min free forever)
 *  2. npx create-react-app eduai && copy this file to src/App.js
 *  3. npm install recharts
 *  4. npm start
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef,  } from "react";
import {
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
} from "recharts";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg:        "#070B14",
  bgCard:    "#0D1321",
  bgEl:      "#131D2E",
  bgEl2:     "#1A2640",
  border:    "#1E2D45",
  borderMid: "#253650",
  accent:    "#4F8EF7",
  accentLow: "#4F8EF722",
  purple:    "#9B72F0",
  purpleLow: "#9B72F022",
  teal:      "#2DD4BF",
  tealLow:   "#2DD4BF22",
  amber:     "#F59E0B",
  amberLow:  "#F59E0B22",
  red:       "#F87171",
  redLow:    "#F8717122",
  green:     "#34D399",
  greenLow:  "#34D39922",
  textPri:   "#EFF6FF",
  textSec:   "#94A3B8",
  textMuted: "#475569",
  grad1:     "linear-gradient(135deg,#4F8EF7,#9B72F0)",
  grad2:     "linear-gradient(135deg,#2DD4BF,#4F8EF7)",
  grad3:     "linear-gradient(135deg,#F59E0B,#F87171)",
  gradGreen: "linear-gradient(135deg,#34D399,#2DD4BF)",
};

const css = {
  card: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.5rem" },
  cardEl: { background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1rem 1.25rem" },
  btn: (v = "primary") => ({
    padding: "0.55rem 1.2rem", borderRadius: 9, fontSize: 13, fontWeight: 600,
    cursor: "pointer", border: "none", transition: "all 0.15s",
    ...(v === "primary" && { background: T.grad1, color: "#fff" }),
    ...(v === "ghost"   && { background: "transparent", color: T.textSec, border: `1px solid ${T.border}` }),
    ...(v === "teal"    && { background: T.grad2, color: "#fff" }),
    ...(v === "danger"  && { background: T.grad3, color: "#fff" }),
    ...(v === "green"   && { background: T.gradGreen, color: "#fff" }),
  }),
  input: {
    background: T.bgEl2, border: `1px solid ${T.border}`,
    borderRadius: 9, padding: "0.6rem 0.9rem",
    color: T.textPri, fontSize: 14, outline: "none",
    width: "100%", boxSizing: "border-box",
  },
  label: { fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" },
  badge: (c = T.accent) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: c + "22", color: c, border: `1px solid ${c}44`,
  }),
};

// ─── FREE API Constants ───────────────────────────────────────────────────────
const LANGS = [
  { code: "en", label: "English",    bcp: "en-US" },
  { code: "hi", label: "Hindi",      bcp: "hi-IN" },
  { code: "es", label: "Español",    bcp: "es-ES" },
  { code: "fr", label: "Français",   bcp: "fr-FR" },
  { code: "de", label: "Deutsch",    bcp: "de-DE" },
  { code: "zh", label: "中文",       bcp: "zh-CN" },
  { code: "ar", label: "عربي",       bcp: "ar-SA" },
  { code: "ja", label: "日本語",     bcp: "ja-JP" },
  { code: "pt", label: "Português",  bcp: "pt-BR" },
  { code: "ko", label: "한국어",     bcp: "ko-KR" },
  { code: "ru", label: "Русский",    bcp: "ru-RU" },
  { code: "ta", label: "தமிழ்",      bcp: "ta-IN" },
];

const NAV = [
  { id: "dashboard",  icon: "⊞",  label: "Dashboard"  },
  { id: "chat",       icon: "◎",  label: "AI Tutor"   },
  { id: "documents",  icon: "⊡",  label: "Documents"  },
  { id: "quiz",       icon: "◈",  label: "Quiz"       },
  { id: "flashcards", icon: "◧",  label: "Flashcards" },
  { id: "analytics",  icon: "⋯",  label: "Analytics"  },
  { id: "settings",   icon: "◯",  label: "Settings"   },
];

// ─── localStorage helpers (FREE storage) ─────────────────────────────────────
const store = {
  get: (k, def = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

// ─── FREE Google Gemini 1.5 Flash API call ───────────────────────────────────
// 100% free — no credit card needed. Get key at aistudio.google.com
async function callAI(system, userMsg, history = [], apiKey) {
  if (!apiKey) return "⚠️ Please add your free Gemini API key in Settings first.\nGet one free at aistudio.google.com (no credit card needed).";
  try {
    const recentHistory = history.slice(-6);
    const contents = [];
    if (recentHistory.length === 0) {
      contents.push({ role: "user", parts: [{ text: `${system}\n\n---\n${userMsg}` }] });
    } else {
      contents.push({ role: "user", parts: [{ text: `[System: ${system}]` }] });
      contents.push({ role: "model", parts: [{ text: "Understood. I will follow those instructions." }] });
      for (const m of recentHistory) {
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      }
      contents.push({ role: "user", parts: [{ text: userMsg }] });
    }

    // NOTE: Google periodically retires Gemini model names.
    // If you ever get a 404 "model not found" error, check the current
    // free model name at https://ai.google.dev/gemini-api/docs/models
    // and update MODEL below.
    const MODEL = "gemini-2.5-flash";

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || String(res.status);
      if (res.status === 400) return "⚠️ Invalid API key. Get a free one at aistudio.google.com";
      if (res.status === 404) return `⚠️ Model "${MODEL}" was retired by Google. Check https://ai.google.dev/gemini-api/docs/models for the current model name and update it in the code.`;
      if (res.status === 429) return "⚠️ Rate limit reached. Wait a moment and try again.";
      return `⚠️ API Error: ${msg}`;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  } catch (e) {
    return `⚠️ Network error: ${e.message}`;
  }
}

// ─── FREE TTS — Web Speech API ────────────────────────────────────────────────
function speak(text, langBcp = "en-US") {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.slice(0, 500));
  u.lang = langBcp;
  u.rate = 0.92;
  u.pitch = 1;
  // Try to pick a voice matching the language
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.lang.startsWith(langBcp.slice(0, 2)));
  if (match) u.voice = match;
  window.speechSynthesis.speak(u);
}

// ─── FREE STT — Web Speech Recognition API ───────────────────────────────────
function startListening(onResult, langBcp = "en-US") {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = langBcp;
  r.interimResults = true;
  r.onresult = (e) => {
    const t = Array.from(e.results).map(x => x[0].transcript).join("");
    onResult(t, e.results[e.results.length - 1].isFinal);
  };
  r.start();
  return r;
}

// ─── Analytics Logger ─────────────────────────────────────────────────────────
function logActivity(type, data = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `activity_${today}`;
  const day = store.get(key, {
    date: today, studyMinutes: 0, messages: 0,
    quizzesTaken: 0, quizScore: 0, quizTotal: 0,
    flashcardsReviewed: 0, docsUploaded: 0, sessions: 0,
  });
  if (type === "message") { day.messages++; day.studyMinutes += 2; }
  if (type === "quiz_complete") { day.quizzesTaken++; day.quizScore += data.score; day.quizTotal += data.total; day.studyMinutes += 5; }
  if (type === "flashcard") { day.flashcardsReviewed++; day.studyMinutes += 1; }
  if (type === "document") { day.docsUploaded++; day.studyMinutes += 3; }
  if (type === "session_start") { day.sessions++; }
  store.set(key, day);
}

function getActivityHistory() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = `activity_${d.toISOString().slice(0, 10)}`;
    const data = store.get(key, { date: d.toISOString().slice(0, 10), studyMinutes: 0, messages: 0, quizzesTaken: 0, quizScore: 0, quizTotal: 0, flashcardsReviewed: 0 });
    days.push({ ...data, day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()] });
  }
  return days;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, user }) {
  return (
    <div style={{ width: 210, minHeight: "100vh", background: T.bgCard, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "1.25rem 1rem 1rem", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: T.grad1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎓</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPri, lineHeight: 1.2 }}>EduAI</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Free · Powered by Gemini</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "0.6rem 0.6rem" }}>
        {NAV.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)} style={{
            display: "flex", alignItems: "center", gap: 9, width: "100%",
            padding: "0.55rem 0.8rem", borderRadius: 9, border: "none",
            background: active === item.id ? T.accentLow : "transparent",
            color: active === item.id ? T.accent : T.textSec,
            fontSize: 13, fontWeight: active === item.id ? 600 : 400,
            cursor: "pointer", marginBottom: 1,
            borderLeft: active === item.id ? `2px solid ${T.accent}` : "2px solid transparent",
          }}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ padding: "0.9rem 1rem", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.grad1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textPri, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name || "User"}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Free tier</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user, onNav, apiKey }) {
  const activity = getActivityHistory();
  const docs = store.get("documents", []);
  const quizHistory = store.get("quiz_history", []);
  const sessions = store.get("chat_sessions", []);

  const totalMins = activity.reduce((s, d) => s + d.studyMinutes, 0);
  const totalMsgs = activity.reduce((s, d) => s + d.messages, 0);
  const avgScore = quizHistory.length
    ? Math.round(quizHistory.reduce((s, q) => s + (q.score / q.total) * 100, 0) / quizHistory.length)
    : 0;
  const streak = (() => {
    let s = 0;
    for (let i = 6; i >= 0; i--) {
      if (activity[i]?.studyMinutes > 0) s++;
      else if (i < 6) break;
    }
    return s;
  })();

  const stats = [
    { label: "Study Time",    value: totalMins > 0 ? `${totalMins}m` : "0m",        icon: "⏱", color: T.accent },
    { label: "AI Messages",   value: totalMsgs > 0 ? totalMsgs : "0",               icon: "💬", color: T.purple },
    { label: "Avg Quiz Score",value: avgScore > 0 ? `${avgScore}%` : "—",           icon: "🎯", color: T.teal },
    { label: "Day Streak",    value: `${streak}d`,                                   icon: "🔥", color: T.amber },
  ];

  const [recs, setRecs] = useState(store.get("ai_recs", null));
  const [recLoading, setRecLoading] = useState(false);

  const generateRecs = async () => {
    if (!apiKey) { alert("Add your free Gemini API key in Settings first."); return; }
    setRecLoading(true);
    const summary = `User stats: ${totalMins} study minutes this week, ${quizHistory.length} quizzes, avg score ${avgScore}%, ${docs.length} documents, ${totalMsgs} AI messages.`;
    const result = await callAI(
      "You are a personalized learning coach. Based on student analytics, give 3 short, specific, actionable recommendations. Each on a new line starting with an emoji and action verb. Be direct and specific. Max 30 words each.",
      summary, [], apiKey
    );
    store.set("ai_recs", result);
    setRecs(result);
    setRecLoading(false);
  };

  const hasData = totalMins > 0 || totalMsgs > 0;

  return (
    <div style={{ padding: "1.75rem", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.textPri, margin: 0 }}>
          Welcome back, {user.name?.split(" ")[0] || "Learner"} 👋
        </h1>
        <p style={{ color: T.textSec, marginTop: 4, fontSize: 13 }}>
          {hasData ? `${streak} day streak · ${totalMins} minutes studied this week` : "Start learning to see your stats here."}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...css.card, padding: "1.1rem" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: "1.5rem" }}>
        <div style={css.card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri, marginBottom: "1rem" }}>Study Minutes — Last 7 Days</div>
          {hasData ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={activity} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="day" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="studyMinutes" name="Minutes" fill={T.accent} radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 13 }}>
              No activity yet — start a chat session!
            </div>
          )}
        </div>

        <div style={css.card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri, marginBottom: "1rem" }}>Quiz Performance</div>
          {quizHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={quizHistory.slice(-7).map((q, i) => ({ attempt: `#${i+1}`, score: Math.round((q.score/q.total)*100) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="attempt" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                <Line dataKey="score" name="Score %" stroke={T.teal} strokeWidth={2} dot={{ r: 4, fill: T.teal }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 13 }}>
              Take a quiz to see your scores here.
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div style={css.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>🤖 AI Recommendations</div>
          <button onClick={generateRecs} disabled={recLoading} style={{ ...css.btn("teal"), fontSize: 12, opacity: recLoading ? 0.6 : 1 }}>
            {recLoading ? "Analyzing..." : "Generate"}
          </button>
        </div>
        {recs ? (
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{recs}</div>
        ) : (
          <div style={{ fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>
            Click "Generate" to get personalized AI recommendations based on your actual learning activity.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Tutor Chat ────────────────────────────────────────────────────────────
function ChatView({ apiKey }) {
  const [sessions, setSessions] = useState(() => store.get("chat_sessions", []));
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState("tutor");
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef(null);

  const langObj = LANGS.find(l => l.code === lang) || LANGS[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createSession = () => {
    const id = `s_${Date.now()}`;
    const s = { id, title: "New Conversation", createdAt: new Date().toISOString(), mode, lang, messages: [] };
    const updated = [s, ...sessions];
    setSessions(updated);
    store.set("chat_sessions", updated);
    setActiveSession(s);
    setMessages([]);
    logActivity("session_start");
  };

  const loadSession = (s) => {
    setActiveSession(s);
    setMessages(s.messages || []);
    setMode(s.mode || "tutor");
    setLang(s.lang || "en");
  };

  const saveMessages = (sessionId, msgs) => {
    const updated = sessions.map(s => s.id === sessionId
      ? { ...s, messages: msgs, title: msgs[0]?.content?.slice(0, 40) || "Conversation" }
      : s
    );
    setSessions(updated);
    store.set("chat_sessions", updated);
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    store.set("chat_sessions", updated);
    if (activeSession?.id === id) { setActiveSession(null); setMessages([]); }
  };

  const send = async () => {
    if (!input.trim() || loading || !activeSession) return;
    const userMsg = { role: "user", content: input.trim(), createdAt: new Date().toISOString() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    logActivity("message");

    const docs = store.get("documents", []);
    const docList = docs.map(d => `• ${d.name}: ${d.content?.slice(0, 300) || "(no content preview)"}`).join("\n");

    const systemMap = {
      tutor: `You are an expert multilingual AI tutor named EduAI. Be concise, clear, pedagogically effective. Use examples. Ask guiding questions. Respond in: ${langObj.label}.`,
      rag: `You are a document Q&A assistant. Answer ONLY from these documents:\n${docList || "No documents uploaded yet. Tell the user to upload documents first."}\nCite sources. Respond in: ${langObj.label}.`,
      exam: `You are an exam prep coach. Create practice questions, identify weak areas, give timed challenges. Respond in: ${langObj.label}.`,
      translate: `You are a translation assistant. Translate the user's message to ${langObj.label} and explain grammar/vocabulary differences.`,
    };

    const history = newMsgs.slice(-8).map(m => ({ role: m.role, content: m.content }));
    const reply = await callAI(systemMap[mode] || systemMap.tutor, userMsg.content, history.slice(0,-1), apiKey);
    const aiMsg = { role: "assistant", content: reply, createdAt: new Date().toISOString() };
    const finalMsgs = [...newMsgs, aiMsg];
    setMessages(finalMsgs);
    saveMessages(activeSession.id, finalMsgs);
    setLoading(false);
  };

  const toggleListen = () => {
    if (listening) { recognition?.stop(); setListening(false); return; }
    const rec = startListening((t, final) => {
      setInput(t);
      if (final) setListening(false);
    }, langObj.bcp);
    if (!rec) { alert("Speech recognition not supported in this browser. Try Chrome."); return; }
    setRecognition(rec);
    setListening(true);
  };

  const speakMsg = (text) => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    setSpeaking(true);
    speak(text, langObj.bcp);
    setTimeout(() => setSpeaking(false), Math.min(text.length * 60, 15000));
  };

  const MODES = [
    { id: "tutor", label: "Tutor" },
    { id: "rag", label: "Doc Q&A" },
    { id: "exam", label: "Exam Prep" },
    { id: "translate", label: "Translate" },
  ];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Sessions sidebar */}
      <div style={{ width: 200, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", background: T.bgCard, flexShrink: 0 }}>
        <div style={{ padding: "0.75rem" }}>
          <button onClick={createSession} style={{ ...css.btn("primary"), width: "100%", fontSize: 12 }}>+ New Chat</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0.5rem 0.5rem" }}>
          {sessions.length === 0 && (
            <div style={{ fontSize: 12, color: T.textMuted, padding: "0.5rem 0.3rem" }}>No chats yet.</div>
          )}
          {sessions.map(s => (
            <div key={s.id} onClick={() => loadSession(s)}
              style={{
                padding: "0.6rem 0.7rem", borderRadius: 8, cursor: "pointer", marginBottom: 2,
                background: activeSession?.id === s.id ? T.accentLow : "transparent",
                border: `1px solid ${activeSession?.id === s.id ? T.accent + "44" : "transparent"}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.textPri, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.title?.slice(0, 22) || "Chat"}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{s.messages?.length || 0} msgs</div>
              </div>
              <button onClick={(e) => deleteSession(s.id, e)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 14, padding: "0 2px", flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!activeSession ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 40 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.textSec }}>Start a new conversation</div>
            <button onClick={createSession} style={css.btn("primary")}>New Chat</button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{ padding: "0.7rem 1.25rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0, background: T.bgCard, flexWrap: "wrap" }}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} style={{ ...css.btn(mode === m.id ? "primary" : "ghost"), padding: "0.35rem 0.8rem", fontSize: 12 }}>
                  {m.label}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <select value={lang} onChange={e => setLang(e.target.value)} style={{ ...css.input, width: 120, padding: "0.35rem 0.6rem", fontSize: 12 }}>
                {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: T.textMuted, fontSize: 13, marginTop: "3rem" }}>
                  {mode === "rag" ? "Ask about your uploaded documents." : "Ask me anything to start learning."}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.grad1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>🤖</div>
                  )}
                  <div style={{ position: "relative", maxWidth: "72%" }}>
                    <div style={{
                      padding: "0.75rem 1rem", borderRadius: m.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                      background: m.role === "user" ? T.grad1 : T.bgEl,
                      color: T.textPri, fontSize: 13, lineHeight: 1.7,
                      border: m.role === "assistant" ? `1px solid ${T.border}` : "none",
                      whiteSpace: "pre-wrap", wordBreak: "break-word",
                    }}>{m.content}</div>
                    {m.role === "assistant" && (
                      <button onClick={() => speakMsg(m.content)} style={{ position: "absolute", bottom: -18, right: 4, background: "none", border: "none", fontSize: 11, color: T.textMuted, cursor: "pointer" }}>
                        {speaking ? "⏹ stop" : "🔊 read"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.grad1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</div>
                  <div style={{ padding: "0.75rem 1rem", borderRadius: "4px 14px 14px 14px", background: T.bgEl, border: `1px solid ${T.border}`, display: "flex", gap: 5 }}>
                    {[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, animation: `bounce 1.2s infinite ${d*0.2}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "0.9rem 1.25rem", borderTop: `1px solid ${T.border}`, background: T.bgCard, display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={toggleListen} title="Voice input (FREE — browser STT)" style={{ ...css.btn(listening ? "danger" : "ghost"), flexShrink: 0, padding: "0.6rem 0.8rem", fontSize: 15 }}>
                {listening ? "⏹" : "🎙"}
              </button>
              <input style={{ ...css.input, flex: 1 }} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder={listening ? "Listening..." : "Ask anything..."}
                disabled={loading} />
              <button onClick={send} disabled={loading || !input.trim()} style={{ ...css.btn("primary"), flexShrink: 0, opacity: loading || !input.trim() ? 0.5 : 1 }}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Documents ────────────────────────────────────────────────────────────────
function DocumentsView({ apiKey }) {
  const [docs, setDocs] = useState(() => store.get("documents", []));
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryDocId, setSummaryDocId] = useState(null);

  const saveDocs = (d) => { setDocs(d); store.set("documents", d); };

  const readFile = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    // For PDFs we can only read basic text; DOCX/TXT are readable
    if (file.type === "text/plain") {
      r.onload = e => resolve(e.target.result);
      r.onerror = reject;
      r.readAsText(file);
    } else {
      // For PDF/DOCX/PPTX — store filename and ask user to paste content
      resolve(`[File: ${file.name}]\nNote: For full text extraction in the browser, please paste the document content into the AI chat with the message "Here is my document content: [paste here]"`);
    }
  });

  const handleFiles = async (files) => {
    for (const file of Array.from(files)) {
      const allowed = ["text/plain","application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
      if (!allowed.some(t => file.type === t || file.name.match(/\.(pdf|docx|pptx|txt)$/i))) {
        alert(`Unsupported: ${file.name}`); continue;
      }
      const doc = { id: `d_${Date.now()}`, name: file.name, size: (file.size/1024).toFixed(0)+"KB", type: file.type, status: "processing", content: "", uploadedAt: new Date().toISOString() };
      const newDocs = [...docs, doc];
      saveDocs(newDocs);
      setProcessing(doc.id);
      try {
        const content = await readFile(file);
        const updated = newDocs.map(d => d.id === doc.id ? { ...d, status: "ready", content: content.slice(0, 8000) } : d);
        saveDocs(updated);
        setDocs(updated);
        logActivity("document");
      } catch { saveDocs(newDocs.map(d => d.id === doc.id ? { ...d, status: "error" } : d)); }
      setProcessing(null);
    }
  };

  const summarize = async (doc) => {
    if (!apiKey) { alert("Add your free Gemini API key in Settings."); return; }
    setSummaryDocId(doc.id); setSummary(null);
    const result = await callAI(
      "You are an expert document summarizer for students. Provide a clear, structured educational summary.",
      `Summarize this document for studying. Include: 📌 Main Topic, 🔑 Key Concepts (5 bullet points), 💡 Key Takeaways (3 points), ❓ Likely exam questions (2).\n\nDocument: ${doc.name}\nContent: ${doc.content?.slice(0, 3000) || "No content extracted — user needs to paste content."}`,
      [], apiKey
    );
    setSummary(result);
  };

  const deleteDoc = (id) => {
    const updated = docs.filter(d => d.id !== id);
    saveDocs(updated);
    if (summaryDocId === id) { setSummary(null); setSummaryDocId(null); }
  };

  return (
    <div style={{ padding: "1.75rem", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.textPri, margin: 0 }}>📁 Documents</h2>
        <p style={{ color: T.textSec, fontSize: 12, marginTop: 3 }}>Upload TXT files for full parsing. PDF/DOCX/PPTX are stored by name — paste content in chat for Q&A.</p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => document.getElementById("file-inp").click()}
        style={{ border: `2px dashed ${dragging ? T.accent : T.border}`, borderRadius: 14, padding: "2rem", textAlign: "center", marginBottom: "1.25rem", background: dragging ? T.accentLow : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
        <input id="file-inp" type="file" accept=".pdf,.docx,.pptx,.txt" multiple hidden onChange={e => handleFiles(e.target.files)} />
        <div style={{ fontSize: 28, marginBottom: 8 }}>📤</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.textPri }}>Drop files or click to upload</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>PDF · DOCX · PPTX · TXT</div>
      </div>

      {/* Doc list */}
      {docs.length === 0 && (
        <div style={{ ...css.cardEl, color: T.textMuted, fontSize: 13, textAlign: "center", padding: "2rem" }}>
          No documents yet. Upload files above.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
        {docs.map(doc => (
          <div key={doc.id} style={{ ...css.card, display: "flex", alignItems: "center", gap: 12, padding: "1rem 1.25rem" }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: doc.name.match(/\.pdf$/i) ? T.redLow : T.accentLow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {doc.name.match(/\.pdf$/i) ? "📕" : doc.name.match(/\.pptx$/i) ? "📊" : doc.name.match(/\.docx$/i) ? "📘" : "📄"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{doc.size} · {new Date(doc.uploadedAt).toLocaleDateString()}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <span style={css.badge(processing === doc.id ? T.amber : doc.status === "ready" ? T.green : T.red)}>
                {processing === doc.id ? "Processing…" : doc.status === "ready" ? "✓ Ready" : "Uploaded"}
              </span>
              <button onClick={() => summarize(doc)} style={{ ...css.btn("ghost"), fontSize: 11, padding: "0.3rem 0.6rem" }}>Summarize</button>
              <button onClick={() => deleteDoc(doc.id)} style={{ ...css.btn("ghost"), fontSize: 11, padding: "0.3rem 0.5rem", color: T.red }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {(summary || summaryDocId) && (
        <div style={{ ...css.card, borderLeft: `3px solid ${T.accent}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 8 }}>
            📝 AI Summary — {docs.find(d => d.id === summaryDocId)?.name}
          </div>
          {!summary ? (
            <div style={{ color: T.textSec, fontSize: 13, display: "flex", gap: 6 }}>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Generating...
            </div>
          ) : (
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{summary}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function QuizView({ apiKey }) {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    if (!apiKey) { alert("Add your free Gemini API key in Settings."); return; }
    setLoading(true); setQuestions([]); setIdx(0); setScore(0); setDone(false); setSelected(null); setAnswered(false);
    const raw = await callAI(
      `You are a quiz generator. Return ONLY a valid JSON array of 5 multiple-choice questions.
Format: [{"q":"question","options":["A","B","C","D"],"correct":0,"explanation":"why"}]
correct is the 0-based index of the correct option.
Return ONLY the JSON array, no markdown fences, no other text.`,
      `Generate 5 educational multiple-choice questions about: ${topic}`,
      [], apiKey
    );
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      const start = clean.indexOf("["), end = clean.lastIndexOf("]");
      const arr = JSON.parse(clean.slice(start, end + 1));
      setQuestions(arr.slice(0, 5));
    } catch {
      alert("Could not parse quiz. Try a more specific topic.");
    }
    setLoading(false);
  };

  const getHint = async () => {
    if (!questions[idx]) return;
    setHintLoading(true);
    const h = await callAI(
      "You are a Socratic tutor. Give a 1-2 sentence hint without revealing the answer.",
      `Question: "${questions[idx].q}"\nOptions: ${questions[idx].options?.join(", ")}\nHint:`,
      [], apiKey
    );
    setHint(h); setHintLoading(false);
  };

  const select = (i) => {
    if (answered) return;
    setSelected(i); setAnswered(true);
    if (i === questions[idx]?.correct) setScore(s => s + 1);
  };

  const next = () => {
    setSelected(null); setAnswered(false); setHint(null);
    if (idx + 1 >= questions.length) {
      logActivity("quiz_complete", { score: score + (selected === questions[idx]?.correct ? 1 : 0), total: questions.length });
      const history = store.get("quiz_history", []);
      store.set("quiz_history", [...history, { topic, score: score + (selected === questions[idx]?.correct ? 1 : 0), total: questions.length, date: new Date().toISOString() }]);
      setDone(true);
    } else setIdx(i => i + 1);
  };

  const reset = () => { setQuestions([]); setDone(false); setIdx(0); setScore(0); setTopic(""); setSelected(null); setAnswered(false); setHint(null); };

  const L = ["A","B","C","D"];

  if (done) return (
    <div style={{ padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ ...css.card, maxWidth: 380, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 50, marginBottom: 12 }}>{score >= questions.length ? "🏆" : score >= questions.length * 0.6 ? "🎉" : "📚"}</div>
        <h2 style={{ color: T.textPri, margin: "0 0 6px" }}>Quiz Complete!</h2>
        <div style={{ fontSize: 32, fontWeight: 700, color: T.accent }}>{score}/{questions.length}</div>
        <div style={{ color: T.textSec, fontSize: 13, margin: "8px 0 20px" }}>Topic: {topic}</div>
        <button onClick={reset} style={css.btn("primary")}>New Quiz</button>
      </div>
    </div>
  );

  const q = questions[idx];

  return (
    <div style={{ padding: "1.75rem", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 580, margin: "0 auto" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.textPri, marginBottom: "1.25rem" }}>🧠 AI Quiz Generator</h2>

        {/* Topic input */}
        <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
          <input style={{ ...css.input, flex: 1 }} placeholder="Enter any topic (e.g. Photosynthesis, World War 2, Python loops...)"
            value={topic} onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generateQuiz()} disabled={loading} />
          <button onClick={generateQuiz} disabled={loading || !topic.trim()} style={{ ...css.btn("primary"), flexShrink: 0, opacity: loading || !topic.trim() ? 0.6 : 1 }}>
            {loading ? "⟳ Generating..." : "Generate Quiz"}
          </button>
        </div>

        {questions.length === 0 && !loading && (
          <div style={{ ...css.cardEl, color: T.textMuted, fontSize: 13, textAlign: "center", padding: "2.5rem" }}>
            Enter a topic above to generate a free AI-powered quiz instantly.
          </div>
        )}

        {questions.length > 0 && q && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: 13, color: T.textSec }}>Question {idx+1} of {questions.length}</span>
              <span style={css.badge(T.accent)}>Score: {score}/{idx + (answered ? 1 : 0)}</span>
            </div>
            <div style={{ height: 3, background: T.border, borderRadius: 2, marginBottom: "1.25rem" }}>
              <div style={{ height: "100%", borderRadius: 2, background: T.grad1, width: `${((idx+(answered?1:0))/questions.length)*100}%`, transition: "width 0.4s" }} />
            </div>

            <div style={{ ...css.card, marginBottom: "1rem" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.textPri, lineHeight: 1.55 }}>{q.q}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: "1rem" }}>
              {(q.options || []).map((opt, i) => {
                let bg = T.bgEl, bColor = T.border, c = T.textSec;
                if (answered) {
                  if (i === q.correct) { bg = T.greenLow; bColor = T.green; c = T.green; }
                  else if (i === selected) { bg = T.redLow; bColor = T.red; c = T.red; }
                } else if (selected === i) { bg = T.accentLow; bColor = T.accent; c = T.accent; }
                return (
                  <button key={i} onClick={() => select(i)} style={{
                    background: bg, border: `1px solid ${bColor}`, borderRadius: 9,
                    padding: "0.75rem 1rem", color: c, fontSize: 13, textAlign: "left",
                    cursor: answered ? "default" : "pointer", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: bColor+"22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{L[i]}</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {!answered && (
              <button onClick={getHint} disabled={hintLoading} style={{ ...css.btn("ghost"), fontSize: 12, marginBottom: "1rem" }}>
                {hintLoading ? "⟳ Getting hint..." : "💡 AI Hint"}
              </button>
            )}
            {hint && !answered && (
              <div style={{ ...css.cardEl, borderLeft: `3px solid ${T.amber}`, marginBottom: "1rem" }}>
                <div style={{ fontSize: 11, color: T.amber, fontWeight: 700, marginBottom: 4 }}>💡 HINT</div>
                <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}>{hint}</div>
              </div>
            )}
            {answered && (
              <div style={{ ...css.cardEl, borderLeft: `3px solid ${selected === q.correct ? T.green : T.red}`, marginBottom: "1rem" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: selected === q.correct ? T.green : T.red, marginBottom: 4 }}>
                  {selected === q.correct ? "✓ CORRECT!" : "✗ INCORRECT"}
                </div>
                <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}>{q.explanation}</div>
              </div>
            )}
            {answered && <button onClick={next} style={css.btn("primary")}>{idx+1 >= questions.length ? "Finish →" : "Next →"}</button>}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Flashcards ───────────────────────────────────────────────────────────────
function FlashcardsView({ apiKey }) {
  const [decks, setDecks] = useState(() => store.get("flashcard_decks", []));
  const [activeDeck, setActiveDeck] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [mastered, setMastered] = useState([]);

  const saveDecks = (d) => { setDecks(d); store.set("flashcard_decks", d); };

  const generateDeck = async () => {
    if (!topic.trim()) return;
    if (!apiKey) { alert("Add your free Gemini API key in Settings."); return; }
    setGenerating(true);
    const raw = await callAI(
      `You are a flashcard generator. Return ONLY a valid JSON array.
Format: [{"front":"term or question","back":"definition or answer"}]
Return ONLY the JSON array, no markdown fences.`,
      `Create ${count} educational flashcards about: ${topic}`,
      [], apiKey
    );
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      const start = clean.indexOf("["), end = clean.lastIndexOf("]");
      const cards = JSON.parse(clean.slice(start, end + 1));
      const deck = { id: `deck_${Date.now()}`, topic, cards: cards.slice(0, count), createdAt: new Date().toISOString() };
      const updated = [...decks, deck];
      saveDecks(updated);
      setActiveDeck(deck); setCardIdx(0); setFlipped(false); setMastered([]);
      setTopic("");
    } catch { alert("Could not generate. Try a simpler topic."); }
    setGenerating(false);
  };

  const deleteDeck = (id) => {
    const updated = decks.filter(d => d.id !== id);
    saveDecks(updated);
    if (activeDeck?.id === id) { setActiveDeck(null); setCardIdx(0); }
  };

  const markMastered = () => {
    logActivity("flashcard");
    setMastered(prev => [...prev, cardIdx]);
    setFlipped(false);
    if (cardIdx < (activeDeck?.cards?.length || 0) - 1) setCardIdx(i => i + 1);
  };

  const card = activeDeck?.cards?.[cardIdx];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Decks sidebar */}
      <div style={{ width: 200, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", background: T.bgCard, flexShrink: 0 }}>
        <div style={{ padding: "0.75rem 0.75rem 0.5rem", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 6 }}>YOUR DECKS</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
          {decks.length === 0 && <div style={{ fontSize: 12, color: T.textMuted, padding: "0.5rem 0.3rem" }}>No decks yet. Generate one →</div>}
          {decks.map(d => (
            <div key={d.id} onClick={() => { setActiveDeck(d); setCardIdx(0); setFlipped(false); setMastered([]); }}
              style={{ padding: "0.6rem 0.65rem", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: activeDeck?.id === d.id ? T.purpleLow : "transparent", border: `1px solid ${activeDeck?.id === d.id ? T.purple+"44" : "transparent"}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.textPri }}>{d.topic}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{d.cards?.length} cards</div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteDeck(d.id); }} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 13, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.75rem", boxSizing: "border-box" }}>
        {/* Generator */}
        <div style={{ ...css.card, marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri, marginBottom: "0.75rem" }}>🃏 Generate AI Flashcards</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={css.label}>Topic</label>
              <input style={css.input} placeholder="e.g. Cell Biology, JavaScript Promises, French Revolution..."
                value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generateDeck()} />
            </div>
            <div>
              <label style={css.label}>Cards</label>
              <select value={count} onChange={e => setCount(Number(e.target.value))} style={{ ...css.input, width: 80 }}>
                {[3,5,8,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={generateDeck} disabled={generating || !topic.trim()} style={{ ...css.btn("primary"), opacity: generating || !topic.trim() ? 0.6 : 1 }}>
              {generating ? "⟳ Generating..." : "✨ Generate"}
            </button>
          </div>
        </div>

        {/* Active deck */}
        {activeDeck && card && (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.textPri }}>{activeDeck.topic}</div>
              <span style={css.badge(T.green)}>{mastered.length}/{activeDeck.cards.length} mastered</span>
            </div>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              {activeDeck.cards.map((_, i) => (
                <button key={i} onClick={() => { setCardIdx(i); setFlipped(false); }} style={{ width: 9, height: 9, borderRadius: "50%", border: "none", cursor: "pointer", background: mastered.includes(i) ? T.green : i === cardIdx ? T.accent : T.border }} />
              ))}
            </div>

            {/* Card */}
            <div onClick={() => setFlipped(f => !f)} style={{ minHeight: 200, borderRadius: 18, border: `1px solid ${T.border}`, background: flipped ? T.bgEl2 : T.bgEl, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center", cursor: "pointer", marginBottom: "1.25rem", position: "relative", transition: "background 0.2s" }}>
              <div style={{ position: "absolute", top: 12, left: 14, fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{flipped ? "Answer" : "Question"}</div>
              <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 10, color: T.textMuted }}>tap to flip</div>
              <div style={{ fontSize: 15, color: T.textPri, lineHeight: 1.65, fontWeight: flipped ? 400 : 500 }}>
                {flipped ? card.back : card.front}
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 9, justifyContent: "center" }}>
              <button onClick={() => { setFlipped(false); setCardIdx(i => i > 0 ? i - 1 : activeDeck.cards.length - 1); }} style={css.btn("ghost")}>← Prev</button>
              <button onClick={markMastered} style={css.btn("green")}>✓ Got it</button>
              <button onClick={() => { setFlipped(false); setCardIdx(i => (i+1) % activeDeck.cards.length); }} style={css.btn("ghost")}>Next →</button>
            </div>
          </div>
        )}

        {!activeDeck && decks.length === 0 && (
          <div style={{ ...css.cardEl, textAlign: "center", padding: "3rem", color: T.textMuted, fontSize: 13 }}>
            Generate your first flashcard deck above.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function AnalyticsView({ apiKey }) {
  const activity = getActivityHistory();
  const quizHistory = store.get("quiz_history", []);
  const sessions = store.get("chat_sessions", []);
  const docs = store.get("documents", []);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const totalMins = activity.reduce((s, d) => s + d.studyMinutes, 0);
  const totalMsgs = activity.reduce((s, d) => s + d.messages, 0);
  const totalFlash = activity.reduce((s, d) => s + d.flashcardsReviewed, 0);
  const avgScore = quizHistory.length ? Math.round(quizHistory.reduce((s, q) => s + (q.score / q.total) * 100, 0) / quizHistory.length) : 0;

  const scoreData = quizHistory.slice(-8).map((q, i) => ({
    attempt: `#${i+1}`, topic: q.topic?.slice(0, 8) || "",
    score: Math.round((q.score / q.total) * 100),
  }));

  const activityData = [
    { name: "Study Mins", value: totalMins, color: T.accent },
    { name: "Messages",   value: totalMsgs, color: T.purple },
    { name: "Flashcards", value: totalFlash, color: T.teal },
    { name: "Quizzes",    value: quizHistory.length, color: T.amber },
  ];

  const getInsight = async () => {
    if (!apiKey) { alert("Add your free Gemini API key in Settings."); return; }
    setInsightLoading(true);
    const data = {
      totalMins, totalMsgs, avgScore, quizCount: quizHistory.length,
      docCount: docs.length, sessionCount: sessions.length,
      dailyActivity: activity.map(d => `${d.day}: ${d.studyMinutes}min, ${d.messages}msgs`).join(", "),
    };
    const result = await callAI(
      "You are an educational data analyst. Analyze learning data and give 4 specific, honest insights including trends, predictions, and concrete improvement steps. Use emojis. Keep each insight to 1-2 sentences.",
      `Analyze this student's week: ${JSON.stringify(data)}`,
      [], apiKey
    );
    setInsight(result);
    setInsightLoading(false);
  };

  const hasData = totalMins > 0 || totalMsgs > 0;

  return (
    <div style={{ padding: "1.75rem", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.textPri, margin: 0 }}>📈 Learning Analytics</h2>
        <p style={{ color: T.textSec, fontSize: 12, marginTop: 3 }}>All data computed from your local activity. 100% private.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { l: "Study Time",  v: `${totalMins}m`, c: T.accent  },
          { l: "Avg Quiz %",  v: avgScore > 0 ? `${avgScore}%` : "—", c: T.teal },
          { l: "AI Messages", v: totalMsgs, c: T.purple },
          { l: "Documents",   v: docs.length, c: T.amber },
        ].map(s => (
          <div key={s.l} style={{ ...css.card, padding: "1rem" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: "1.5rem" }}>
        {/* Study Minutes */}
        <div style={css.card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri, marginBottom: "1rem" }}>Daily Study Minutes</div>
          {hasData ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={activity} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="day" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="studyMinutes" name="Minutes" fill={T.accent} radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 12 }}>Start studying to see data</div>}
        </div>

        {/* Quiz History */}
        <div style={css.card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri, marginBottom: "1rem" }}>Quiz Score History</div>
          {scoreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="attempt" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                <Line dataKey="score" name="Score %" stroke={T.teal} strokeWidth={2} dot={{ r: 4, fill: T.teal }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 12 }}>Take quizzes to see scores</div>}
        </div>
      </div>

      {/* Activity overview */}
      {hasData && (
        <div style={{ ...css.card, marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri, marginBottom: "1rem" }}>Weekly Activity Breakdown</div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={activityData} layout="vertical" barSize={16}>
              <XAxis type="number" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: T.textSec, fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0,5,5,0]}>
                {activityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Insights */}
      <div style={css.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>🔮 AI Insights</div>
          <button onClick={getInsight} disabled={insightLoading} style={{ ...css.btn("primary"), fontSize: 12, opacity: insightLoading ? 0.6 : 1 }}>
            {insightLoading ? "Analyzing..." : "Analyze My Data"}
          </button>
        </div>
        {insight ? (
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{insight}</div>
        ) : (
          <div style={{ fontSize: 12, color: T.textMuted }}>
            Click "Analyze My Data" to generate AI-powered insights from your real learning patterns.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsView({ user, onUpdateUser, onUpdateApiKey, apiKey }) {
  const [name, setName] = useState(user.name || "");
  const [key, setKey] = useState(apiKey || "");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const save = () => {
    onUpdateUser({ ...user, name });
    onUpdateApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const test = async () => {
    if (!key.trim()) { setTestResult("❌ Enter an API key first."); return; }
    setTesting(true); setTestResult(null);
    const r = await callAI("Respond with exactly: CONNECTED", "ping", [], key.trim());
    setTestResult(r.includes("CONNECTED") || (!r.startsWith("⚠️") && r.length < 50) ? "✅ API connected!" : `❌ ${r}`);
    setTesting(false);
  };

  const clearAll = () => {
    if (!("Clear ALL local data? This will delete chats, documents, quizzes, flashcards, and analytics.")) return;
    const keysToKeep = ["eduai_user", "eduai_apikey"];
    Object.keys(localStorage).forEach(k => {
      if (!keysToKeep.includes(k)) localStorage.removeItem(k);
    });
    alert("Data cleared. Refresh the page.");
  };

  return (
    <div style={{ padding: "1.75rem", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.textPri, marginBottom: "1.5rem" }}>⚙️ Settings</h2>

      {/* API Key — most important! */}
      <div style={{ ...css.card, marginBottom: "1rem", borderLeft: `3px solid ${T.accent}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: "0.75rem" }}>🔑 Google Gemini API Key (FREE)</div>
        <div style={{ fontSize: 12, color: T.textSec, marginBottom: "1rem", lineHeight: 1.6 }}>
          Get your <strong style={{ color: T.textPri }}>free API key</strong> at{" "}
          <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>aistudio.google.com</a>
          {" "}→ Get API Key. Completely free — <strong style={{ color: T.green }}>no credit card needed</strong>.
        </div>
        <label style={css.label}>API Key</label>
        <input style={{ ...css.input, marginBottom: 10, fontFamily: "monospace", fontSize: 12 }}
          type="password" placeholder="AIza..." value={key} onChange={e => setKey(e.target.value)} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={test} disabled={testing} style={{ ...css.btn("teal"), opacity: testing ? 0.6 : 1 }}>
            {testing ? "Testing..." : "Test Connection"}
          </button>
          {testResult && <span style={{ fontSize: 12, color: testResult.startsWith("✅") ? T.green : T.red, alignSelf: "center" }}>{testResult}</span>}
        </div>
      </div>

      {/* Profile */}
      <div style={{ ...css.card, marginBottom: "1rem" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em"}}>Profile</div>
        <label style={css.label}>Your Name</label>
        <input style={{ ...css.input, marginBottom: 12, maxWidth: 300 }} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
      </div>

      {/* Free APIs info */}
      <div style={{ ...css.card, marginBottom: "1rem" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textSec, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Free APIs Used</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { name: "AI Chat / Quiz / Flashcards", api: "Google Gemini 1.5 Flash", cost: "100% free — no card needed", color: T.green },
            { name: "Text-to-Speech (TTS)", api: "Web Speech Synthesis API", cost: "100% free — browser built-in", color: T.green },
            { name: "Speech-to-Text (STT)", api: "Web Speech Recognition API", cost: "100% free — browser built-in", color: T.green },
            { name: "Storage (chat, docs, analytics)", api: "localStorage (browser)", cost: "100% free — no server needed", color: T.green },
          ].map(item => (
            <div key={item.name} style={{ ...css.cardEl, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 0.9rem" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textPri }}>{item.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{item.api}</div>
              </div>
              <span style={css.badge(item.color)}>{item.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data management */}
      <div style={{ ...css.card, marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textSec, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Data Management</div>
        <p style={{ fontSize: 12, color: T.textMuted, marginTop: 0, marginBottom: "0.75rem" }}>
          All data is stored locally in your browser (localStorage). Nothing is sent to any server except AI requests to Google Gemini.
        </p>
        <button onClick={clearAll} style={{ ...css.btn("danger"), fontSize: 12 }}>🗑 Clear All Local Data</button>
      </div>

      {/* Save */}
      <button onClick={save} style={css.btn("primary")}>
        {saved ? "✓ Saved!" : "Save Settings"}
      </button>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (tab === "signup" && !name.trim()) { setError("Enter your name."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (tab === "login") {
      const users = store.get("users", []);
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) { setError("Invalid email or password."); setLoading(false); return; }
      onAuth(found);
    } else {
      const users = store.get("users", []);
      if (users.find(u => u.email === email)) { setError("Account already exists. Sign in."); setLoading(false); return; }
      const user = { id: `u_${Date.now()}`, name: name.trim(), email, password };
      store.set("users", [...users, user]);
      onAuth(user);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1E2D45;border-radius:2px}input,select{font-family:inherit}input::placeholder{color:#475569}select option{background:#131D2E;color:#EFF6FF}`}</style>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: T.grad1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 0.9rem" }}>🎓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.textPri, margin: 0 }}>EduAI</h1>
          <p style={{ color: T.textSec, fontSize: 13, marginTop: 4 }}>Free AI Learning Assistant</p>
        </div>

        <div style={css.card}>
          <div style={{ display: "flex", gap: 4, marginBottom: "1.25rem", background: T.bg, borderRadius: 9, padding: 4 }}>
            {["login","signup"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "0.45rem", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: tab === t ? T.bgCard : "transparent", color: tab === t ? T.textPri : T.textMuted, transition: "all 0.15s" }}>
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tab === "signup" && (
              <div>
                <label style={css.label}>Full Name</label>
                <input style={css.input} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label style={css.label}>Email</label>
              <input style={css.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            <div>
              <label style={css.label}>Password</label>
              <input style={css.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            {error && <div style={{ fontSize: 12, color: T.red }}>{error}</div>}
            <button onClick={submit} disabled={loading} style={{ ...css.btn("primary"), marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? "⟳ Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: "1.25rem", ...css.card, padding: "1rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>What's free in EduAI</div>
          {["AI Tutor Chat (Gemini Flash)","Quiz Generator (any topic)","Flashcard Generator","Document Q&A","TTS & STT (browser)","Analytics Dashboard"].map(f => (
            <div key={f} style={{ fontSize: 12, color: T.textSec, marginBottom: 4 }}>✓ {f}</div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: T.textMuted, fontSize: 11, marginTop: "1rem" }}>
          Data stored locally · No tracking · No ads
        </p>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => store.get("eduai_user", null));
  const [apiKey, setApiKey] = useState(() => store.get("eduai_apikey", ""));
  const [view, setView] = useState("dashboard");

  useEffect(() => { if (user) logActivity("session_start"); }, []);

  const updateUser = (u) => { setUser(u); store.set("eduai_user", u); };
  const updateApiKey = (k) => { setApiKey(k); store.set("eduai_apikey", k); };
  const signOut = () => { setUser(null); store.del("eduai_user"); };

  if (!user) return <AuthScreen onAuth={(u) => { updateUser(u); }} />;

  const VIEWS = {
    dashboard:  <Dashboard user={user} onNav={setView} apiKey={apiKey} />,
    chat:       <ChatView apiKey={apiKey} />,
    documents:  <DocumentsView apiKey={apiKey} />,
    quiz:       <QuizView apiKey={apiKey} />,
    flashcards: <FlashcardsView apiKey={apiKey} />,
    analytics:  <AnalyticsView apiKey={apiKey} />,
    settings:   <SettingsView user={user} onUpdateUser={updateUser} onUpdateApiKey={updateApiKey} apiKey={apiKey} />,
  };

  // Warn if no API key
  const noKeyBanner = !apiKey && view !== "settings";

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, color: T.textPri, fontFamily: "system-ui,-apple-system,sans-serif", overflow: "hidden" }}>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1E2D45;border-radius:2px}input::placeholder,textarea::placeholder{color:#475569}select option{background:#131D2E;color:#EFF6FF}button:active{opacity:0.82}`}</style>
      <Sidebar active={view} onNav={setView} user={user} />
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* API key warning */}
        {noKeyBanner && (
          <div style={{ background: T.amberLow, borderBottom: `1px solid ${T.amber}44`, padding: "0.5rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: T.amber }}>⚠️ No API key set. AI features won't work.</span>
            <button onClick={() => setView("settings")} style={{ ...css.btn("ghost"), fontSize: 11, padding: "0.25rem 0.6rem", color: T.amber, borderColor: T.amber }}>Add Free Key →</button>
          </div>
        )}
        {/* Topbar */}
        <div style={{ height: 50, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.25rem", flexShrink: 0, background: T.bgCard }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.textPri }}>
            {NAV.find(n => n.id === view)?.icon} {NAV.find(n => n.id === view)?.label}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {apiKey && <span style={css.badge(T.green)}>● API Ready</span>}
            <button onClick={signOut} style={{ ...css.btn("ghost"), fontSize: 11, padding: "0.3rem 0.7rem" }}>Sign Out</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>{VIEWS[view]}</div>
      </div>
    </div>
  );
}
