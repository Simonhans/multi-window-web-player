// 接收面板上报的内容高度，让外层容器跟着内容伸展，避免出现嵌套滚动条。
// 注意：MV3 的 CSP 是 script-src 'self'，逻辑必须放在外部文件里，不能写成内联 script。
const frame = document.querySelector('iframe');

window.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'player-dashboard-resize') return;
  const height = Number(event.data.height);
  if (Number.isFinite(height) && height > 200) frame.style.height = Math.ceil(height) + 'px';
});
