# API Flow Diagram - Phase 1

## How Web Scraping Works

```
1. User Request
   ↓
2. Browser Automation (Puppeteer)
   ↓
3. Navigate to Website
   ↓
4. Find Pagination → Go to Last Page
   ↓
5. Extract Article Links
   ↓
6. Visit Each Article URL
   ↓
7. Extract Content (Title, Content, Date)
   ↓
8. Save to MongoDB
```

## Why Cheerio vs Puppeteer?

**Cheerio (Server-side jQuery):**
- ✅ Fast and lightweight
- ✅ Good for static HTML
- ❌ Can't handle JavaScript-rendered content
- ❌ Can't interact with pages (clicking buttons)

**Puppeteer (Real Browser):**
- ✅ Handles JavaScript-rendered content
- ✅ Can interact with pages (pagination)
- ✅ Waits for content to load
- ❌ Slower and uses more resources

**Our Choice:** Puppeteer because BeyondChats likely uses JavaScript for pagination and content loading.

## MongoDB Storage Flow

```
Article Schema Design:
┌─────────────────┐
│ title           │ ← Article headline
│ content         │ ← Full article text  
│ sourceUrl       │ ← Original URL (unique)
│ publishedDate   │ ← When published
│ scrapedAt       │ ← When we scraped it
│ references[]    │ ← For Phase 2 (AI pipeline)
│ isProcessed     │ ← AI rewrite flag
│ originalContent │ ← Backup before AI
└─────────────────┘
```

## REST API Endpoints

```
GET    /api/articles        → List all articles (with pagination)
GET    /api/articles/:id    → Get single article
POST   /api/articles        → Create new article
PUT    /api/articles/:id    → Update article
DELETE /api/articles/:id    → Delete article
POST   /api/articles/scrape → Trigger scraping
GET    /api/articles/stats  → Get statistics
```

## Error Handling Strategy

```
Controller → Try/Catch → Appropriate HTTP Status
    ↓
400: Bad Request (validation errors)
404: Not Found (article doesn't exist)
409: Conflict (duplicate URL)
500: Server Error (database issues)
```