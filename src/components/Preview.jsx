import { useEffect, useRef, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';

// 初始化 Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

// 提取标题生成目录
const extractHeadings = (content) => {
  const headings = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      // 生成 ID（去除特殊字符，转为小写，空格替换为连字符）
      const id = text
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
        .replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }
  }
  
  return headings;
};

// TOC 组件
const TableOfContents = ({ headings }) => {
  if (headings.length === 0) return null;
  
  return (
    <div className="toc-container">
      <div className="toc-title">📑 目录</div>
      <nav className="toc-nav">
        {headings.map((heading, index) => (
          <a
            key={index}
            href={`#${heading.id}`}
            className={`toc-link toc-level-${heading.level}`}
            style={{ paddingLeft: `${(heading.level - 1) * 1}em` }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
};

// Mermaid 图表组件
const MermaidChart = ({ chart }) => {
  const ref = useRef(null);
  const [svg, setSvg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart || !ref.current) return;
      
      try {
        setError(null);
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err.message);
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="mermaid-error">
        <pre>Mermaid 渲染错误: {error}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className="mermaid-container"
      dangerouslySetInnerHTML={{ __html: svg || '' }}
    />
  );
};

const Preview = ({ content, previewRef, onScroll }) => {
  const handleScroll = (e) => {
    if (onScroll) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      onScroll(scrollPercentage);
    }
  };

  // 提取标题并处理 [TOC]
  const { processedContent, headings, hasTOC } = useMemo(() => {
    const headings = extractHeadings(content);
    const hasTOC = content.includes('[TOC]');
    // 移除 [TOC] 标记，因为我们会用自定义组件替换
    const processedContent = content.replace(/\[TOC\]/g, '');
    return { processedContent, headings, hasTOC };
  }, [content]);

  return (
    <div className="preview" ref={previewRef} onScroll={handleScroll}>
      {hasTOC && <TableOfContents headings={headings} />}
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 为标题添加 ID，使 TOC 链接可以跳转
          h1: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
              .replace(/\s+/g, '-');
            return <h1 id={id} {...props}>{children}</h1>;
          },
          h2: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
              .replace(/\s+/g, '-');
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
              .replace(/\s+/g, '-');
            return <h3 id={id} {...props}>{children}</h3>;
          },
          h4: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
              .replace(/\s+/g, '-');
            return <h4 id={id} {...props}>{children}</h4>;
          },
          h5: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
              .replace(/\s+/g, '-');
            return <h5 id={id} {...props}>{children}</h5>;
          },
          h6: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
              .replace(/\s+/g, '-');
            return <h6 id={id} {...props}>{children}</h6>;
          },
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');

            // Mermaid 图表
            if (language === 'mermaid') {
              return <MermaidChart chart={codeContent} />;
            }

            // 代码高亮
            if (!inline && language) {
              return (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={language}
                  PreTag="div"
                  {...props}
                >
                  {codeContent}
                </SyntaxHighlighter>
              );
            }

            // 行内代码
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // 图片渲染
          img({ node, ...props }) {
            return (
              <img
                {...props}
                style={{ maxWidth: '100%', height: 'auto' }}
                loading="lazy"
                alt={props.alt || ''}
              />
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default Preview;

