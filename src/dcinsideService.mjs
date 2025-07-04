import * as dcinside from '@gurumnyang/dcinside.js';
import { withTimeout } from './utils.js';

// CPU 시간 제한을 고려한 타임아웃 설정 (15초)
const REQUEST_TIMEOUT = 15000;

/**
 * 갤러리의 게시글 목록을 가져오는 함수
 * @param {Object} options - 옵션 객체
 * @param {string} options.galleryId - 갤러리 ID
 * @param {number} options.page - 페이지 번호 (기본값: 1)
 * @param {string} options.boardType - 게시판 유형 ('all', 'recommend', 'notice' 중 하나, 기본값: 'all')
 * @returns {Promise<Array>} - 게시글 목록
 */
async function getPostList({ galleryId, page = 1, boardType = 'all' }) {
  try {
    const postList = await withTimeout(
      dcinside.getPostList({
        galleryId,
        page,
        boardType
      }),
      REQUEST_TIMEOUT,
      'Post list retrieval'
    );
    
    return postList;
  } catch (error) {
    console.error(`갤러리 게시글 목록 수집 오류 (${galleryId}, 페이지: ${page}):`, error);
    throw new Error(`갤러리 게시글 목록을 가져오는데 실패했습니다: ${error.message}`);
  }
}

/**
 * 특정 게시글의 내용을 가져오는 함수
 * @param {Object} options - 옵션 객체
 * @param {string} options.galleryId - 갤러리 ID
 * @param {string|number} options.postNo - 게시글 번호
 * @param {boolean} options.extractImages - 이미지 URL 추출 여부 (기본값: false)
 * @returns {Promise<Object|null>} - 게시글 객체 또는 실패 시 null
 */
async function getPost({ galleryId, postNo, extractImages = false }) {
  try {
    const post = await withTimeout(
      dcinside.getPost({
        galleryId,
        postNo,
        extractImages,
        includeImageSource: false
      }),
      REQUEST_TIMEOUT,
      'Post retrieval'
    );
    
    return post;
  } catch (error) {
    console.error(`게시글 수집 오류 (${galleryId}, 게시글: ${postNo}):`, error);
    throw new Error(`게시글을 가져오는데 실패했습니다: ${error.message}`);
  }
}

/**
 * 여러 게시글을 한 번에 가져오는 함수
 * @param {Object} options - 옵션 객체
 * @param {string} options.galleryId - 갤러리 ID
 * @param {Array<string|number>} options.postNumbers - 게시글 번호 배열
 * @param {number} options.delayMs - 요청 간 지연 시간(ms) (기본값: 50)
 * @param {boolean} options.extractImages - 이미지 URL 추출 여부 (기본값: false)
 * @returns {Promise<Array>} - 게시글 객체 배열
 */
async function getPosts({ galleryId, postNumbers, delayMs = 50, extractImages = false }) {
  try {
    // 배치 크기 제한으로 CPU 시간 초과 방지
    const maxBatchSize = 5;
    const limitedPostNumbers = postNumbers.slice(0, maxBatchSize);
    
    const posts = await withTimeout(
      dcinside.getPosts({
        galleryId,
        postNumbers: limitedPostNumbers,
        delayMs,
        extractImages,
        includeImageSource: false,
        retryAttempts: 1, // 재시도 횟수 제한
        retryDelay: 100   // 재시도 지연 시간 단축
      }),
      REQUEST_TIMEOUT,
      'Batch posts retrieval'
    );
    
    return posts;
  } catch (error) {
    console.error(`여러 게시글 수집 오류 (${galleryId}, 게시글 수: ${postNumbers.length}):`, error);
    throw new Error(`여러 게시글을 가져오는데 실패했습니다: ${error.message}`);
  }
}

/**
 * 갤러리의 인기글 목록을 가져오는 함수
 * @param {Object} options - 옵션 객체
 * @param {string} options.galleryId - 갤러리 ID
 * @param {number} options.page - 페이지 번호 (기본값: 1)
 * @returns {Promise<Array>} - 인기 게시글 목록
 */
async function getHotPosts({ galleryId, page = 1 }) {
  try {
    const postList = await withTimeout(
      dcinside.getPostList({
        galleryId,
        page,
        boardType: 'recommend'
      }),
      REQUEST_TIMEOUT,
      'Hot posts retrieval'
    );
    
    return postList;
  } catch (error) {
    console.error(`갤러리 인기글 목록 수집 오류 (${galleryId}, 페이지: ${page}):`, error);
    throw new Error(`갤러리 인기글 목록을 가져오는데 실패했습니다: ${error.message}`);
  }
}

/**
 * 갤러리의 공지글 목록을 가져오는 함수
 * @param {Object} options - 옵션 객체
 * @param {string} options.galleryId - 갤러리 ID
 * @param {number} options.page - 페이지 번호 (기본값: 1)
 * @returns {Promise<Array>} - 공지 게시글 목록
 */
async function getNotices({ galleryId, page = 1 }) {
  try {
    const postList = await withTimeout(
      dcinside.getPostList({
        galleryId,
        page,
        boardType: 'notice'
      }),
      REQUEST_TIMEOUT,
      'Notices retrieval'
    );
    
    return postList;
  } catch (error) {
    console.error(`갤러리 공지글 목록 수집 오류 (${galleryId}, 페이지: ${page}):`, error);
    throw new Error(`갤러리 공지글 목록을 가져오는데 실패했습니다: ${error.message}`);
  }
}

export {
  getPostList,
  getPost,
  getPosts,
  getHotPosts,
  getNotices
};
