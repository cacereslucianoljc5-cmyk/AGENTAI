<div align="center">

# 🟢 HoodAgentAi

**Your AI. Your Edge.**

Agente de IA gratuito con **chat inteligente** y **generación de imágenes**.
Rápido, gratis, con límites diarios y sin claves que configurar.

</div>

---

## ✨ Qué incluye

- **💬 Chat LLM** — un asistente de IA conversacional ("HoodAgent").
- **🎨 Generación de imágenes** — texto → imagen, con formatos 1:1 / 16:9 / 9:16.
- **🚦 Límites diarios** — 40 mensajes y 20 imágenes por día (configurables).
- **🎨 Estética neón** — diseño oscuro con verde neón, igual que la marca.
- **▲ Listo para Vercel** — se despliega sin variables de entorno.

## 🧠 Motor de IA

Usa la API pública y **gratuita** de [Pollinations.ai](https://pollinations.ai):

- No requiere API key ni cuenta.
- Las imágenes salen **sin logo ni marca de agua** (`nologo=true`).
- **No usa tu cuenta de Claude/OpenAI** ni ninguna clave privada.

> Si en el futuro quieres más calidad o control, puedes cambiar el motor por
> Groq, Google Gemini (nivel gratis) u OpenAI editando `app/api/chat/route.ts`
> y `app/api/image/route.ts`.

## 🚀 Desarrollo local

```bash
npm install
npm run dev
# abre http://localhost:3000
```

## ▲ Desplegar en Vercel

1. Importa este repositorio en [vercel.com/new](https://vercel.com/new).
2. Framework: **Next.js** (autodetectado). No hace falta configurar nada más.
3. Deploy. ¡Listo!

No se necesitan variables de entorno.

## 🚦 Configurar los límites

Edita `lib/ratelimit.ts`:

```ts
export const LIMITS = {
  chat: 40,   // mensajes por día
  image: 20,  // imágenes por día
};
```

Y los valores espejo en el UI dentro de `app/page.tsx`
(`CHAT_LIMIT`, `IMAGE_LIMIT`).

> El límite del servidor es en memoria (por instancia, se reinicia en cold
> starts) — suficiente para un tier gratuito. Para límites estrictos y
> persistentes, conecta **Upstash Redis** o **Neon Postgres** y guarda el
> contador por IP/usuario.

## 🖼️ Logos

Coloca tu personaje como `public/mascot.png`. Si no existe, la web muestra un
hexágono neón de reemplazo. Ver `public/README.md`.

## ⚠️ Uso responsable

Esta app es para uso personal y creativo. No generes contenido dañino, ilegal
o que infrinja derechos de terceros.
