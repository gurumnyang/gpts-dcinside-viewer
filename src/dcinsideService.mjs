import * as dcinside from '@gurumnyang/dcinside.js';

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
    const postList = await dcinside.getPostList({
      galleryId,
      page,
      boardType
    });
    
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
 * @param {boolean} options.extractImages - 이미지 URL 추출 여부 (기본값: true)
 * @returns {Promise<Object|null>} - 게시글 객체 또는 실패 시 null
 */
async function getPost({ galleryId, postNo, extractImages = true }) {
  try {
    const post = await dcinside.getPost({
      galleryId,
      postNo,
      extractImages,
      includeImageSource: false
    });
    
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
 * @param {number} options.delayMs - 요청 간 지연 시간(ms) (기본값: 200)
 * @param {boolean} options.extractImages - 이미지 URL 추출 여부 (기본값: true)
 * @returns {Promise<Array>} - 게시글 객체 배열
 */
async function getPosts({ galleryId, postNumbers, delayMs = 200, extractImages = true }) {
  try {
    const posts = await dcinside.getPosts({
      galleryId,
      postNumbers,
      delayMs,
      extractImages,
      includeImageSource: false,
      onProgress: (current, total) => {
        console.log(`게시글 수집 진행 상황: ${current}/${total}`);
      }
    });
    
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
    const postList = await dcinside.getPostList({
      galleryId,
      page,
      boardType: 'recommend'
    });
    
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
    const postList = await dcinside.getPostList({
      galleryId,
      page,
      boardType: 'notice'
    });
    
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
