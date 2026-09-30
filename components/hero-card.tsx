import type { CSSProperties } from "react";
import { Sparkles, Sword } from "lucide-react";
import type { Hero } from "@/lib/mock-heroes";

export function HeroCard({ hero, compact = false }: { hero: Hero; compact?: boolean }) {
  return <article className={`hero-card ${compact ? "compact" : ""}`} style={{ "--hero-accent": hero.accent } as CSSProperties} aria-label={`${hero.username}의 ${hero.source === 'github' ? 'GitHub' : '샘플'} RPG 카드`}>
    <div className="card-top"><span><Sword size={13} /> COMMIT HERO</span><span>NO. {String(hero.level).padStart(3, "0")}</span></div>
    <div className="card-art">
      <div className="art-halo" /><div className="art-runes">✧ · ✦ · ✧</div>
      {/* 로컬 SVG는 데모 캐릭터 아트. 이미지 저장을 위해 일반 img 사용. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/heroes/${hero.art}.svg`} alt={`${hero.title} 판타지 캐릭터 일러스트`} width="320" height="360" />
      <span className="level-badge"><small>LV.</small> {hero.level}</span>
      <div className="art-floor" />
    </div>
    <div className="card-body"><div className="job-label"><Sparkles size={12} /> {hero.job}</div>
      <h3>{hero.title}</h3><p className="card-username">@{hero.username}</p>
      <div className="card-stats">{hero.stats.map(stat => <div key={stat.name}><span>{stat.name}</span><strong>{stat.value}</strong><i style={{ "--stat": `${stat.value}%` } as CSSProperties} /></div>)}</div>
      <p className="card-quote">“{hero.quote}”</p>
      <div className="card-bottom"><span>✦ {hero.language}</span><span>{hero.source === 'github' ? 'GITHUB · AI' : 'DEMO CARD'}</span></div>
    </div>
  </article>;
}
