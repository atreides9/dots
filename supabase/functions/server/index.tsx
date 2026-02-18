import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c5661566/health", (c) => {
  return c.json({ status: "ok" });
});

// Get curated article feed
app.get("/make-server-c5661566/articles/feed", async (c) => {
  try {
    const userId = c.req.query("userId") || "default";
    const todayKey = `articles:feed:${new Date().toISOString().split('T')[0]}`;
    
    // Check if today's feed is cached
    let feed = await kv.get(todayKey);
    
    if (!feed) {
      // Generate fresh feed with sample articles
      feed = generateDailyFeed();
      await kv.set(todayKey, feed);
    }
    
    // Get user's reading count for today
    const readingKey = `user:${userId}:reading:${new Date().toISOString().split('T')[0]}`;
    const readingCount = await kv.get(readingKey) || 0;
    
    return c.json({ 
      articles: feed,
      readingCount,
      dailyLimit: 5
    });
  } catch (error) {
    console.log(`Error fetching feed: ${error}`);
    return c.json({ error: "Failed to fetch feed" }, 500);
  }
});

// Save/bookmark an article
app.post("/make-server-c5661566/articles/save", async (c) => {
  try {
    const body = await c.req.json();
    const { articleId, userId, article } = body;
    
    if (!articleId || !userId) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const saveKey = `user:${userId}:saved:${articleId}`;
    await kv.set(saveKey, {
      ...article,
      savedAt: new Date().toISOString()
    });
    
    // Update saved articles list
    const savedListKey = `user:${userId}:saved:list`;
    let savedList = await kv.get(savedListKey) || [];
    if (!savedList.includes(articleId)) {
      savedList = [articleId, ...savedList];
      await kv.set(savedListKey, savedList);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving article: ${error}`);
    return c.json({ error: "Failed to save article" }, 500);
  }
});

// Get user's saved articles
app.get("/make-server-c5661566/articles/saved", async (c) => {
  try {
    const userId = c.req.query("userId") || "default";
    const savedListKey = `user:${userId}:saved:list`;
    const savedList = await kv.get(savedListKey) || [];
    
    // Fetch all saved articles
    const articles = [];
    for (const articleId of savedList) {
      const saveKey = `user:${userId}:saved:${articleId}`;
      const article = await kv.get(saveKey);
      if (article) {
        articles.push(article);
      }
    }
    
    return c.json({ articles });
  } catch (error) {
    console.log(`Error fetching saved articles: ${error}`);
    return c.json({ error: "Failed to fetch saved articles" }, 500);
  }
});

// Add/update highlight
app.post("/make-server-c5661566/highlights/add", async (c) => {
  try {
    const body = await c.req.json();
    const { articleId, userId, highlight } = body;
    
    if (!articleId || !userId || !highlight) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const highlightKey = `user:${userId}:article:${articleId}:highlights`;
    let highlights = await kv.get(highlightKey) || [];
    
    highlights = [{
      id: `highlight-${Date.now()}`,
      ...highlight,
      createdAt: new Date().toISOString()
    }, ...highlights];
    
    await kv.set(highlightKey, highlights);
    
    return c.json({ success: true, highlights });
  } catch (error) {
    console.log(`Error adding highlight: ${error}`);
    return c.json({ error: "Failed to add highlight" }, 500);
  }
});

// Get article highlights
app.get("/make-server-c5661566/highlights/:articleId", async (c) => {
  try {
    const articleId = c.req.param("articleId");
    const userId = c.req.query("userId") || "default";
    
    const highlightKey = `user:${userId}:article:${articleId}:highlights`;
    const highlights = await kv.get(highlightKey) || [];
    
    return c.json({ highlights });
  } catch (error) {
    console.log(`Error fetching highlights: ${error}`);
    return c.json({ error: "Failed to fetch highlights" }, 500);
  }
});

// Increment reading count
app.post("/make-server-c5661566/reading/increment", async (c) => {
  try {
    const body = await c.req.json();
    const { userId } = body;
    
    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }
    
    const readingKey = `user:${userId}:reading:${new Date().toISOString().split('T')[0]}`;
    const currentCount = await kv.get(readingKey) || 0;
    const newCount = currentCount + 1;
    
    await kv.set(readingKey, newCount);
    
    return c.json({ readingCount: newCount, dailyLimit: 5 });
  } catch (error) {
    console.log(`Error incrementing reading count: ${error}`);
    return c.json({ error: "Failed to increment reading count" }, 500);
  }
});

// Get user profile/stats
app.get("/make-server-c5661566/profile/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    const profileKey = `user:${userId}:profile`;
    let profile = await kv.get(profileKey);
    
    if (!profile) {
      // Create default profile
      profile = {
        userId,
        displayName: "Reader",
        bio: "독서를 사랑하는 사람",
        avatar: null,
        joinedAt: new Date().toISOString()
      };
      await kv.set(profileKey, profile);
    }
    
    // Get stats
    const savedListKey = `user:${userId}:saved:list`;
    const savedList = await kv.get(savedListKey) || [];
    
    // Count total highlights
    let totalHighlights = 0;
    for (const articleId of savedList) {
      const highlightKey = `user:${userId}:article:${articleId}:highlights`;
      const highlights = await kv.get(highlightKey) || [];
      totalHighlights += highlights.length;
    }
    
    return c.json({
      ...profile,
      stats: {
        savedArticles: savedList.length,
        totalHighlights
      }
    });
  } catch (error) {
    console.log(`Error fetching profile: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Helper function to generate daily feed
function generateDailyFeed() {
  const platforms = ['Brunch', 'Medium', 'Velog', '브런치', 'ㅍㅍㅅㅅ'];
  const topics = [
    '디자인 철학', '인지심리', 'UX 리서치', '제품 사고',
    '창의성', '시스템 사고', '행동경제학', '글쓰기',
    '비판적 사고', '학습 이론'
  ];
  
  const sampleTitles = [
    '느린 사고가 만드는 깊이 있는 디자인',
    '주의력의 경제학: 디지털 시대의 집중력',
    '좋은 질문이 좋은 답보다 중요한 이유',
    '시스템 1과 시스템 2 사이에서',
    '창의성은 제약에서 시작된다',
    '읽기와 쓰기, 그리고 생각하기',
    '인지 부하를 줄이는 인터페이스 디자인'
  ];
  
  const thumbnails = [
    'https://images.unsplash.com/photo-1546098073-4d874a1c59f8?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1639414839192-0562f4065ffd?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1763531414423-7c9e3642910e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1729105140273-b5e886a4f999?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1656877280226-ebf9ea8b1303?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=400&h=300&fit=crop'
  ];
  
  return Array.from({ length: 7 }, (_, i) => ({
    id: `article-${Date.now()}-${i}`,
    title: sampleTitles[i % sampleTitles.length],
    platform: platforms[i % platforms.length],
    platformIcon: '📚',
    topics: [
      topics[Math.floor(Math.random() * topics.length)],
      topics[Math.floor(Math.random() * topics.length)]
    ],
    readTime: Math.floor(Math.random() * 10) + 5,
    thumbnail: thumbnails[i % thumbnails.length],
    author: '익명',
    excerpt: '이 글은 깊이 있는 사고와 의도적인 읽기에 대한 탐구입니다...',
    content: generateSampleContent()
  }));
}

function generateSampleContent() {
  return `# 느린 사고의 가치

디지털 시대에 우리는 끊임없이 빠른 정보 소비를 강요받습니다. 그러나 진정한 이해와 통찰은 느린 사고에서 나옵니다.

## 시스템 1과 시스템 2

대니얼 카너먼이 말한 두 가지 사고 시스템을 떠올려봅시다. 시스템 1은 빠르고 직관적이며, 시스템 2는 느리고 의도적입니다.

깊이 있는 학습과 창의적 사고는 시스템 2의 영역입니다. 우리가 글을 읽을 때, 특히 어려운 개념을 다룰 때, 우리는 시스템 2를 활성화해야 합니다.

## 의도적인 읽기

의도적인 읽기란 무엇일까요? 그것은 단순히 글자를 눈으로 따라가는 것이 아니라, 저자의 논리를 따라가고, 질문을 던지고, 자신의 경험과 연결하는 능동적인 과정입니다.

이러한 읽기는 시간이 걸립니다. 그러나 그 시간은 낭비가 아닙니다. 오히려 가장 가치 있는 투자입니다.

## 결론

빠른 정보 소비의 시대에, 느린 사고와 의도적인 읽기는 우리의 피난처입니다. 이것이 바로 독서의 성소가 필요한 이유입니다.`;
}

Deno.serve(app.fetch);