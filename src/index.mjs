import * as dcinsideService from './dcinsideService.mjs';

/**
 * CORS 헤더를 적용하는 함수
 * @param {Response} response - 응답 객체
 * @returns {Response} - CORS 헤더가 적용된 응답 객체
 */
function applyCorsHeaders(response) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*');
  const headers = new Headers(response.headers);
  
  headers.set('Access-Control-Allow-Origin', allowedOrigins);
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * 에러 응답을 반환하는 함수
 * @param {string} message - 에러 메시지
 * @param {number} status - HTTP 상태 코드 (기본값: 500)
 * @returns {Response} - 에러 응답
 */
function errorResponse(message, status = 500) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message
    }), 
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * 성공 응답을 반환하는 함수
 * @param {*} data - 응답 데이터
 * @param {number} status - HTTP 상태 코드 (기본값: 200)
 * @returns {Response} - 성공 응답
 */
function successResponse(data, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data
    }), 
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * URL 파라미터를 파싱하는 함수
 * @param {string} url - URL 문자열
 * @returns {Object} - 파라미터 객체
 */
function parseUrlParams(url) {
  const params = {};
  const searchParams = new URL(url).searchParams;
  
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  
  return params;
}

/**
 * 요청 핸들러 함수
 * @param {Request} request - 요청 객체
 * @param {Object} env - 환경 변수
 * @param {Object} ctx - 컨텍스트 객체
 * @returns {Promise<Response>} - 응답 객체
 */
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // OPTIONS 요청 처리 (CORS 프리플라이트)
  if (request.method === 'OPTIONS') {
    return applyCorsHeaders(new Response(null, { status: 204 }));
  }
  
  // GET 요청이 아닌 경우 405 응답
  if (request.method !== 'GET') {
    return applyCorsHeaders(errorResponse('Method Not Allowed', 405));
  }
  
  try {
    let response;
    
    // 헬스 체크 엔드포인트
    if (path === '/' || path === '/health') {
      response = successResponse({
        status: 'ok',
        version: '1.0.0',
        service: 'gpts-dcinside-viewer'
      });
    }
    // 갤러리 게시글 목록 조회 API
    else if (path.match(/^\/api\/gallery\/[^/]+\/posts$/)) {
      const galleryId = path.split('/')[3];
      const params = parseUrlParams(request.url);
      const page = parseInt(params.page) || 1;
      const boardType = params.type || 'all';
      
      if (!['all', 'recommend', 'notice'].includes(boardType)) {
        response = errorResponse('Invalid board type. Allowed values: all, recommend, notice', 400);
      } else {
        const posts = await dcinsideService.getPostList({ galleryId, page, boardType });
        response = successResponse(posts);
      }
    }
    // 갤러리 인기글 목록 조회 API
    else if (path.match(/^\/api\/gallery\/[^/]+\/hot$/)) {
      const galleryId = path.split('/')[3];
      const params = parseUrlParams(request.url);
      const page = parseInt(params.page) || 1;
      
      const posts = await dcinsideService.getHotPosts({ galleryId, page });
      response = successResponse(posts);
    }
    // 갤러리 공지글 목록 조회 API
    else if (path.match(/^\/api\/gallery\/[^/]+\/notices$/)) {
      const galleryId = path.split('/')[3];
      const params = parseUrlParams(request.url);
      const page = parseInt(params.page) || 1;
      
      const posts = await dcinsideService.getNotices({ galleryId, page });
      response = successResponse(posts);
    }
    // 특정 게시글 조회 API
    else if (path.match(/^\/api\/gallery\/[^/]+\/post\/[0-9]+$/)) {
      const pathParts = path.split('/');
      const galleryId = pathParts[3];
      const postNo = pathParts[5];
      const params = parseUrlParams(request.url);
      const extractImages = params.extractImages !== 'false';
      
      const post = await dcinsideService.getPost({ galleryId, postNo, extractImages });
      response = post ? successResponse(post) : errorResponse('Post not found', 404);
    }
    // 여러 게시글 조회 API
    else if (path.match(/^\/api\/gallery\/[^/]+\/posts\/batch$/)) {
      const galleryId = path.split('/')[3];
      const params = parseUrlParams(request.url);
      
      if (!params.ids) {
        response = errorResponse('Missing required parameter: ids (comma-separated post numbers)', 400);
      } else {
        const postNumbers = params.ids.split(',');
        const delayMs = parseInt(params.delayMs) || 200;
        const extractImages = params.extractImages !== 'false';
        
        const posts = await dcinsideService.getPosts({ galleryId, postNumbers, delayMs, extractImages });
        response = successResponse(posts);
      }
    }
    // 개인정보 보호 정책 페이지
    else if (path === '/privacy') {
      const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>개인정보 보호 정책 - DC Inside Viewer API</title>
  <style>
    body {
      font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    h2 {
      color: #3498db;
      margin-top: 25px;
    }
    p {
      margin: 15px 0;
    }
    .container {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 30px;
    }
    footer {
      margin-top: 30px;
      font-size: 0.9em;
      color: #7f8c8d;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>개인정보 보호 정책</h1>
    <p>
      최종 업데이트: 2025년 7월 2일
    </p>
    
    <h2>개요</h2>
    <p>
      DC Inside Viewer API는 사용자의 개인정보 보호를 매우 중요하게 생각합니다. 
      저희 서비스는 최소한의 정보만을 처리하며 사용자의 프라이버시를 보장하기 위해 최선을 다하고 있습니다.
    </p>
    
    <h2>수집하는 정보</h2>
    <p>
      <strong>저희 서비스는 사용자에 대한 어떠한 개인 정보도 수집하거나 저장하지 않습니다.</strong>
    </p>
    <p>
      API 요청 과정에서 일시적으로 처리되는 정보는 다음과 같습니다:
    </p>
    <ul>
      <li>요청된 갤러리 ID 및 게시글 번호 (API 요청 처리를 위한 필수 매개변수)</li>
      <li>표준 HTTP 요청 정보 (IP 주소, 사용자 에이전트 등)</li>
    </ul>
    <p>
      위 정보는 API 요청을 처리하기 위해 일시적으로만 사용되며, 별도로 저장되거나 분석 목적으로 사용되지 않습니다.
    </p>
    
    <h2>로깅 정책</h2>
    <p>
      저희 서비스는 다음과 같은 로깅 정책을 따릅니다:
    </p>
    <ul>
      <li>사용자 식별이 가능한 정보는 로깅하지 않습니다.</li>
      <li>오류 발생 시에만 최소한의 디버깅 정보를 기록합니다.</li>
      <li>로그는 7일 이내에 자동으로 삭제됩니다.</li>
    </ul>
    
    <h2>제3자 서비스</h2>
    <p>
      저희 API는 디시인사이드 웹사이트의 공개 데이터에 접근하여 정보를 제공합니다.
      디시인사이드 서비스 이용 시, 해당 사이트의 개인정보 처리방침이 적용될 수 있습니다.
    </p>
    
    <h2>보안</h2>
    <p>
      저희는 API 서비스의 보안을 위해 다음과 같은 조치를 취하고 있습니다:
    </p>
    <ul>
      <li>모든 API 통신은 HTTPS를 통해 암호화됩니다.</li>
      <li>Cloudflare의 보안 기능을 활용하여 DDoS 공격 및 악의적인 트래픽으로부터 서비스를 보호합니다.</li>
    </ul>
    
    <h2>정책 변경</h2>
    <p>
      본 개인정보 보호정책은 필요에 따라 변경될 수 있으며, 중요한 변경사항이 있을 경우 이 페이지를 통해 안내됩니다.
    </p>
    
    <h2>문의하기</h2>
    <p>
      개인정보 보호 정책에 관한 질문이나 의견이 있으시면 GitHub 저장소의 이슈를 통해 문의해 주세요.
    </p>
  </div>
  
  <footer>
    &copy; 2025 GurumNyang - DC Inside Viewer API for GPTs
  </footer>
</body>
</html>
      `;
      
      response = new Response(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=UTF-8'
        }
      });
    }
    // 404 Not Found
    else {
      response = errorResponse('Endpoint not found', 404);
    }
    
    return applyCorsHeaders(response);
  } catch (error) {
    console.error('API 요청 처리 중 오류 발생:', error);
    return applyCorsHeaders(errorResponse(`Internal server error: ${error.message}`, 500));
  }
}

// ES 모듈 형식의 Cloudflare Worker 메인 함수
export default {
  async fetch(request, env, ctx) {
    return await handleRequest(request, env, ctx);
  }
};
