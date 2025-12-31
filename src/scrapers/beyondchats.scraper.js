const puppeteer = require('puppeteer');
const { Article } = require('../models');

/**
 * Web Scraping Explained:
 * 
 * 1. Web scraping is like having a robot visit websites and copy information
 * 2. We use Puppeteer (controls a real browser) instead of just HTTP requests because:
 *    - Many modern websites load content with JavaScript
 *    - We need to handle pagination (clicking "next page" buttons)
 *    - We can wait for content to fully load
 * 
 * 3. Why Cheerio isn't enough here:
 *    - Cheerio is great for static HTML
 *    - But BeyondChats likely uses JavaScript to load articles
 *    - Puppeteer gives us a full browser environment
 */

class ArticleScraper {
  constructor() {
    this.baseUrl = 'https://beyondchats.com/blogs/';
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize the browser
   * Think of this as opening a web browser programmatically
   */
  async initialize() {
    console.log('🚀 Starting browser...');
    
    this.browser = await puppeteer.launch({
      headless: true, // Run without GUI (faster)
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage' // Prevents memory issues
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set a realistic user agent to avoid being blocked
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
  }

  /**
   * Navigate to the LAST page of articles
   * Why? Because we want the OLDEST articles (they're usually on the last page)
   */
  async navigateToLastPage() {
    console.log('📄 Going to blogs page...');
    
    try {
      // Go to the main blogs page
      await this.page.goto(this.baseUrl, { 
        waitUntil: 'networkidle2', // Wait until network is quiet
        timeout: 30000 
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Look for pagination elements
      const paginationExists = await this.page.$('.pagination, .page-numbers, [class*="page"]');
      
      if (!paginationExists) {
        console.log('📄 No pagination found, using current page');
        return;
      }

      console.log('🔍 Found pagination, looking for last page...');

      // Strategy 1: Look for "Last" button
      const lastButton = await this.page.$('a[aria-label="Last"], .last');
      if (lastButton) {
        await lastButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ Clicked "Last" button');
        return;
      }

      // Strategy 2: Find the highest page number
      const pageNumbers = await this.page.evaluate(() => {
        const pageLinks = document.querySelectorAll('a[class*="page"], .page-numbers a');
        const numbers = [];
        
        pageLinks.forEach(link => {
          const text = link.textContent.trim();
          const num = parseInt(text);
          if (!isNaN(num)) {
            numbers.push(num);
          }
        });
        
        return numbers;
      });

      if (pageNumbers.length > 0) {
        const lastPageNum = Math.max(...pageNumbers);
        console.log(`🎯 Found last page: ${lastPageNum}`);
        
        // Click on the highest page number
        const pageLinks = await this.page.$$('a[class*="page"], .page-numbers a');
        for (const link of pageLinks) {
          const text = await this.page.evaluate(el => el.textContent, link);
          if (parseInt(text) === lastPageNum) {
            await link.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log(`✅ Navigated to page ${lastPageNum}`);
            break;
          }
        }
      }

    } catch (error) {
      console.log('⚠️ Could not navigate to last page:', error.message);
      console.log('📄 Continuing with current page...');
    }
  }

  /**
   * Navigate to the FIRST page of articles instead of last
   * Let's try getting recent articles first to see if we can find actual article links
   */
  async navigateToFirstPage() {
    console.log('📄 Going to blogs page...');
    
    try {
      // Go to the main blogs page
      await this.page.goto(this.baseUrl, { 
        waitUntil: 'networkidle2', // Wait until network is quiet
        timeout: 30000 
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Loaded blogs page');

    } catch (error) {
      console.log('⚠️ Could not navigate to blogs page:', error.message);
      throw error;
    }
  }

  /**
   * Extract article links from the current page
   * We're looking for links that point to individual blog posts
   */
  async extractArticleLinks() {
    console.log('🔍 Looking for article links...');

    const articleLinks = await this.page.evaluate(() => {
      let links = [];

      // Look for actual article links based on the debug results
      // BeyondChats has articles with URLs like /blogs/article-title/
      const articleSelectors = [
        'a[href*="/blogs/"]:not([href*="/tag/"]):not([href$="/blogs/"]):not([href*="#"])',
        'article a[href*="/blogs/"]',
        '.post a[href*="/blogs/"]'
      ];

      for (const selector of articleSelectors) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
          const href = element.href;
          const title = element.textContent.trim();
          
          // Validate that this looks like an actual article link
          if (href && 
              href.includes('/blogs/') && 
              !href.endsWith('/blogs/') && 
              !href.includes('/tag/') &&
              !href.includes('#') &&
              title && 
              title.length > 10) {
            
            // Check if URL has the pattern of an actual article
            const urlParts = href.split('/');
            const articleSlug = urlParts[urlParts.length - 2]; // Get the part before the trailing slash
            
            // Skip if it's clearly not an article (too short or contains special chars)
            if (articleSlug && 
                articleSlug.length > 5 && 
                !articleSlug.includes('tag') && 
                !articleSlug.includes('category') &&
                !articleSlug.includes('page')) {
              
              links.push({
                url: href,
                title: title
              });
            }
          }
        });

        // If we found links with this selector, we can continue to get more
        if (links.length > 0) {
          console.log(`Found ${links.length} links with selector: ${selector}`);
        }
      }

      // Remove duplicates
      const uniqueLinks = links.filter((link, index, self) => 
        index === self.findIndex(l => l.url === link.url)
      );

      // Limit to 5 articles for testing
      return uniqueLinks.slice(0, 5);
    });

    console.log(`📝 Found ${articleLinks.length} article links`);
    
    // Debug: log the URLs we found
    if (articleLinks.length > 0) {
      console.log('🔍 Article URLs found:');
      articleLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.url}`);
        console.log(`     Title: ${link.title}`);
      });
    }
    
    return articleLinks;
  }

  /**
   * Scrape content from a single article
   * This is where we extract the actual article data
   */
  async scrapeArticleContent(articleUrl) {
    console.log(`📖 Scraping: ${articleUrl}`);

    try {
      await this.page.goto(articleUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract article data using browser's JavaScript engine
      const articleData = await this.page.evaluate(() => {
        let title = '';
        let content = '';
        let publishedDate = null;

        // Extract title - try multiple selectors
        const titleSelectors = ['h1', '.entry-title', '.post-title', 'title'];
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            title = element.textContent.trim();
            break;
          }
        }

        // Extract main content - try multiple selectors
        const contentSelectors = [
          'article .content',
          '.post-content',
          '.entry-content',
          'article',
          '.blog-content',
          'main',
          '.elementor-widget-theme-post-content', // Common in WordPress/Elementor sites
          '.post-body',
          '.article-content'
        ];

        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            // Get text content and clean it up
            const text = element.textContent.trim();
            if (text.length > 200) { // Ensure we have substantial content
              content = text;
              break;
            }
          }
        }

        // Extract published date if available
        const dateSelectors = ['time', '.date', '.published', '[datetime]', '.post-date'];
        for (const selector of dateSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const dateText = element.getAttribute('datetime') || element.textContent;
            const date = new Date(dateText);
            if (!isNaN(date.getTime())) {
              publishedDate = date.toISOString();
              break;
            }
          }
        }

        return { title, content, publishedDate };
      });

      // Debug logging
      console.log(`  📋 Title: ${articleData.title ? 'Found' : 'Missing'} (${articleData.title?.substring(0, 50)}...)`);
      console.log(`  📄 Content: ${articleData.content ? `Found (${articleData.content.length} chars)` : 'Missing'}`);
      console.log(`  📅 Date: ${articleData.publishedDate || 'Not found'}`);

      // Validate the scraped data
      if (!articleData.title || !articleData.content) {
        console.log('⚠️ Incomplete data scraped - missing title or content');
        return null;
      }

      if (articleData.content.length < 100) {
        console.log('⚠️ Content too short, might be navigation or ads');
        return null;
      }

      return articleData;

    } catch (error) {
      console.error(`❌ Error scraping ${articleUrl}:`, error.message);
      return null;
    }
  }

  /**
   * Save article to database
   * We check for duplicates to avoid storing the same article twice
   */
  async saveArticle(articleData, sourceUrl) {
    try {
      // Debug logging
      console.log(`  🔍 Attempting to save article:`);
      console.log(`    URL: ${sourceUrl}`);
      console.log(`    Title: ${articleData.title?.substring(0, 50)}...`);
      console.log(`    Content length: ${articleData.content?.length}`);

      // Validate required fields
      if (!sourceUrl || !articleData.title || !articleData.content) {
        console.log(`⚠️ Skipped: Missing required data (URL: ${!!sourceUrl}, Title: ${!!articleData.title}, Content: ${!!articleData.content})`);
        return false;
      }

      // Check if we already have this article
      const existingArticle = await Article.findOne({ sourceUrl });
      if (existingArticle) {
        console.log(`⏭️ Skipped: ${articleData.title} (already exists)`);
        return false;
      }

      // Create new article with explicit field mapping
      const articleToSave = {
        title: articleData.title,
        content: articleData.content,
        sourceUrl: sourceUrl, // Make sure this is explicitly set
        publishedDate: articleData.publishedDate ? new Date(articleData.publishedDate) : null,
        scrapedAt: new Date()
      };

      console.log(`  💾 Creating article with sourceUrl: ${articleToSave.sourceUrl}`);

      const article = new Article(articleToSave);
      await article.save();
      
      console.log(`✅ Saved: ${articleData.title}`);
      return true;

    } catch (error) {
      console.error(`❌ Error saving article:`, error.message);
      console.error(`  Debug info - sourceUrl: ${sourceUrl}, type: ${typeof sourceUrl}`);
      return false;
    }
  }

  /**
   * Main scraping method - orchestrates the entire process
   */
  async scrapeArticles() {
    let stats = { processed: 0, saved: 0, skipped: 0, errors: 0 };
    const startTime = Date.now();

    try {
      await this.initialize();
      await this.navigateToFirstPage();
      
      const articleLinks = await this.extractArticleLinks();
      
      if (articleLinks.length === 0) {
        console.log('❌ No articles found');
        return stats;
      }

      console.log(`🎯 Processing ${articleLinks.length} articles...`);

      // Process each article
      for (const link of articleLinks) {
        stats.processed++;

        try {
          const articleData = await this.scrapeArticleContent(link.url);
          
          if (articleData) {
            const saved = await this.saveArticle(articleData, link.url);
            if (saved) {
              stats.saved++;
            } else {
              stats.skipped++;
            }
          } else {
            console.log(`⚠️ No data extracted from ${link.url}`);
            stats.errors++;
          }

          // Be respectful - wait between requests
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`❌ Failed to process ${link.url}:`, error.message);
          stats.errors++;
        }
      }

    } catch (error) {
      console.error('❌ Scraping failed:', error.message);
    } finally {
      // Always clean up
      if (this.browser) {
        await this.browser.close();
      }
    }

    // Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n📊 Scraping Summary:');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📝 Processed: ${stats.processed}`);
    console.log(`✅ Saved: ${stats.saved}`);
    console.log(`⏭️  Skipped: ${stats.skipped}`);
    console.log(`❌ Errors: ${stats.errors}`);

    return stats;
  }
}

module.exports = ArticleScraper;