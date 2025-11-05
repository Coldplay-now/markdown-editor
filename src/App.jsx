import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import { loadContent, saveContent, clearContent } from './utils/storage';
import './App.css';

// 默认示例 Markdown 内容
const defaultContent = `# Markdown 编辑器示例

欢迎使用功能强大的 Markdown 编辑器！本编辑器支持实时预览、语法高亮、数学公式、Mermaid 图表、目录生成等功能。

[TOC]

## 文本样式

这是**粗体文字**，这是*斜体文字*，这是~~删除线文字~~。

你也可以组合使用：***粗斜体***

## 列表

### 无序列表
- 第一项
- 第二项
  - 子项 2.1
  - 子项 2.2
- 第三项

### 有序列表
1. 第一步
2. 第二步
3. 第三步

### 任务列表
- [x] 已完成的任务
- [ ] 待完成的任务
- [ ] 另一个待完成的任务

## 链接和引用

这是一个 [链接示例](https://github.com)。

> 这是一段引用文字。
> 
> 引用可以有多段。

## 代码

### 行内代码
使用 \`console.log()\` 来输出日志。

### 代码块

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 输出: 55
\`\`\`

\`\`\`python
def hello_world():
    print("Hello, World!")
    
hello_world()
\`\`\`

## 表格

| 特性 | 支持 | 说明 |
|------|------|------|
| Markdown | ✅ | 基础语法 |
| 代码高亮 | ✅ | 多语言支持 |
| 数学公式 | ✅ | KaTeX |
| Mermaid | ✅ | 流程图等 |

## 数学公式

### 行内公式
爱因斯坦质能方程：$E = mc^2$

勾股定理：$a^2 + b^2 = c^2$

### 块级公式

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

$$
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

## Mermaid 图表

### 流程图
\`\`\`mermaid
graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[跳过]
    C --> E[结束]
    D --> E
\`\`\`

### 序列图
\`\`\`mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    participant 数据库
    
    用户->>前端: 发起请求
    前端->>后端: API 调用
    后端->>数据库: 查询数据
    数据库-->>后端: 返回结果
    后端-->>前端: 返回数据
    前端-->>用户: 显示结果
\`\`\`

### 饼图
\`\`\`mermaid
pie title 编程语言使用占比
    "JavaScript" : 35
    "Python" : 30
    "Java" : 20
    "Go" : 10
    "其他" : 5
\`\`\`

## 图片

![示例图片](https://via.placeholder.com/400x200?text=Markdown+Editor)

---

## 提示

- 内容会自动保存到浏览器本地存储
- 使用工具栏快速插入 Markdown 语法
- 支持上传本地图片（转为 Base64）
- 可以下载编辑的内容为 .md 文件
- 使用 \`[TOC]\` 自动生成文档目录
- 左右两侧滚动自动同步

**开始编辑你的文档吧！** 🚀
`;

function App() {
  const [markdown, setMarkdown] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const scrollSyncTimeoutRef = useRef(null);
  const isScrollingRef = useRef({ editor: false, preview: false });

  // 页面加载时恢复内容
  useEffect(() => {
    const saved = loadContent();
    setMarkdown(saved || defaultContent);
    setIsLoaded(true);
  }, []);

  // 自动保存（防抖 1 秒）
  useEffect(() => {
    if (!isLoaded) return; // 首次加载时不保存
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveContent(markdown);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [markdown, isLoaded]);

  // 编辑器滚动时同步预览
  const handleEditorScroll = useCallback((scrollPercentage) => {
    if (isScrollingRef.current.preview) return; // 如果预览正在滚动，不处理
    
    isScrollingRef.current.editor = true;
    
    if (scrollSyncTimeoutRef.current) {
      clearTimeout(scrollSyncTimeoutRef.current);
    }
    
    if (previewRef.current) {
      const { scrollHeight, clientHeight } = previewRef.current;
      const targetScrollTop = scrollPercentage * (scrollHeight - clientHeight);
      previewRef.current.scrollTop = targetScrollTop;
    }
    
    scrollSyncTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current.editor = false;
    }, 100);
  }, []);

  // 预览滚动时同步编辑器
  const handlePreviewScroll = useCallback((scrollPercentage) => {
    if (isScrollingRef.current.editor) return; // 如果编辑器正在滚动，不处理
    
    isScrollingRef.current.preview = true;
    
    if (scrollSyncTimeoutRef.current) {
      clearTimeout(scrollSyncTimeoutRef.current);
    }
    
    if (textareaRef.current) {
      const { scrollHeight, clientHeight } = textareaRef.current;
      const targetScrollTop = scrollPercentage * (scrollHeight - clientHeight);
      textareaRef.current.scrollTop = targetScrollTop;
    }
    
    scrollSyncTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current.preview = false;
    }, 100);
  }, []);

  // 插入文本到编辑器（在光标位置）
  const handleInsert = useCallback((text) => {
    if (!textareaRef.current) {
      // 如果没有 textarea 引用，则追加到末尾
      setMarkdown(prev => prev + text);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;

    setMarkdown(prev => {
      // 在光标位置插入文本（如果有选中内容则替换）
      const before = prev.substring(0, start);
      const after = prev.substring(end);
      return before + text + after;
    });

    // 在下一个事件循环中设置光标位置
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        
        if (hasSelection) {
          // 如果之前有选中内容，插入后保持相同长度的选中（用于包裹型格式如粗体、斜体）
          // 检查是否是包裹型格式（前后都有相同的标记）
          const isWrapping = text.includes('**') || text.includes('*') || 
                            text.includes('~~') || text.includes('[');
          
          if (isWrapping) {
            // 对于包裹型格式，将光标移到插入内容的中间位置
            // 例如：**text** 中的 text 之后
            const wrapLength = text.startsWith('**') ? 2 : 
                              text.startsWith('~~') ? 2 : 
                              text.startsWith('[') ? 1 : 1;
            const contentLength = text.length - wrapLength * 2;
            const newPosition = start + wrapLength + contentLength;
            textareaRef.current.setSelectionRange(newPosition, newPosition);
          } else {
            // 非包裹型格式，将光标移到插入内容之后
            const newPosition = start + text.length;
            textareaRef.current.setSelectionRange(newPosition, newPosition);
          }
        } else {
          // 如果之前没有选中内容，将光标移动到插入内容之后
          // 对于某些格式，可以智能定位（如标题、列表后面）
          const newPosition = start + text.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }
    }, 0);
  }, []);

  // 清空编辑器
  const handleClear = useCallback(() => {
    if (confirm('确定要清空所有内容吗？此操作无法撤销。')) {
      setMarkdown('');
      clearContent();
    }
  }, []);

  // 下载 Markdown 文件
  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `markdown-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [markdown]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Markdown 编辑器</h1>
        <p className="app-subtitle">支持实时预览、代码高亮、数学公式、Mermaid 图表</p>
      </header>
      
      <Toolbar
        onInsert={handleInsert}
        onClear={handleClear}
        onDownload={handleDownload}
        textareaRef={textareaRef}
      />

      <div className="app-content">
        <div className="editor-pane">
          <div className="pane-header">✏️ 编辑器</div>
          <Editor 
            value={markdown} 
            onChange={setMarkdown} 
            textareaRef={textareaRef}
            onScroll={handleEditorScroll}
          />
        </div>

        <div className="preview-pane">
          <div className="pane-header">👁️ 预览</div>
          <Preview 
            content={markdown} 
            previewRef={previewRef}
            onScroll={handlePreviewScroll}
          />
        </div>
      </div>

      <footer className="app-footer">
        <span>内容自动保存到本地存储</span>
        <span>字数: {markdown.length}</span>
      </footer>
    </div>
  );
}

export default App;
