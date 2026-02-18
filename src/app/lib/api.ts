import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c5661566`;

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API call failed: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Articles
  getFeed: (userId: string) =>
    apiCall<{ articles: any[]; readingCount: number; dailyLimit: number }>(
      `/articles/feed?userId=${userId}`
    ),

  saveArticle: (articleId: string, userId: string, article: any) =>
    apiCall('/articles/save', {
      method: 'POST',
      body: JSON.stringify({ articleId, userId, article }),
    }),

  getSavedArticles: (userId: string) =>
    apiCall<{ articles: any[] }>(`/articles/saved?userId=${userId}`),

  // Highlights
  addHighlight: (articleId: string, userId: string, highlight: any) =>
    apiCall('/highlights/add', {
      method: 'POST',
      body: JSON.stringify({ articleId, userId, highlight }),
    }),

  getHighlights: (articleId: string, userId: string) =>
    apiCall<{ highlights: any[] }>(`/highlights/${articleId}?userId=${userId}`),

  // Reading progress
  incrementReading: (userId: string) =>
    apiCall<{ readingCount: number; dailyLimit: number }>('/reading/increment', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Profile
  getProfile: (userId: string) =>
    apiCall<any>(`/profile/${userId}`),
};
