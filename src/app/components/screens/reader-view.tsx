import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Share2, MoreVertical, Bookmark, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../../context/user-context';
import { api } from '../../lib/api';

export function ReaderView() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { userId } = useUser();
  const [article, setArticle] = useState<any>(null);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [showTopBar, setShowTopBar] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingMode, setReadingMode] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    loadArticleAndHighlights();
    incrementReadingCount();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Calculate reading progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const progress = (currentScrollY / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));

      // Show/hide top bar based on scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowTopBar(false);
      } else {
        setShowTopBar(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articleId, userId]);

  async function loadArticleAndHighlights() {
    try {
      // In a real app, we'd fetch the specific article
      // For now, we'll use sample data
      setArticle({
        id: articleId,
        title: '느린 사고가 만드는 깊이 있는 디자인',
        author: '익명',
        platform: 'Brunch',
        platformIcon: '📚',
        date: '2026.02.15',
        content: `디지털 시대에 우리는 끊임없이 빠른 정보 소비를 강요받습니다. 그러나 진정한 이해와 통찰은 느린 사고에서 나옵니다.

시스템 1과 시스템 2

대니얼 카너먼이 말한 두 가지 사고 시스템을 떠올려봅시다. 시스템 1은 빠르고 직관적이며, 시스템 2는 느리고 의도적입니다.

깊이 있는 학습과 창의적 사고는 시스템 2의 영역입니다. 우리가 글을 읽을 때, 특히 어려운 개념을 다룰 때, 우리는 시스템 2를 활성화해야 합니다.

의도적인 읽기란 무엇일까요?

그것은 단순히 글자를 눈으로 따라가는 것이 아니라, 저자의 논리를 따라가고, 질문을 던지고, 자신의 경험과 연결하는 능동적인 과정입니다.

이러한 읽기는 시간이 걸립니다. 그러나 그 시간은 낭비가 아닙니다. 오히려 가장 가치 있는 투자입니다.

빠른 정보 소비의 시대에, 느린 사고와 의도적인 읽기는 우리의 피난처입니다. 이것이 바로 독서의 성소가 필요한 이유입니다.

창의성은 종종 여유 공간에서 발생합니다. 우리가 끊임없이 새로운 정보를 소비할 때, 우리의 마음은 그것을 처리하고 연결할 시간이 없습니다.

느린 읽기는 단순히 천천히 읽는 것이 아닙니다. 그것은 의도를 가지고 읽는 것, 질문을 하며 읽는 것, 그리고 무엇보다도 생각하며 읽는 것입니다.`,
        readTime: 8
      });

      const highlightsData = await api.getHighlights(articleId!, userId);
      setHighlights(highlightsData.highlights);
    } catch (error) {
      console.error('Failed to load article:', error);
    }
  }

  async function incrementReadingCount() {
    try {
      await api.incrementReading(userId);
    } catch (error) {
      console.error('Failed to increment reading count:', error);
    }
  }

  async function handleAddHighlight(color: string) {
    if (!selectedText) return;

    try {
      const highlight = {
        text: selectedText,
        color,
      };

      await api.addHighlight(articleId!, userId, highlight);
      await loadArticleAndHighlights();
      setShowHighlightMenu(false);
      setSelectedText('');
    } catch (error) {
      console.error('Failed to add highlight:', error);
    }
  }

  const modeStyles = {
    dark: {
      bg: 'bg-[#1E1B17]',
      text: 'text-[#D9D3C7]',
    },
    sepia: {
      bg: 'bg-[#F5F0E6]',
      text: 'text-[#3A3530]',
    },
    light: {
      bg: 'bg-white',
      text: 'text-[#1A1714]',
    },
  };

  const currentMode = modeStyles[readingMode];

  if (!article) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentMode.bg} transition-colors duration-300`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-black/10 z-50">
        <motion.div
          className="h-full bg-[var(--accent-green)]"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Top Bar */}
      <AnimatePresence>
        {showTopBar && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className={`fixed top-0 left-0 right-0 ${currentMode.bg} border-b border-black/10 z-40`}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => navigate('/')}
                className={`p-2 -ml-2 ${currentMode.text}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setReadingMode('dark')}
                  className={`px-3 py-1 rounded text-xs ${
                    readingMode === 'dark'
                      ? 'bg-[var(--accent-green)] text-white'
                      : `${currentMode.text} opacity-50`
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setReadingMode('sepia')}
                  className={`px-3 py-1 rounded text-xs ${
                    readingMode === 'sepia'
                      ? 'bg-[var(--accent-green)] text-white'
                      : `${currentMode.text} opacity-50`
                  }`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => setReadingMode('light')}
                  className={`px-3 py-1 rounded text-xs ${
                    readingMode === 'light'
                      ? 'bg-[var(--accent-green)] text-white'
                      : `${currentMode.text} opacity-50`
                  }`}
                >
                  Light
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className={`p-2 ${currentMode.text}`}>
                  <Share2 className="w-5 h-5" />
                </button>
                <button className={`p-2 ${currentMode.text}`}>
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Article Content */}
      <main className="max-w-2xl mx-auto px-6 pt-24 pb-32">
        {/* Source Attribution */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">{article.platformIcon}</span>
          <a
            href="#"
            className={`text-sm ${currentMode.text} opacity-70 hover:opacity-100 flex items-center gap-1`}
          >
            {article.platform} 원문 보기
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Article Header */}
        <h1 className={`text-3xl font-serif font-bold ${currentMode.text} mb-4 leading-tight`}>
          {article.title}
        </h1>

        <div className={`text-sm ${currentMode.text} opacity-60 mb-8`}>
          {article.author} · {article.platform} · {article.date}
        </div>

        {/* Article Body */}
        <div
          ref={contentRef}
          className={`prose prose-lg ${currentMode.text}`}
          style={{
            fontSize: '17px',
            lineHeight: '1.75',
            letterSpacing: '0.01em',
          }}
          onMouseUp={() => {
            const selection = window.getSelection();
            const text = selection?.toString().trim();
            if (text && text.length > 0) {
              setSelectedText(text);
              setShowHighlightMenu(true);
            }
          }}
        >
          {article.content.split('\n\n').map((paragraph: string, i: number) => (
            <p key={i} className="mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Highlights Section */}
        {highlights.length > 0 && (
          <div className="mt-12 pt-8 border-t border-black/10">
            <h3 className={`text-lg font-serif ${currentMode.text} mb-4`}>
              내 하이라이트 ({highlights.length})
            </h3>
            <div className="space-y-4">
              {highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className={`p-4 rounded-lg border-l-4`}
                  style={{
                    borderColor: highlight.color === 'yellow' ? '#FCD34D' : 
                                 highlight.color === 'green' ? '#4A7C59' : '#60A5FA',
                    backgroundColor: `${highlight.color === 'yellow' ? '#FCD34D' : 
                                      highlight.color === 'green' ? '#4A7C59' : '#60A5FA'}10`,
                  }}
                >
                  <p className={`${currentMode.text} italic`}>"{highlight.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Highlight Menu */}
      <AnimatePresence>
        {showHighlightMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[var(--bg-surface)] rounded-xl shadow-2xl p-4 flex items-center gap-3 z-50"
          >
            <button
              onClick={() => handleAddHighlight('yellow')}
              className="w-10 h-10 rounded-full bg-yellow-300 hover:bg-yellow-400 transition-colors"
              title="Yellow highlight"
            />
            <button
              onClick={() => handleAddHighlight('green')}
              className="w-10 h-10 rounded-full bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] transition-colors"
              title="Green highlight"
            />
            <button
              onClick={() => handleAddHighlight('blue')}
              className="w-10 h-10 rounded-full bg-blue-400 hover:bg-blue-500 transition-colors"
              title="Blue highlight"
            />
            <div className="w-px h-8 bg-[var(--border)]" />
            <button
              onClick={() => {
                setShowHighlightMenu(false);
                setSelectedText('');
              }}
              className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              취소
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border)] z-40">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">{highlights.length}</span>
            </button>
            <button className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            {Math.ceil((100 - readingProgress) * article.readTime / 100)}분 남음
          </div>
        </div>
      </div>
    </div>
  );
}
