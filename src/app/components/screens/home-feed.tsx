import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Bell, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { BottomTabBar } from '../bottom-tab-bar';
import { useUser } from '../../context/user-context';
import { api } from '../../lib/api';

interface Article {
  id: string;
  title: string;
  platform: string;
  platformIcon: string;
  topics: string[];
  readTime: number;
  thumbnail: string;
  author: string;
}

export function HomeFeed() {
  const { userId } = useUser();
  const [articles, setArticles] = useState<Article[]>([]);
  const [readingCount, setReadingCount] = useState(0);
  const [dailyLimit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFeed();
  }, [userId]);

  async function loadFeed() {
    try {
      const data = await api.getFeed(userId);
      setArticles(data.articles);
      setReadingCount(data.readingCount);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveArticle(article: Article, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (savedArticles.has(article.id)) {
        // Already saved, just toggle UI
        const newSaved = new Set(savedArticles);
        newSaved.delete(article.id);
        setSavedArticles(newSaved);
      } else {
        await api.saveArticle(article.id, userId, article);
        const newSaved = new Set(savedArticles);
        newSaved.add(article.id);
        setSavedArticles(newSaved);
      }
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '오늘의 읽기';
    return '좋은 저녁이에요';
  }

  const showEndMessage = readingCount >= dailyLimit;
  const visibleArticles = articles.slice(0, 7);

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-1">
              {getGreeting()}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              이 시간은 낭비가 아니다
            </p>
          </div>
          <button className="relative p-2">
            <Bell className="w-5 h-5 text-[var(--text-muted)]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent-green)] rounded-full"></span>
          </button>
        </div>

        {/* Daily Progress */}
        <div className="bg-[var(--bg-surface)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">
              오늘의 읽기
            </span>
            <span className="text-sm text-[var(--text-primary)]">
              {readingCount} / {dailyLimit}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--bg-dark)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--accent-green)]"
              initial={{ width: 0 }}
              animate={{ width: `${(readingCount / dailyLimit) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      {/* Article Feed */}
      <main className="px-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--bg-surface)] rounded-xl p-4 animate-pulse">
                <div className="h-32 bg-[var(--bg-dark)] rounded-lg mb-3"></div>
                <div className="h-4 bg-[var(--bg-dark)] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[var(--bg-dark)] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {visibleArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/read/${article.id}`}
                  className="block bg-[var(--bg-surface)] rounded-xl overflow-hidden hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <div className="p-4">
                    {/* Thumbnail */}
                    <div 
                      className="w-full h-32 rounded-lg mb-3 bg-cover bg-center"
                      style={{ backgroundImage: `url(${article.thumbnail})` }}
                    />

                    {/* Platform */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">{article.platformIcon}</span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {article.platform}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-serif text-[var(--text-primary)] mb-3 line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Tags and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.topics.slice(0, 2).map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-[var(--bg-dark)] text-[var(--text-muted)] rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                        <span className="text-xs text-[var(--text-muted)]">
                          {article.readTime}분
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleSaveArticle(article, e)}
                        className={`p-2 rounded-lg border transition-all ${
                          savedArticles.has(article.id)
                            ? 'border-[var(--accent-green)] bg-[var(--accent-green)]/10'
                            : 'border-[var(--border)] hover:border-[var(--accent-green)]'
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 transition-colors ${
                            savedArticles.has(article.id)
                              ? 'text-[var(--accent-green)] fill-[var(--accent-green)]'
                              : 'text-[var(--text-muted)]'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {showEndMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-lg font-serif text-[var(--text-primary)] mb-2">
                  내일 더 읽어보세요
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  오늘의 읽기 목표를 달성했습니다
                </p>
              </motion.div>
            )}
          </>
        )}
      </main>

      <BottomTabBar />
    </div>
  );
}
