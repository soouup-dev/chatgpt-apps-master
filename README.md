# Storyboard MCP App

ChatGPT 안에서 바로 동작하는 **영상 스토리보드 생성 도구**입니다.
클라이언트 요구사항 한 줄만 입력하면 씬 구성, 컬러 팔레트, 씬별 AI 이미지까지 자동으로 만들어 위젯으로 보여줍니다.

> "타투샵 30초 광고 영상 만들어줘. 한국적이고 빈티지한 느낌으로" → 6개 씬 구성 + 컬러 팔레트 + 씬별 레퍼런스 이미지가 ChatGPT 안에서 바로 렌더링됩니다.

---

## 무엇을 만들었나

- **MCP(Model Context Protocol) 서버** — ChatGPT가 직접 호출하는 tool을 제공
- **인앱 위젯** — ChatGPT 대화창 안에서 렌더링되는 React 앱
- **OAuth 인증** — 사용자별 프로젝트 히스토리 관리
- **AI 이미지 생성** — 씬 설명을 기반으로 레퍼런스 이미지 자동 생성

## 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| Server | Cloudflare Workers, MCP SDK, OAuth Provider |
| DB | Cloudflare D1 (SQLite) + Drizzle ORM |
| Storage | Cloudflare R2 (이미지 저장) |
| AI | Cloudflare Workers AI (`flux-1-schnell`) |
| Widget | React 19, Tailwind CSS v4, Vite |

## 아키텍처

```
ChatGPT
  ↓ 사용자 발화
MCP Server (Cloudflare Workers)
  ├─ OAuth 인증 (이메일 기반)
  ├─ D1: 프로젝트/씬 데이터
  ├─ R2: 씬 이미지 저장
  └─ Workers AI: 씬 이미지 생성
  ↓ structuredContent
Widget (React, ChatGPT 인앱 렌더링)
  ├─ 프로젝트 목록/상세
  ├─ 씬 카드 (이미지 + 카메라/카피/BGM 정보)
  └─ 컬러 팔레트
```

## 주요 기능

- 클라이언트 요구사항 → 씬 구성 자동 생성 (타임라인, 카메라 무브먼트, 카피, 전환, BGM 방향까지)
- 씬별 AI 이미지 생성 (GPT가 직접 영어 프롬프트를 작성해 이미지 정확도 향상)
- 프로젝트 목록 / 상세 조회, 삭제
- ChatGPT 시스템 테마(라이트/다크) 자동 대응

## 겪은 문제와 해결 (트러블슈팅 기록)

실제 개발 중 마주친 문제들과 원인, 해결 과정입니다.

- **JSON 이중 직렬화**: Drizzle의 `{ mode: 'json' }` 컬럼에 수동으로 `JSON.stringify`를 한 번 더 호출해 데이터가 이중 인코딩됨 → 수동 직렬화 제거
- **위젯 상태 미갱신**: `app.ontoolresult`를 `onAppCreated` 시점에 한 번만 등록해 오래된 클로저를 참조 → `useEffect`로 최신 핸들러를 매번 재등록
- **AI 이미지에 깨진 텍스트 생성**: 이미지 생성 모델이 텍스트를 그리려다 항상 깨진 글자가 나옴 → 프롬프트에서 텍스트 관련 키워드를 정규식으로 필터링 + "no text" 지시 강제 추가
- **일부 씬만 이미지 생성 실패**: Cloudflare Workers AI 무료 요금제의 일일 뉴런 한도(10,000)를 초과 → 실패 시 재시도 로직 추가, 근본적으로는 사용량 제한/과금 모델이 필요함을 확인
- **OAuth 세션 반복 만료**: KV 바인딩 이름이 OAuth Provider가 기대하는 고정 이름(`OAUTH_KV`)과 달라 세션이 유지되지 않음

## 왜 여기서 멈췄나

실제 영상 제작 실무자 테스트 결과, "클라이언트 첫 미팅 전 초안 · 아이디어 참고용" 정도로는 유의미하지만 실무에 필수로 편입되기엔 애매하다는 피드백을 받았습니다.

또한 AI 이미지 생성 기능은 사용자가 늘어날수록 운영자(본인)의 인프라 비용이 선형으로 증가하는 구조라, 수익화나 사용량 제한 정책 없이는 서비스로 유지하기 어렵다는 것을 직접 확인했습니다. MCP tool 자체가 ChatGPT/Claude 유료 구독 위에서 동작하기 때문에, 별도 구독형 수익화도 사용자 관점에서 설득력이 약하다는 한계도 파악했습니다.

지금은 기술 검증과 포트폴리오 목적으로 정리하고, 이후 이 경험을 기반으로 다른 방향(예: 개발 프로젝트 셋업 자동화 등)을 검토 중입니다.

## 로컬 실행

```bash
# server
cd server
npm install
npx wrangler dev

# widgets
cd widgets
npm install
npm run build
```

자세한 설정은 `server/wrangler.jsonc`를 참고하세요 (D1, R2, KV, Workers AI 바인딩 필요).
