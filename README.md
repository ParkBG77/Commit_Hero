# Commit Hero

GitHub 공개 활동으로 RPG 영웅 카드를 만들고 OpenAI GPT로 한국어 칭호와 개발자 밈 한 줄을 생성합니다.
Next.js App Router + React + TypeScript, Bun, Vercel.

## 설정과 실행

`.env.example`을 `.env.local`로 복사한 뒤 `OPENAI_API_KEY`에 유효한 OpenAI API 키를 입력합니다.
`OPENAI_MODEL` 기본값은 `gpt-4o-mini`입니다. 다른 Responses API / Structured Outputs 지원 모델로 변경할 수 있습니다.
`GITHUB_TOKEN`은 선택이며 공개 조회 한도를 늘릴 때 사용합니다. 사용자는 GitHub 로그인 없이 이용합니다.
키를 `NEXT_PUBLIC_` 환경변수에 넣지 마세요. 키 파일은 Git에서 제외됩니다.
환경변수 변경 후 개발 서버를 다시 시작합니다. Vercel에서는 프로젝트 환경변수에 설정합니다.

```sh
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

현재 작업 환경에서는 `.\.tools\node_modules\.bin\bun.cmd`로 Bun을 실행할 수 있습니다.

## 생성 흐름

username → POST /api/hero → 공개 GitHub 프로필·소유 저장소·이벤트 → 규칙 기반 직업/레벨/능력치 → GPT 칭호/밈 → 카드.
분석 범위: 최근 30일 공개 이벤트 최대 300개, 최근 갱신한 공개 소유 저장소 최대 100개.
이벤트 수는 커밋 수와 다르며, 전체 활동 이력이나 실제 개발 실력으로 해석하지 않습니다.
활동이 없는 경우에도 관측 범위의 부족으로 취급합니다. 시간대 기반 생활 습관은 추론하지 않습니다.
PNG 저장과 공유 링크를 지원합니다. 공유 링크는 생성 당시 카드 스냅샷을 포함하므로 추가 AI 호출 없이 복원됩니다.
공유 데이터는 사용자가 편집할 수 있고 검증된 인증 자료가 아닙니다. 색상·직업 아트는 허용된 프리셋에서 복원합니다.
직업 도감은 AI를 호출하지 않는 샘플 카드입니다.

## 캐시 및 오류

계정별 생성 결과는 서버 프로세스 내 1시간 캐시(최대 200개), 동시 요청은 합칩니다.
전체 동시 생성은 프로세스당 최대 3개입니다. 서버 재시작 및 여러 Vercel 인스턴스 간에는 공유되지 않습니다.
존재하지 않는 계정, GitHub 한도, OpenAI 키/모델 설정, AI 거절과 네트워크 실패는 사용자에게 안내합니다.

## 검증

외부 응답을 대체한 자동 테스트 8개: 입력, 공개 데이터 필터, 중복 이벤트, 계정 404, AI 거절,
공유 스냅샷 복원/검증, 키 누락, GitHub 한도, 요청 본문 검증.
TypeScript 검사 및 production build 통과.
실제 ParkBG77 GitHub 조회 성공. OpenAI 실제 호출은 환경의 키가 invalid_api_key(401)를 반환하여 생성 성공을 확인하지 못했습니다.
브라우저에서 새 AI 흐름의 PNG 저장/클립보드 동작은 이번 작업에서 재검증하지 않았습니다.

설계: docs/02-design/features/github-ai-meme.design.md

## 배포

- Vercel 사이트: https://commit-hero-iota.vercel.app
- GitHub 저장소: https://github.com/ParkBG77/Commit_Hero
- Vercel 프로젝트: DevTest / commit-hero
- 2026-09-30 Bun 기반 원격 빌드와 production 배포 완료. 사이트 HTTP 200 확인.
- 현재 단계는 사이트 배포만 완료했다. GitHub 자동 배포 연결은 미완료다.
- Production 환경에 OPENAI_API_KEY가 아직 없어 실제 AI 카드 생성은 사용할 수 없다.
- 사용자의 요청에 따라 GitHub 연결과 AI 키 등록은 후속 작업으로 남긴다.
