# DC Inside Viewer API

GPTs를 위한 DC Inside 뷰어 API 서버 (Cloudflare Worker)

## 개요

이 프로젝트는 OpenAI GPTs에서 DC Inside 갤러리 정보를 조회할 수 있도록 하는 API 서버입니다. Cloudflare Worker를 사용하여 서버리스 환경에서 실행됩니다.

## 기능

- 갤러리 정보 조회
- 갤러리 게시글 목록 조회
- 게시글 상세 정보 조회
- CORS 지원
- 캐싱 지원
- 에러 처리

## API 엔드포인트

자세한 API 명세는 [API.md](./API.md) 문서를 참조하세요.

### 기본 정보
- `GET /` - API 정보 및 상태 확인
- `GET /health` - 서버 상태 확인
- `GET /privacy` - 개인정보 보호 정책 페이지 (HTML)

### 갤러리 관련
- `GET /api/gallery/{galleryId}/posts` - 갤러리 게시글 목록 조회
  - Query Parameters:
    - `page`: 페이지 번호 (기본값: 1)
    - `type`: 게시판 유형 ('all', 'recommend', 'notice' 중 하나, 기본값: 'all')

- `GET /api/gallery/{galleryId}/hot` - 갤러리 인기글 목록 조회
  - Query Parameters:
    - `page`: 페이지 번호 (기본값: 1)

- `GET /api/gallery/{galleryId}/notices` - 갤러리 공지글 목록 조회
  - Query Parameters:
    - `page`: 페이지 번호 (기본값: 1)

### 게시글 관련
- `GET /api/gallery/{galleryId}/post/{postNo}` - 특정 게시글 상세 정보 조회
  - Query Parameters:
    - `extractImages`: 이미지 URL 추출 여부 (기본값: true)

- `GET /api/gallery/{galleryId}/posts/batch` - 여러 게시글 일괄 조회
  - Query Parameters:
    - `ids`: 쉼표로 구분된 게시글 번호 목록 (필수)
    - `delayMs`: 요청 간 지연 시간(ms) (기본값: 200)
    - `extractImages`: 이미지 URL 추출 여부 (기본값: true)

## 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Cloudflare 계정

### 설치

1. 패키지 설치:
\`\`\`bash
npm install
\`\`\`

2. Wrangler CLI 설치:
\`\`\`bash
npm install -g wrangler
\`\`\`

3. Cloudflare 로그인:
\`\`\`bash
wrangler login
\`\`\`

### 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

로컬에서 개발 서버가 실행되며, 기본적으로 `http://localhost:8787`에서 접속할 수 있습니다.

### 배포

\`\`\`bash
npm run deploy
\`\`\`

## 프로젝트 구조

```
├── src/
│   ├── index.js          # 메인 Worker 파일 및 라우팅 로직
│   └── dcinsideService.js # 디시인사이드 API 서비스 함수
├── wrangler.toml         # Cloudflare Worker 설정
├── package.json          # 프로젝트 설정
└── README.md             # 문서
```

## 환경 변수

`wrangler.toml` 파일의 `[vars]` 섹션에서 환경 변수를 설정할 수 있습니다.

주요 환경 변수:
- `ALLOWED_ORIGINS`: CORS 허용 도메인 (기본값: "*")

## 사용 예시

### 게시글 목록 조회
```bash
# 일반 게시글 목록
curl "https://your-worker.your-subdomain.workers.dev/api/gallery/programming/posts?page=1"

# 인기글 목록
curl "https://your-worker.your-subdomain.workers.dev/api/gallery/programming/hot"

# 공지글 목록
curl "https://your-worker.your-subdomain.workers.dev/api/gallery/programming/notices"
```

### 게시글 상세 조회
```bash
# 단일 게시글 조회
curl "https://your-worker.your-subdomain.workers.dev/api/gallery/programming/post/12345"

# 여러 게시글 일괄 조회
curl "https://your-worker.your-subdomain.workers.dev/api/gallery/programming/posts/batch?ids=12345,12346,12347"
```

## 응답 형식

모든 API 응답은 다음 형식을 따릅니다:

### 성공 응답
```json
{
  "success": true,
  "data": { ... }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 개발 가이드

### 새로운 엔드포인트 추가

1. `src/index.js`에서 `handleRequest` 함수 내에 새로운 경로 패턴 추가:

```javascript
else if (path.match(/^\/api\/new-endpoint$/)) {
  // 로직 구현
  response = successResponse(data);
}
```

2. 필요한 경우 `src/dcinsideService.js`에 서비스 함수 추가

### 주의사항

- 디시인사이드의 이용약관을 준수해주세요.
- 과도한 요청은 IP 차단을 유발할 수 있으니 적절한 딜레이(delayMs)를 설정하세요.
- 수집한 데이터는 개인 연구, 분석 등의 비상업적 용도로만 사용해주세요.

## 라이선스

ISC

## 기여

Pull Request와 Issue를 환영합니다.
