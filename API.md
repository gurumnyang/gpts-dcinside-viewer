# DC Inside Viewer API 명세서

이 문서는 DC Inside Viewer API의 엔드포인트, 요청/응답 형식, 그리고 사용 예시를 제공합니다.

## 기본 정보

- **기본 URL**: `https://[your-worker].workers.dev`
- **API 버전**: 1.0.0
- **지원 메서드**: GET, OPTIONS
- **응답 형식**: JSON
- **인증 방식**: 인증 없음 (공개 API)
- **CORS**: 모든 도메인 허용 (`*`)
- **개인정보 보호 정책**: `/privacy`

## 공통 응답 형식

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

### 상태 코드

- `200 OK`: 요청 성공
- `400 Bad Request`: 잘못된 요청 매개변수
- `404 Not Found`: 리소스를 찾을 수 없음
- `405 Method Not Allowed`: 허용되지 않은 HTTP 메서드
- `500 Internal Server Error`: 서버 내부 오류

## 엔드포인트

### 서버 상태 확인

#### 요청

```
GET /
GET /health
```

#### 응답

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "service": "gpts-dcinside-viewer"
  }
}
```

### 개인정보 보호 정책

#### 요청

```
GET /privacy
```

#### 응답

HTML 형식으로 개인정보 보호 정책 페이지를 반환합니다. 이 페이지는 사용자 데이터 수집 및 처리에 관한 정보를 제공합니다.

- 내용: 서비스가 사용자 개인정보를 수집하지 않으며, 최소한의 로깅만 수행함을 설명
- 형식: HTML 웹페이지

### 갤러리 게시글 목록 조회

#### 요청

```
GET /api/gallery/{galleryId}/posts
```

#### 매개변수

| 이름       | 위치  | 타입   | 필수 여부 | 설명                                               | 기본값  |
|------------|-------|--------|-----------|---------------------------------------------------|---------|
| galleryId  | path  | string | 필수      | 디시인사이드 갤러리 ID (마이너 갤러리도 지원)      | -       |
| page       | query | number | 선택      | 페이지 번호                                       | 1       |
| type       | query | string | 선택      | 게시판 유형 ('all', 'recommend', 'notice' 중 하나) | 'all'   |

#### 응답

```json
{
  "success": true,
  "data": [
    {
      "id": "12345678",
      "type": "text",
      "subject": "",
      "title": "게시글 제목",
      "link": "https://gall.dcinside.com/mgallery/board/view?id=galleryId&no=12345678",
      "author": {
        "nickname": "닉네임",
        "userId": "작성자ID",
        "ip": "123.123.123.xxx"
      },
      "date": "2025.07.01 12:34:56",
      "count": 1234,
      "recommend": 56,
      "replyCount": 78
    },
    // ... 더 많은 게시글
  ]
}
```

### 갤러리 인기글 목록 조회

#### 요청

```
GET /api/gallery/{galleryId}/hot
```

#### 매개변수

| 이름       | 위치  | 타입   | 필수 여부 | 설명                                  | 기본값 |
|------------|-------|--------|-----------|--------------------------------------|--------|
| galleryId  | path  | string | 필수      | 디시인사이드 갤러리 ID                | -      |
| page       | query | number | 선택      | 페이지 번호                          | 1      |

#### 응답

```json
{
  "success": true,
  "data": [
    // 인기글 목록 (게시글 목록과 동일한 형식)
  ]
}
```

### 갤러리 공지글 목록 조회

#### 요청

```
GET /api/gallery/{galleryId}/notices
```

#### 매개변수

| 이름       | 위치  | 타입   | 필수 여부 | 설명                                  | 기본값 |
|------------|-------|--------|-----------|--------------------------------------|--------|
| galleryId  | path  | string | 필수      | 디시인사이드 갤러리 ID                | -      |
| page       | query | number | 선택      | 페이지 번호                          | 1      |

#### 응답

```json
{
  "success": true,
  "data": [
    // 공지글 목록 (게시글 목록과 동일한 형식)
  ]
}
```

### 특정 게시글 상세 조회

#### 요청

```
GET /api/gallery/{galleryId}/post/{postNo}
```

#### 매개변수

| 이름          | 위치  | 타입    | 필수 여부 | 설명                           | 기본값 |
|---------------|-------|---------|-----------|-------------------------------|--------|
| galleryId     | path  | string  | 필수      | 디시인사이드 갤러리 ID         | -      |
| postNo        | path  | string  | 필수      | 게시글 번호                    | -      |
| extractImages | query | boolean | 선택      | 이미지 URL 추출 여부           | true   |

#### 응답

```json
{
  "success": true,
  "data": {
    "galleryId": "galleryId",
    "id": "12345678",
    "subject": "",
    "title": "게시글 제목",
    "author": {
      "nickname": "닉네임",
      "id": "작성자ID",
      "ip": "123.123.123.xxx"
    },
    "date": "2025.07.01 12:34:56",
    "content": "게시글 내용...",
    "images": ["이미지URL1", "이미지URL2"],
    "views": 1234,
    "recommendCount": 56,
    "comments": [
      {
        "id": "댓글ID",
        "author": {
          "nickname": "댓글작성자",
          "id": "댓글작성자ID",
          "ip": "123.123.123.xxx"
        },
        "content": "댓글 내용",
        "date": "2025.07.01 12:35:00",
        "depth": 0,
        "replies": []
      },
      // ... 더 많은 댓글
    ]
  }
}
```

### 여러 게시글 일괄 조회

#### 요청

```
GET /api/gallery/{galleryId}/posts/batch
```

#### 매개변수

| 이름          | 위치  | 타입    | 필수 여부 | 설명                                        | 기본값 |
|---------------|-------|---------|-----------|-------------------------------------------|--------|
| galleryId     | path  | string  | 필수      | 디시인사이드 갤러리 ID                      | -      |
| ids           | query | string  | 필수      | 조회할 게시글 번호 (쉼표로 구분)            | -      |
| delayMs       | query | number  | 선택      | 요청 간 지연 시간(ms)                       | 200    |
| extractImages | query | boolean | 선택      | 이미지 URL 추출 여부                        | true   |

#### 응답

```json
{
  "success": true,
  "data": [
    // 여러 게시글 정보 (개별 게시글과 동일한 형식)
  ]
}
```

## 사용 예시

### 기본 사용법 (JavaScript)

```javascript
// 게시글 목록 가져오기
async function fetchPosts() {
  const response = await fetch('https://your-worker.workers.dev/api/gallery/programming/posts?page=1');
  const data = await response.json();
  
  if (data.success) {
    console.log('게시글 목록:', data.data);
  } else {
    console.error('에러:', data.error);
  }
}

// 특정 게시글 가져오기
async function fetchPost(galleryId, postNo) {
  const response = await fetch(`https://your-worker.workers.dev/api/gallery/${galleryId}/post/${postNo}`);
  const data = await response.json();
  
  if (data.success) {
    console.log('게시글 정보:', data.data);
  } else {
    console.error('에러:', data.error);
  }
}
```

### cURL 예시

```bash
# 갤러리 게시글 목록 조회
curl "https://your-worker.workers.dev/api/gallery/programming/posts?page=1"

# 갤러리 인기글 목록 조회
curl "https://your-worker.workers.dev/api/gallery/programming/hot"

# 특정 게시글 조회 (이미지 URL 추출 비활성화)
curl "https://your-worker.workers.dev/api/gallery/programming/post/12345678?extractImages=false"

# 여러 게시글 일괄 조회
curl "https://your-worker.workers.dev/api/gallery/programming/posts/batch?ids=12345678,12345679,12345680"
```

## 제한 사항 및 주의사항

1. 디시인사이드의 구조 변경에 따라 API가 영향받을 수 있습니다.
2. 과도한 요청은 디시인사이드 서버에서 IP 차단을 유발할 수 있으니 적절한 딜레이를 사용하세요.
3. 이 API는 디시인사이드의 공식 API가 아니며, 크롤링을 통해 데이터를 수집합니다.
4. 수집한 데이터는 개인 연구, 분석 등의 비상업적 용도로만 사용해주세요.
5. 디시인사이드의 이용약관을 준수해주세요.

## 오류 코드 및 처리

| 상태 코드 | 에러 메시지 | 설명 |
|-----------|-------------|------|
| 400 | Invalid board type. Allowed values: all, recommend, notice | 잘못된 게시판 유형 |
| 400 | Missing required parameter: ids (comma-separated post numbers) | ids 파라미터 누락 |
| 404 | Post not found | 게시글을 찾을 수 없음 |
| 404 | Endpoint not found | 엔드포인트를 찾을 수 없음 |
| 405 | Method Not Allowed | 허용되지 않은 HTTP 메서드 |
| 500 | Internal server error: [에러 메시지] | 서버 내부 오류 |

## 구현 예정 기능

- 갤러리 검색 기능
- 특정 작성자의 글 목록 조회
- 댓글만 별도로 조회하는 기능
- 실시간 인기글 조회
