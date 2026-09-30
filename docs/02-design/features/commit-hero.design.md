# Commit Hero 프런트엔드 목업 설계

작성일: 2026-09-30. 기획: docs/01-plan/features/commit-hero.plan.md

## 요청 범위
Next.js App Router, TypeScript, Bun, Vercel 배포 가능한 기본 구조를 구성한다.
이번 구현은 프런트엔드 목업이다. GitHub API, 로그인, DB, 서버 API를 연결하지 않는다.
실제 분석 공식과 누적 데이터 확보는 추후 백엔드 설계로 남긴다.

## 후속 GitHub 연동 제약
공개 프로필·공개 저장소·공개 활동만 사용한다. 사용자 로그인과 OAuth 동의는 요구하지 않는다.
비공개 활동은 분석에서 제외하며, 조회할 수 없는 데이터를 실제 활동 없음으로 해석하지 않는다.
서비스 측 API 인증 여부는 별도 설계 항목으로 남긴다.
이 문서의 목업 구현 범위에는 GitHub API 연동을 추가하지 않는다.

## 화면
짙은 남색 배경, 금색 강조, 세리프 영문 제목, 한국어 설명을 사용한다.
헤더 → 왼쪽 소개·username 폼 / 오른쪽 대표 카드 → 직업 도감 → 사용 방법 → 푸터.
결과 상태에서는 카드와 다운로드·공유·다시 만들기를 표시한다.
모바일에서는 한 열로 배치하고 버튼과 폼을 터치하기 쉽게 만든다.
로컬 SVG 캐릭터 일러스트는 목업 자산으로 제작하며 최종 일러스트 교체를 허용한다.

## 데이터와 상호작용
Hero 타입: username, job, title, quote, level, stats, accent, art.
직업 3종은 마법사·기사·도적. 수치와 칭호는 명시적인 가상 샘플이다.
username 해시로 샘플을 선택하므로 동일 입력에 결과가 고정된다. 실제 분석으로 표현하지 않는다.
영문·숫자·하이픈 username을 1~39자로 검증하며 앞뒤 하이픈 및 연속 하이픈을 거부한다.
idle → loading(약 1.2초) → result. 빈 값/잘못된 값은 인라인 오류.
버튼 중복 입력을 방지하고 타이머는 언마운트 시 정리한다.
공유 링크는 ?hero=username 형식으로 브라우저에서 같은 샘플을 재현한다.
이미지는 브라우저에서 카드 DOM을 PNG로 저장한다. 복사/저장 실패는 사용자에게 안내한다.
입력 레이블, 상태 알림, 키보드 포커스, reduced-motion을 제공한다.

## 파일 구조
app/layout.tsx, app/page.tsx, app/globals.css: 메타데이터, 화면 진입, 스타일.
components/commit-hero.tsx: 폼·로딩·결과·도감·공유 흐름.
components/hero-card.tsx: 저장 가능한 카드.
lib/mock-heroes.ts: 샘플과 username 검증.
public/heroes/*.svg: 로컬 캐릭터 아트.

## 검증
Bun install, TypeScript 검사, Next.js production build.
브라우저에서 생성, 오류, 공유 링크 복원, 이미지 저장, 모바일 폭을 확인한다.
API 키나 네트워크 분석 요청 없이 동작해야 한다.
