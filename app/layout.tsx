import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Commit Hero | 코드 속에 잠든 영웅을 깨우세요",
  description: "당신의 개발 습관이 RPG 캐릭터가 된다. Commit Hero 프런트엔드 데모.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
