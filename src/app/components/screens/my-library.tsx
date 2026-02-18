import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Filter, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { BottomTabBar } from '../bottom-tab-bar';
import { useUser } from '../../context/user-context';
import { api } from '../../lib/api';

interface SavedArticle {
  id: string;
  title: string;
  platform: string;
  topics: string[];
  savedAt: string;
}

export function MyLibrary() {
  const { userId } = useUser();
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    loadSavedArticles();
  }, [userId]);

  async function loadSavedArticles() {
    try {
      const data = await api.getSavedArticles(userId);
      setSavedArticles(data.articles);
    } catch (error) {
      console.error('Failed to load saved articles:', error);
    } finally {
      setLoading(false);
    }
  }

  // Extract unique topics from saved articles
  const topicCounts = savedArticles.reduce((acc, article) => {
    article.topics?.forEach((topic: string) => {
      acc[topic] = (acc[topic] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topicsList = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));

  // Filter articles by selected topic
  const filteredArticles = selectedTopic
    ? savedArticles.filter((a) => a.topics?.includes(selectedTopic))
    : savedArticles;

  const showReadingMap = savedArticles.length >= 10;
  const articlesNeeded = Math.max(0, 10 - savedArticles.length);

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-1">
              나의 서재
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {savedArticles.length}편 저장됨
            </p>
          </div>
          <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Reading Map or Milestone Progress */}
        {showReadingMap ? (
          <div className="bg-[var(--bg-surface)] rounded-xl p-6 mb-6">
            <h3 className="text-sm text-[var(--text-muted)] mb-4">읽기 지도</h3>
            <ReadingMapVisualization topics={topicsList} />
          </div>
        ) : (
          <div className="bg-[var(--bg-surface)] rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-[var(--text-muted)]">
                읽기 지도 잠금 해제까지
              </h3>
              <span className="text-sm text-[var(--text-primary)]">
                {savedArticles.length} / 10
              </span>
            </div>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < savedArticles.length
                      ? 'bg-[var(--accent-green)]'
                      : 'bg-[var(--bg-dark)]'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {articlesNeeded}편 더 모이면 읽기 지도가 열려요
            </p>
          </div>
        )}
      </header>

      {/* Topic Clusters */}
      {topicsList.length > 0 && (
        <div className="px-6 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedTopic(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedTopic === null
                  ? 'bg-[var(--accent-green)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
              }`}
            >
              전체
            </button>
            {topicsList.map(({ topic, count }) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic === selectedTopic ? null : topic)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedTopic === topic
                    ? 'bg-[var(--accent-green)] text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                }`}
              >
                {topic} · {count}편
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved Articles List */}
      <main className="px-6 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--bg-surface)] rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-[var(--bg-dark)] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[var(--bg-dark)] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-serif text-[var(--text-primary)] mb-2">
              {selectedTopic ? '이 주제의 글이 없어요' : '아직 저장한 글이 없어요'}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {selectedTopic ? '다른 주제를 선택해보세요' : '관심 있는 글을 저장해보세요'}
            </p>
          </div>
        ) : (
          <>
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/read/${article.id}`}
                  className="block bg-[var(--bg-surface)] rounded-xl p-4 hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <h3 className="text-base font-serif text-[var(--text-primary)] mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[var(--text-muted)]">
                        {article.platform}
                      </span>
                      {article.topics?.slice(0, 2).map((topic: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-[var(--bg-dark)] text-[var(--text-muted)] rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[var(--text-muted)]">
                      <MessageSquare className="w-3 h-3" />
                      <span className="text-xs">0</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-[var(--text-muted)]">
                    {new Date(article.savedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </Link>
              </motion.div>
            ))}
          </>
        )}
      </main>

      <BottomTabBar />
    </div>
  );
}

// Simple reading map visualization component
function ReadingMapVisualization({ topics }: { topics: { topic: string; count: number }[] }) {
  return (
    <div className="relative h-48 bg-[var(--bg-dark)] rounded-lg overflow-hidden">
      {/* Simplified node-based visualization */}
      <svg className="w-full h-full">
        {topics.slice(0, 8).map((topic, i) => {
          const angle = (i / topics.length) * 2 * Math.PI;
          const radius = 60 + (topic.count * 5);
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          const size = Math.min(20, 8 + topic.count * 2);

          return (
            <g key={topic.topic}>
              {/* Connection lines to center */}
              <line
                x1="50%"
                y1="50%"
                x2={`${x}%`}
                y2={`${y}%`}
                stroke="var(--text-muted)"
                strokeWidth="1"
                opacity="0.2"
              />
              {/* Topic node */}
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r={size}
                fill="var(--accent-green)"
                opacity="0.6"
              />
              <text
                x={`${x}%`}
                y={`${y}%`}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-[var(--text-primary)]"
                style={{ fontSize: '10px' }}
              >
                {topic.topic.slice(0, 4)}
              </text>
            </g>
          );
        })}
        {/* Center node */}
        <circle cx="50%" cy="50%" r="15" fill="var(--accent-green)" />
      </svg>

      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-xs text-[var(--text-muted)]">
          당신의 관심사는 {topics.length}개 주제로 연결되어 있어요
        </p>
      </div>
    </div>
  );
}
