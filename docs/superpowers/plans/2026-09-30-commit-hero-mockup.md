# Commit Hero Mockup Implementation Plan

> 실행: 이 세션에서 직접 구현한다. 사용자 요청은 기본 세팅과 프런트엔드 목업에 한정한다.

**Goal:** 백엔드 없이 카드 생성·저장·공유 경험을 확인한다.
**Architecture:** Next.js App Router와 클라이언트 상태, 로컬 샘플 데이터 및 SVG 아트.
**Tech Stack:** Next.js, React, TypeScript, Bun, html-to-image.
**Spec:** docs/02-design/features/commit-hero.design.md

## 작업
- [x] package.json, tsconfig.json, next-env.d.ts, next.config.ts, .gitignore, README.md 구성 및 Bun 의존성 설치.
- [x] lib/mock-heroes.ts에 Hero 타입, 고정 샘플, 입력 검증 구현.
- [x] public/heroes에 3개 직업 아트, components/hero-card.tsx에 카드 구현.
- [x] components/commit-hero.tsx와 app 파일에 반응형 화면과 상호작용 구현.
- [x] 타입 검사·production build·브라우저 확인 후 사용법과 제한 기록.

## 실행 기록
Next.js 16.3.7, React 19.3.0, Bun 1.4.2를 설치하고 bun.lock을 생성했다.
TypeScript 검사와 production build가 종료 코드 0으로 통과했다.
브라우저에서 빈 입력 오류, ParkBG77 생성, PNG 저장 성공 안내, 링크 복사 성공,
새로고침으로 공유 결과 복원, 다시 만들기를 확인했다. 콘솔 error 로그는 없었다.
390px와 320px 폭을 확인했고, 320px에서 발견한 가로 넘침은 수정 후 content=viewport=320으로 확인했다.
캐릭터 아트는 직접 작성한 로컬 SVG 목업이다. 외부 분석 요청은 없다.
Git 저장소가 없어 커밋·worktree 작업은 수행하지 않았다.

## 확인할 실패 조건
빈 username, 하이픈 규칙 위반, 긴 username은 오류를 표시한다.
생성 중 재요청을 차단하고 언마운트 시 타이머를 정리한다.
공유 URL에 잘못된 값이 있으면 안전하게 입력 화면으로 돌아간다.
클립보드 권한과 이미지 변환 오류를 알려준다.
좁은 화면에서 카드·버튼·폼이 화면 밖으로 나가지 않는다.
