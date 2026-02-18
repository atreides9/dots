import { useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { BottomTabBar } from '../bottom-tab-bar';

interface Connection {
  userId: string;
  displayName: string;
  avatar: string | null;
  sharedTopics: string[];
  overlapPercentage: number;
  lastReadInCommon: string;
}

interface ArticleReaders {
  articleTitle: string;
  readerCount: number;
}

export function Connections() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock connections data
  const connections: Connection[] = [
    {
      userId: 'user-1',
      displayName: '사려깊은독자',
      avatar: null,
      sharedTopics: ['디자인 철학', '인지심리', 'UX 리서치'],
      overlapPercentage: 78,
      lastReadInCommon: '느린 사고가 만드는 깊이',
    },
    {
      userId: 'user-2',
      displayName: '생각하는사람',
      avatar: null,
      sharedTopics: ['시스템 사고', '비판적 사고'],
      overlapPercentage: 65,
      lastReadInCommon: '주의력의 경제학',
    },
    {
      userId: 'user-3',
      displayName: '조용한탐구자',
      avatar: null,
      sharedTopics: ['글쓰기', '창의성', '학습 이론'],
      overlapPercentage: 58,
      lastReadInCommon: '창의성은 제약에서 시작된다',
    },
  ];

  const articleReaders: ArticleReaders[] = [
    {
      articleTitle: '느린 사고가 만드는 깊이 있는 디자인',
      readerCount: 23,
    },
    {
      articleTitle: '주의력의 경제학: 디지털 시대의 집중력',
      readerCount: 18,
    },
  ];

  const suggestedConnections: Connection[] = [
    {
      userId: 'user-4',
      displayName: '심층독서가',
      avatar: null,
      sharedTopics: ['디자인 철학', '행동경제학'],
      overlapPercentage: 72,
      lastReadInCommon: '',
    },
    {
      userId: 'user-5',
      displayName: '의미찾기',
      avatar: null,
      sharedTopics: ['인지심리', '학습 이론'],
      overlapPercentage: 68,
      lastReadInCommon: '',
    },
  ];

  const filteredConnections = connections.filter((c) =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-1">
            연결
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            비슷하게 읽는 사람들과의 조용한 연결
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="이름으로 찾기"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--accent-green)] transition-colors"
          />
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* My Connections */}
        {filteredConnections.length > 0 && (
          <section>
            <h2 className="text-sm text-[var(--text-muted)] mb-4">
              내 연결 ({connections.length})
            </h2>
            <div className="space-y-3">
              {filteredConnections.map((connection, index) => (
                <motion.div
                  key={connection.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/profile/${connection.userId}`}
                    className="block bg-[var(--bg-surface)] rounded-xl p-4 hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent-green)] flex items-center justify-center text-lg font-serif text-white flex-shrink-0">
                        {connection.displayName[0]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base text-[var(--text-primary)] mb-1">
                          {connection.displayName}
                        </h3>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {connection.sharedTopics.slice(0, 3).map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-[var(--bg-dark)] text-[var(--text-muted)] rounded-full"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-[var(--accent-green)]">
                            관심사 겹침 {connection.overlapPercentage}%
                          </span>
                          {connection.lastReadInCommon && (
                            <span className="text-[var(--text-muted)]">
                              · {connection.lastReadInCommon}
                            </span>
                          )}
                        </div>
                      </div>

                      <button className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0">
                        프로필
                      </button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Same Article Readers */}
        <section>
          <h2 className="text-sm text-[var(--text-muted)] mb-4">
            같은 글을 읽은 사람들
          </h2>
          <div className="space-y-3">
            {articleReaders.map((item, index) => (
              <div
                key={index}
                className="bg-[var(--bg-surface)] rounded-xl p-4"
              >
                <h3 className="text-sm text-[var(--text-primary)] mb-3 line-clamp-1">
                  {item.articleTitle}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(5, item.readerCount) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-[var(--accent-green)] border-2 border-[var(--bg-surface)] opacity-80"
                          style={{ opacity: 1 - i * 0.15 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      이 글을 읽은 사람 {item.readerCount}명
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Suggested Connections */}
        <section>
          <h2 className="text-sm text-[var(--text-muted)] mb-4">
            당신과 비슷하게 읽는 사람들
          </h2>
          <div className="space-y-3">
            {suggestedConnections.map((connection, index) => (
              <motion.div
                key={connection.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/profile/${connection.userId}`}
                  className="block bg-[var(--bg-surface)] rounded-xl p-4 hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-green)] to-[#6B8E76] flex items-center justify-center text-lg font-serif text-white flex-shrink-0">
                      {connection.displayName[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base text-[var(--text-primary)] mb-1">
                        {connection.displayName}
                      </h3>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {connection.sharedTopics.slice(0, 3).map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs bg-[var(--bg-dark)] text-[var(--text-muted)] rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>

                      <div className="text-xs text-[var(--accent-green)]">
                        관심사 겹침 {connection.overlapPercentage}%
                      </div>
                    </div>

                    <button className="text-sm text-[var(--accent-green)] hover:text-[var(--accent-green-hover)] flex-shrink-0">
                      보기
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              더 많이 읽을수록 비슷한 사람들을 만나게 돼요
            </p>
          </div>
        </section>
      </main>

      <BottomTabBar />
    </div>
  );
}
