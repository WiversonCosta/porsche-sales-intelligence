import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Porsche Sales Intelligence",
  description: "Dashboard executiva de vendas por modelo, cidade, ano e forma de pagamento.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
