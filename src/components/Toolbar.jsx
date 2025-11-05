import { useRef } from 'react';
import { 
  Heading1, Heading2, Heading3, Bold, Italic, Strikethrough,
  Link, Code, Quote, List, ListOrdered, CheckSquare,
  Table, Minus, Sigma, Network, FileText,
  Image, Upload, Copy, ClipboardPaste, Trash2, Download
} from 'lucide-react';

const Toolbar = ({ onInsert, onClear, onDownload, textareaRef }) => {
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查是否为图片文件
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件！');
      return;
    }

    // 读取图片并转换为 Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      const markdown = `![${file.name}](${base64})\n`;
      onInsert(markdown);
    };
    reader.readAsDataURL(file);
    
    // 重置 input
    e.target.value = '';
  };

  const handleImageUrl = () => {
    const url = prompt('请输入图片 URL:');
    if (url) {
      const alt = prompt('请输入图片描述（可选）:', '图片');
      onInsert(`![${alt}](${url})\n`);
    }
  };

  const handleCopy = async () => {
    if (textareaRef?.current) {
      const text = textareaRef.current.value;
      try {
        await navigator.clipboard.writeText(text);
        alert('内容已复制到剪贴板！');
      } catch (err) {
        alert('复制失败，请手动复制');
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onInsert(text);
      }
    } catch (err) {
      alert('粘贴失败，请检查浏览器权限');
    }
  };

  // 智能插入处理函数
  const handleSmartInsert = (type, prefix, suffix = '', defaultText = '') => {
    if (!textareaRef?.current) {
      onInsert(prefix + defaultText + suffix);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText) {
      // 如果有选中文本，包裹选中的文本
      onInsert(prefix + selectedText + suffix);
    } else {
      // 没有选中文本，插入默认文本
      onInsert(prefix + defaultText + suffix);
    }
  };

  const buttons = [
    { label: 'H1', icon: Heading1, action: () => onInsert('# '), title: '一级标题' },
    { label: 'H2', icon: Heading2, action: () => onInsert('## '), title: '二级标题' },
    { label: 'H3', icon: Heading3, action: () => onInsert('### '), title: '三级标题' },
    { label: '粗体', icon: Bold, action: () => handleSmartInsert('bold', '**', '**', '粗体文字'), title: '粗体' },
    { label: '斜体', icon: Italic, action: () => handleSmartInsert('italic', '*', '*', '斜体文字'), title: '斜体' },
    { label: '删除线', icon: Strikethrough, action: () => handleSmartInsert('strikethrough', '~~', '~~', '删除文字'), title: '删除线' },
    { label: '链接', icon: Link, action: () => handleSmartInsert('link', '[', '](https://example.com)', '链接文字'), title: '插入链接' },
    { label: '代码', icon: Code, action: () => onInsert('```javascript\n// 代码\n```\n'), title: '代码块' },
    { label: '引用', icon: Quote, action: () => onInsert('> '), title: '引用' },
    { label: '列表', icon: List, action: () => onInsert('- '), title: '无序列表' },
    { label: '有序', icon: ListOrdered, action: () => onInsert('1. '), title: '有序列表' },
    { label: '任务', icon: CheckSquare, action: () => onInsert('- [ ] '), title: '任务列表' },
    { label: '表格', icon: Table, action: () => onInsert('| 列1 | 列2 |\n|------|------|\n| 内容 | 内容 |\n'), title: '插入表格' },
    { label: '分割线', icon: Minus, action: () => onInsert('\n---\n'), title: '分割线' },
    { label: '公式', icon: Sigma, action: () => onInsert('$$\n\\frac{1}{2}\n$$\n'), title: '数学公式' },
    { label: 'Mermaid', icon: Network, action: () => onInsert('```mermaid\ngraph TD\n  A[开始] --> B[结束]\n```\n'), title: 'Mermaid 图表' },
    { label: 'TOC', icon: FileText, action: () => onInsert('[TOC]\n\n'), title: '插入目录' },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        {buttons.map((btn, index) => {
          const IconComponent = btn.icon;
          return (
            <button
              key={index}
              className="toolbar-btn toolbar-btn-icon"
              onClick={btn.action}
              title={btn.title}
            >
              <IconComponent size={18} />
            </button>
          );
        })}
      </div>
      
      <div className="toolbar-group">
        <button
          className="toolbar-btn toolbar-btn-icon"
          onClick={handleImageUrl}
          title="插入图片 URL"
        >
          <Image size={18} />
        </button>
        <button
          className="toolbar-btn toolbar-btn-icon"
          onClick={() => fileInputRef.current?.click()}
          title="上传图片"
        >
          <Upload size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div className="toolbar-group">
        <button
          className="toolbar-btn toolbar-btn-icon"
          onClick={handleCopy}
          title="复制全部内容"
        >
          <Copy size={18} />
        </button>
        <button
          className="toolbar-btn toolbar-btn-icon"
          onClick={handlePaste}
          title="粘贴内容"
        >
          <ClipboardPaste size={18} />
        </button>
      </div>

      <div className="toolbar-group">
        <button
          className="toolbar-btn toolbar-btn-icon toolbar-btn-danger"
          onClick={onClear}
          title="清空编辑器"
        >
          <Trash2 size={18} />
        </button>
        <button
          className="toolbar-btn toolbar-btn-icon toolbar-btn-primary"
          onClick={onDownload}
          title="下载 Markdown"
        >
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

