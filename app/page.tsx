"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type Ratio = "square" | "landscape" | "portrait";

// Client-side daily counters (UX display). Server enforces the real limit.
const CHAT_LIMIT = 40;
const IMAGE_LIMIT = 20;

// Brand images served from the public GitHub repo via jsDelivr CDN, pinned to a
// commit so they load on the live site even before a git-connected deploy.
// When the project is connected to Git on Vercel, these can be swapped back to
// local paths ("/mascot.png", etc.).
const CDN =
  "https://cdn.jsdelivr.net/gh/cacereslucianoljc5-cmyk/AGENTAI@a078becc6e8bf00d8a02c59a7463afce49edbe99/public";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function useDailyCounter(name: string, max: number) {
  const [used, setUsed] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`hood_${name}`);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.day === todayKey()) setUsed(p.used);
        else localStorage.removeItem(`hood_${name}`);
      }
    } catch {}
  }, [name]);
  const bump = () => {
    setUsed((u) => {
      const next = u + 1;
      try {
        localStorage.setItem(
          `hood_${name}`,
          JSON.stringify({ day: todayKey(), used: next })
        );
      } catch {}
      return next;
    });
  };
  return { used, remaining: Math.max(0, max - used), bump };
}

function Mascot() {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="mascot-fallback" aria-hidden>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l8.66 5v10L12 22 3.34 17V7L12 2z"
            stroke="var(--neon)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="12" cy="12" r="3.2" fill="var(--neon)" />
        </svg>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="mascot"
      src={`${CDN}/mascot.png`}
      alt="HoodAgent"
      onError={() => setBroken(true)}
    />
  );
}

function Wordmark() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="wordmark-wrap">
      {broken ? (
        <div className="wordmark">
          <span className="hood">Hood</span>
          <span className="agent">Agent</span>
          <span className="ai">Ai</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="wordmark-img"
          src={`${CDN}/wordmark.jpg`}
          alt="HoodAgent"
          onError={() => setBroken(true)}
        />
      )}
      <div className="tagline">
        Your <b>AI</b>. Your <b>Edge</b>.
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <Mascot />
      <Wordmark />
    </header>
  );
}

function ChatTab() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const counter = useDailyCounter("chat", CHAT_LIMIT);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (counter.remaining <= 0) {
      setError("Has alcanzado tu límite diario de mensajes. Vuelve mañana 🌙");
      return;
    }
    setError("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Algo salió mal.");
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
        counter.bump();
      }
    } catch {
      setError("Error de red. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="panel">
      <div className="limit-pill">
        💬 Mensajes hoy: <b>{counter.remaining}</b> / {CHAT_LIMIT} restantes
      </div>
      <div className="chat-log" ref={logRef}>
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="welcome-img" src={`${CDN}/mascot-welcome.png`} alt="HoodAgent" />
            Pregúntame lo que quieras. Soy <b>HoodAgent</b>.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bubble assistant typing">
            HoodAgent está escribiendo<span className="dots" />
          </div>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      <div className="composer">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Escribe tu mensaje..."
          disabled={loading}
        />
        <button className="btn" onClick={send} disabled={loading || !input.trim()}>
          {loading ? "..." : "Enviar"}
        </button>
      </div>
      {messages.length > 0 && (
        <button
          className="btn ghost"
          style={{ marginTop: 10, minHeight: 40, padding: "0 16px" }}
          onClick={() => setMessages([])}
        >
          Nueva conversación
        </button>
      )}
    </div>
  );
}

function ImageTab() {
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState<Ratio>("square");
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [error, setError] = useState("");
  const counter = useDailyCounter("image", IMAGE_LIMIT);

  async function generate() {
    const text = prompt.trim();
    if (!text || loading) return;
    if (counter.remaining <= 0) {
      setError("Has alcanzado tu límite diario de imágenes. Vuelve mañana 🌙");
      return;
    }
    setError("");
    setLoading(true);
    setImgUrl("");
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, ratio }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Algo salió mal.");
        setLoading(false);
        return;
      }
      // Preload the image so we only stop the spinner when it's ready.
      const im = new window.Image();
      im.onload = () => {
        setImgUrl(data.url);
        counter.bump();
        setLoading(false);
      };
      im.onerror = () => {
        setError("No se pudo generar la imagen. Intenta otra descripción.");
        setLoading(false);
      };
      im.src = data.url;
    } catch {
      setError("Error de red. Revisa tu conexión.");
      setLoading(false);
    }
  }

  const ratios: { key: Ratio; label: string }[] = [
    { key: "square", label: "1:1" },
    { key: "landscape", label: "16:9" },
    { key: "portrait", label: "9:16" },
  ];

  return (
    <div className="panel">
      <div className="limit-pill">
        🎨 Imágenes hoy: <b>{counter.remaining}</b> / {IMAGE_LIMIT} restantes
      </div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && generate()}
        placeholder="Un astronauta neón montando una moto en Marte, estilo cyberpunk..."
        disabled={loading}
      />
      <div className="img-controls">
        <div className="ratio-group">
          {ratios.map((r) => (
            <button
              key={r.key}
              className={`ratio-btn ${ratio === r.key ? "active" : ""}`}
              onClick={() => setRatio(r.key)}
              disabled={loading}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          className="btn"
          style={{ minHeight: 44 }}
          onClick={generate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Generando..." : "Generar imagen"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="image-stage">
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto 14px" }} />
            <div style={{ color: "var(--text-dim)" }}>
              Creando tu imagen<span className="dots" />
            </div>
          </div>
        ) : imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl} alt={prompt} />
        ) : (
          <div className="stage-hint">
            Describe una imagen y pulsa <b>Generar</b> ✨
          </div>
        )}
      </div>
      {imgUrl && !loading && (
        <a className="download" href={imgUrl} target="_blank" rel="noreferrer" download>
          ⬇️ Abrir / descargar imagen
        </a>
      )}
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<"chat" | "image">("chat");
  return (
    <div className="wrap">
      <Header />
      <div className="tabs">
        <button
          className={`tab ${tab === "chat" ? "active" : ""}`}
          onClick={() => setTab("chat")}
        >
          💬 Chat
        </button>
        <button
          className={`tab ${tab === "image" ? "active" : ""}`}
          onClick={() => setTab("image")}
        >
          🎨 Imágenes
        </button>
      </div>
      {tab === "chat" ? <ChatTab /> : <ImageTab />}
      <div className="footer">
        HoodAgentAi · IA gratuita con límites diarios
        <br />
        Uso responsable — no generes contenido dañino o ilegal.
      </div>
    </div>
  );
}
