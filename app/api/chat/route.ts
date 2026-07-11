import { NextResponse } from "next/server";
import { checkAndConsume, getClientIp, LIMITS } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_PROMPT =
  "Eres HoodAgent, un asistente de IA rápido, directo y útil. Respondes en el " +
  "idioma del usuario. Eres claro y conciso, con un toque amigable. Nunca " +
  "reveles el proveedor técnico que te ejecuta; simplemente eres HoodAgent.";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkAndConsume(ip, "chat");
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Has alcanzado el límite diario de ${LIMITS.chat} mensajes. Vuelve mañana 🌙`,
        remaining: 0,
        limit: LIMITS.chat,
      },
      { status: 429 }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "Faltan mensajes" }, { status: 400 });
  }

  // Keep only the last 12 turns to bound context, prepend system prompt.
  const trimmed = messages.slice(-12);
  const payload = {
    model: "openai",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
    private: true,
    referrer: "hoodagentai",
  };

  try {
    const resp = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: "El motor de IA no respondió. Intenta de nuevo.", detail: text.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await resp.json().catch(() => null);
    const reply =
      data?.choices?.[0]?.message?.content ??
      (typeof data === "string" ? data : null);

    if (!reply) {
      return NextResponse.json(
        { error: "Respuesta vacía del motor de IA." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply,
      remaining: rate.remaining,
      limit: rate.limit,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error de red al contactar el motor de IA." },
      { status: 502 }
    );
  }
}
