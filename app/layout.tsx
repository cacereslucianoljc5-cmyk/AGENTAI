import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HoodAgentAi — Your AI. Your Edge.",
  description:
    "HoodAgentAi: agente de IA gratuito con chat inteligente y generación de imágenes. Rápido, gratis y sin complicaciones.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "HoodAgentAi — Your AI. Your Edge.",
    description: "Chat de IA + generación de imágenes, gratis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
