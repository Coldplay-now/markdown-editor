const Editor = ({ value, onChange, textareaRef, onScroll }) => {

  const handleKeyDown = (e) => {
    // 支持 Tab 键缩进
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // 在下一个事件循环中设置光标位置
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleScroll = (e) => {
    if (onScroll) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      onScroll(scrollPercentage);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className="editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onScroll={handleScroll}
      placeholder="在此输入 Markdown 内容..."
      spellCheck="false"
    />
  );
};

export default Editor;

