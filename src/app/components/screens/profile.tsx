import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Share2, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { BottomTabBar } from '../bottom-tab-bar';
import { useUser } from '../../context/user-context';
import { api } from '../../lib/api';

interface ProfileData {
  userId: string;
  displayName: string;
  bio: string;
  avatar: string | null;
  joinedAt: string;
  stats: {
    savedArticles: number;
    totalHighlights: number;
  };
}

export function Profile() {
  const params = useParams();
  const { userId: currentUserId } = useUser();
  const userId = params.userId || currentUserId;
  const isOwnProfile = userId === currentUserId;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    try {
      const data = await api.getProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }

  // Mock data for topic breakdown
  const topicBreakdown = [
    { topic: '디자인 철학', percentage: 35 },
    { topic: '인지심리', percentage: 28 },
    { topic: 'UX 리서치', percentage: 18 },
    { topic: '시스템 사고', percentage: 12 },
    { topic: '글쓰기', percentage: 7 },
  ];

  const recentHighlights = [
    {
      id: 1,
      text: '진정한 이해와 통찰은 느린 사고에서 나옵니다.',
      source: '느린 사고가 만드는 깊이',
      platform: 'Brunch'
    },
    {
      id: 2,
      text: '의도적인 읽기란 저자의 논리를 따라가고, 질문을 던지는 것',
      source: '주의력의 경제학',
      platform: 'Medium'
    },
  ];

  const getTenure = (joinedAt: string) => {
    const joined = new Date(joinedAt);
    const now = new Date();
    const months = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return months;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
        <div className="text-[var(--text-muted)]">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif text-[var(--text-primary)]">
            프로필
          </h1>
          {isOwnProfile && (
            <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-[var(--bg-surface)] rounded-xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-green)] flex items-center justify-center text-2xl font-serif text-white">
              {profile.displayName[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-1">
                {profile.displayName}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-2">
                {profile.bio}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Brainmate {getTenure(profile.joinedAt)}개월째
              </p>
            </div>
          </div>

          {!isOwnProfile && (
            <button className="w-full py-2 px-4 bg-[var(--accent-green)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-green-hover)] transition-colors">
              비슷하게 읽는 사람이에요
            </button>
          )}
        </div>

        {/* Reading Stats */}
        <div className="bg-[var(--bg-surface)] rounded-xl p-6">
          <h3 className="text-sm text-[var(--text-muted)] mb-4">읽기 통계</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-serif text-[var(--text-primary)] mb-1">
                {profile.stats.savedArticles}
              </div>
              <div className="text-xs text-[var(--text-muted)]">저장한 글</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-[var(--text-primary)] mb-1">
                {profile.stats.totalHighlights}
              </div>
              <div className="text-xs text-[var(--text-muted)]">하이라이트</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-[var(--text-primary)] mb-1">
                {Math.floor(profile.stats.savedArticles * 8.5)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">평균 읽기/주</div>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        {profile.stats.savedArticles > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-6">
            <h3 className="text-sm text-[var(--text-muted)] mb-4">주제 분포</h3>
            <div className="space-y-3">
              {topicBreakdown.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--text-primary)]">
                      {item.topic}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--bg-dark)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--accent-green)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Wrapped Card */}
        <div className="bg-gradient-to-br from-[#2A3D2E] to-[var(--bg-dark)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-[var(--text-primary)]">이번 달의 읽기</h3>
            <button className="p-2 text-[var(--text-primary)]">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-[var(--text-muted)] mb-1">
                가장 많이 읽은 주제
              </div>
              <div className="text-lg font-serif text-[var(--text-primary)]">
                디자인 철학
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--text-muted)] mb-1">
                가장 많이 하이라이트한 글
              </div>
              <div className="text-lg font-serif text-[var(--text-primary)]">
                느린 사고가 만드는 깊이
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--text-muted)] mb-1">
                읽기 연속 기록
              </div>
              <div className="text-lg font-serif text-[var(--text-primary)]">
                7일
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 px-4 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
            스토리로 공유하기
          </button>
        </div>

        {/* Recent Highlights */}
        <div className="bg-[var(--bg-surface)] rounded-xl p-6">
          <h3 className="text-sm text-[var(--text-muted)] mb-4">최근 하이라이트</h3>
          <div className="space-y-4">
            {recentHighlights.map((highlight) => (
              <div
                key={highlight.id}
                className="border-l-4 border-[var(--accent-green)] pl-4 py-2"
              >
                <p className="text-sm text-[var(--text-primary)] italic mb-2">
                  "{highlight.text}"
                </p>
                <div className="text-xs text-[var(--text-muted)]">
                  {highlight.source} · {highlight.platform}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Social Indicators */}
        {!isOwnProfile && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">
                  이 글을 함께 읽은 사람
                </span>
                <span className="text-sm text-[var(--text-primary)]">12명</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">
                  관심사 겹침 깊이
                </span>
                <span className="text-sm text-[var(--accent-green)]">72%</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {isOwnProfile && <BottomTabBar />}
    </div>
  );
}
