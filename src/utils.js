/**
 * 타임아웃 래퍼 유틸리티
 * @param {Promise} promise - 실행할 Promise
 * @param {number} timeoutMs - 타임아웃 시간 (밀리초)
 * @param {string} operation - 작업 이름 (에러 메시지용)
 * @returns {Promise} - 타임아웃이 적용된 Promise
 */
function withTimeout(promise, timeoutMs, operation = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      // 정리 함수 - 메모리 누수 방지
      promise.finally(() => clearTimeout(timer));
    })
  ]);
}

export { withTimeout };
