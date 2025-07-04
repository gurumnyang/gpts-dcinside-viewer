import * as dcinsideService from './dcinsideService.js';

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
      const extractImages = params.extractImages === 'true'; // 기본값 false로 변경
      
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
        const delayMs = parseInt(params.delayMs) || 50; // 기본값 50ms로 변경
        const extractImages = params.extractImages === 'true'; // 기본값 false로 변경
        
        const posts = await dcinsideService.getPosts({ galleryId, postNumbers, delayMs, extractImages });
        response = successResponse(posts);
      }
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
