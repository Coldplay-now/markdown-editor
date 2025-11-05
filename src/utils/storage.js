const STORAGE_KEY = 'markdown-editor-content';

/**
 * 保存内容到 localStorage
 * @param {string} content - 要保存的 Markdown 内容
 */
export const saveContent = (content) => {
  try {
    localStorage.setItem(STORAGE_KEY, content);
    return true;
  } catch (error) {
    console.error('Failed to save content:', error);
    return false;
  }
};

/**
 * 从 localStorage 加载内容
 * @returns {string|null} - 保存的 Markdown 内容，如果不存在返回 null
 */
export const loadContent = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to load content:', error);
    return null;
  }
};

/**
 * 清空 localStorage 中的内容
 */
export const clearContent = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear content:', error);
    return false;
  }
};

