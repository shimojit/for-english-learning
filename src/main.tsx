import htmx from 'htmx.org';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

// CMS content is text; htmx fragments never need scripts or evaluated expressions.
htmx.config.allowScriptTags = false;
htmx.config.allowEval = false;
function showError() {
  const target = document.getElementById('lesson-list');
  if (target) target.textContent = '教材を取得できませんでした。「再読み込み」でやり直してください。';
}
document.body.addEventListener('htmx:responseError', showError);
document.body.addEventListener('htmx:sendError', showError);

function PracticeCard() {
  const [revealed, setRevealed] = useState(false);
  return <div className="practice"><p className="eyebrow">TODAY’S WORD</p><p className="word" lang="en">book</p><p aria-live="polite">{revealed ? '本 — b の音を意識して読んでみよう。' : 'どんな意味か、考えてみよう。'}</p><button onClick={() => setRevealed(!revealed)} aria-expanded={revealed}>{revealed ? '答えを隠す' : '意味を見る'}</button></div>;
}
const root = document.getElementById('practice-card');
if (root) createRoot(root).render(<PracticeCard />);
