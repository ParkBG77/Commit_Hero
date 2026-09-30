"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Check, ChevronRight, Copy, Download, Github, LoaderCircle, Shield, Sparkles, Sword, WandSparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { HeroCard } from "./hero-card";
import { createMockHero, HEROES, isValidUsername, type Hero } from "@/lib/mock-heroes";
import { decodeHeroSnapshot, encodeHeroSnapshot } from "@/lib/hero-snapshot";

export function CommitHero() {
  const [username, setUsername] = useState("");
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const snapshot = params.get('card');
    if (snapshot) {
      const restored = decodeHeroSnapshot(snapshot);
      if (restored) { setHero(restored); setUsername(restored.username); }
      else setError('공유 카드 링크가 올바르지 않습니다. username으로 새 카드를 만들어주세요.');
    } else {
      const shared = params.get('hero');
      if (shared && isValidUsername(shared)) { setHero(createMockHero(shared)); setUsername(shared); }
    }
    return () => { requestRef.current?.abort(); };
  }, []);

  async function generate(value = username) {
    if (requestRef.current) return;
    const trimmed = value.trim();
    if (!isValidUsername(trimmed)) { setError("영문·숫자·하이픈으로 된 GitHub username을 입력해주세요. (최대 39자)"); return; }
    setUsername(trimmed); setError(""); setNotice(""); setCopied(false); setLoading(true);
    const controller = new AbortController(); requestRef.current = controller;
    try {
      const response = await fetch('/api/hero', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:trimmed}), signal:controller.signal});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '카드를 생성하지 못했습니다.');
      const generated = decodeHeroSnapshot(encodeHeroSnapshot(result.hero));
      if (!generated) throw new Error('카드 응답 형식이 올바르지 않습니다.');
      setHero(generated);
      const url = new URL(window.location.href); url.searchParams.delete('hero'); url.searchParams.set('card', encodeHeroSnapshot(generated));
      window.history.replaceState({}, "", url);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : '카드를 생성하지 못했습니다.');
    } finally { if (requestRef.current === controller) { requestRef.current = null; setLoading(false); } }
  }

  function showSample(value: string) {
    if (requestRef.current) return;
    setHero(createMockHero(value)); setUsername(value); setError(''); setNotice(''); setCopied(false);
    const url = new URL(window.location.href); url.searchParams.delete('card'); url.searchParams.set('hero',value);
    window.history.replaceState({},'',url);
  }

  async function share() {
    if (!hero) return;
    const url = new URL(window.location.href);
    if (hero.source === 'github') { url.searchParams.delete('hero'); url.searchParams.set('card',encodeHeroSnapshot(hero)); }
    else { url.searchParams.delete('card'); url.searchParams.set('hero',hero.username); }
    try { await navigator.clipboard.writeText(url.toString()); setCopied(true); setNotice("카드 링크를 복사했어요. 친구에게 보내보세요!"); }
    catch { setNotice("링크 복사가 제한되어 있어요. 브라우저 주소창의 링크를 복사해주세요."); }
  }

  async function download() {
    if (!cardRef.current || !hero || saving) return;
    setSaving(true); setNotice("");
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true, skipFonts: true });
      const link = document.createElement("a"); link.download = `commit-hero-${hero.username}.png`; link.href = url; link.click();
      setNotice("카드 이미지를 저장했어요.");
    } catch { setNotice("이미지를 저장하지 못했어요. 잠시 후 다시 시도해주세요."); }
    finally { setSaving(false); }
  }

  function reset() {
    requestRef.current?.abort(); requestRef.current = null; setLoading(false); setError('');
    setHero(null); setNotice(""); setCopied(false);
    window.history.replaceState({}, "", window.location.pathname);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return <div className="site-shell">
    <header className="site-header"><a className="brand" href="/" aria-label="Commit Hero 홈"><span className="brand-mark"><Sword size={21} /></span>COMMIT<span>HERO</span></a>
      <nav aria-label="메인 메뉴"><a href="#classes">직업 도감</a><a href="#how-it-works">이용 방법</a><a className="header-cta" href="#summon">내 영웅 소환하기 <ArrowRight size={14} /></a></nav>
    </header>

    <main>
      <section className="hero-section" id="summon">
        <div className="hero-copy"><div className="eyebrow"><span /> EVERY COMMIT TELLS A STORY</div>
          <p className="hero-kicker">당신의 코드에는, 캐릭터가 있다.</p>
          <h1>YOU CODE.<br /><span>YOU ARE A HERO.</span></h1>
          <p className="hero-description">새벽의 마법사일까, 잔디밭의 수호 기사일까?<br />개발 습관 속에 숨어 있는 나만의 RPG 영웅을 만나보세요.</p>
          <form onSubmit={event => { event.preventDefault(); generate(); }} noValidate>
            <label htmlFor="username">GITHUB USERNAME</label>
            <div className={`input-group ${error ? "invalid" : ""}`}><Github size={20} /><span className="input-at">@</span><input ref={inputRef} id="username" value={username} onChange={event => { setUsername(event.target.value); setError(""); }} placeholder="your-github-username" maxLength={39} autoComplete="off" spellCheck={false} disabled={loading} aria-invalid={Boolean(error)} aria-describedby={error ? "username-error" : "demo-help"} /><button disabled={loading} type="submit">{loading ? <LoaderCircle className="spin" size={17} /> : <WandSparkles size={17} />}{loading ? "소환 중" : "영웅 소환"}<ArrowRight size={17} /></button></div>
            {error && <p id="username-error" className="form-error" role="alert">{error}</p>}
            <p className="form-help" id="demo-help"><Shield size={13} /> 로그인 없이 간편하게 <span>·</span> 공개 GitHub 활동으로 AI 카드를 만들어요</p>
          </form>
          <div className="example-row"><span>먼저 구경할래요?</span><button onClick={() => generate("ParkBG77")} disabled={loading}>@ParkBG77 <ChevronRight size={13} /></button></div>
          <div className="hero-divider" /><div className="hero-proof"><span><Sparkles size={17} /> 나를 닮은 캐릭터</span><span><Sword size={17} /> 개발자만 아는 유머</span><span><Copy size={17} /> 한 장으로 공유</span></div>
        </div>

        <div className={`hero-stage ${hero ? "has-result" : ""}`} ref={resultRef}>
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><span className="stage-star star-one">✦</span><span className="stage-star star-two">✧</span>
          <div className="stage-caption">{hero ? "YOUR HERO HAS ARRIVED" : "YOUR NEXT CHARACTER AWAITS"}</div>
          <div className="featured-card" ref={cardRef}><HeroCard hero={hero ?? HEROES[0]} /></div>
          {loading && <div className="summoning-overlay" role="status"><WandSparkles className="spin" size={35} /><strong>코드 속 영웅을 소환하는 중...</strong><span>GitHub 공개 활동을 읽고 AI 문구를 만들고 있어요</span></div>}
          {hero ? <div className="result-actions"><div><button className="primary-button" onClick={download} disabled={saving}>{saving ? <LoaderCircle className="spin" size={15} /> : <Download size={15} />}{saving ? "저장 중..." : "이미지 저장"}</button><button className="secondary-button" onClick={share}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "복사 완료" : "링크 공유"}</button></div><button className="reset-button" onClick={reset}>내 카드 만들기 <ArrowRight size={13} /></button></div> : <p className="stage-note">이런 영웅이 당신을 기다리고 있어요 <Sparkles size={13} /></p>}
          <p className="notice" role="status" aria-live="polite">{notice || (hero ? (hero.source === "github" ? "최근 30일 공개 이벤트 최대 300개 · 공개 저장소 최대 100개 기준. 수치는 게임용이며 실력 평가가 아닙니다. 공유 카드는 편집 가능한 스냅샷입니다." : "데모 결과예요. 실제 GitHub 활동을 분석한 카드가 아닙니다.") : "")}</p>
        </div>
      </section>

      <div className="section-separator"><span>YOUR HISTORY. YOUR CLASS. YOUR STORY.</span><ArrowDown size={16} /></div>
      <section className="classes-section" id="classes"><div className="section-heading"><div><p className="eyebrow">THE CLASS COLLECTION</p><h2>당신은 어떤 영웅인가요?</h2></div><p>같은 코드, 다른 플레이 스타일.<br />커밋 뒤에 숨은 당신의 클래스를 발견하세요.</p></div>
        <div className="class-grid">{HEROES.map((item, index) => <button className={`class-tile class-${item.art}`} key={item.job} onClick={() => showSample(item.username)} disabled={loading}>
          <div className="class-number">CLASS / 0{index + 1}</div><div className="class-art"><img src={`/heroes/${item.art}.svg`} width="190" height="210" alt={`${item.title} 캐릭터`} /></div>
          <div className="class-copy"><span>{item.job}</span><h3>{item.title}</h3><p>{["밤이 깊을수록, 마력이 강해지는 타입.", "작은 커밋으로 거대한 성을 쌓는 타입.", "조용히 사라졌다가 한 번에 몰아치는 타입."][index]}</p><div>샘플 카드 보기 <ArrowRight size={15} /></div></div>
        </button>)}</div>
      </section>

      <section className="how-section" id="how-it-works"><div><p className="eyebrow">THREE STEPS. ONE HERO.</p><h2>당신의 모험은<br />이미 시작됐어요.</h2><p>남은 건 영웅을 깨우는 일뿐.</p></div><div className="steps">{[["01", "username을 알려주세요", "GitHub 아이디 하나면 충분해요."], ["02", "나만의 영웅을 만나세요", "직업과 능력치, 찰떡같은 한 줄까지."], ["03", "친구에게 카드를 보내세요", "나는 마법사인데, 너는 무슨 직업이야?"]].map(([number, title, text]) => <div className="step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>
    </main>
    <footer><a className="brand" href="/">COMMIT<span>HERO</span></a><p>모든 커밋에는 영웅의 이야기가 있다.</p><span>GITHUB + AI · 2026</span></footer>
  </div>;
}

