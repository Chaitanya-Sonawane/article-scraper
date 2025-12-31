const axios = require('axios');
const cheerio = require('cheerio');
const { Article } = require('../models');

/**
 * AI Article Rewriter Pipeline
 * 
 * FLOW EXPLANATION:
 * 1. Fetch unprocessed articles from our database
 * 2. For each article, search Google for similar content
 * 3. Scrape reference articles from other websites
 * 4. Use AI to rewrite our content based on top-ranking articles
 * 5. Add proper citations and references
 * 6. Update the article in our database
 * 
 * WHY THIS APPROACH WORKS:
 * - We learn from top-ranking content (SEO best practices)
 * - We maintain originality while improving quality
 * - We add valuable references for credibility
 * - We avoid plagiarism by rewriting, not copying
 */

class AIRewriterService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.searchEngineId = process.env.SEARCH_ENGINE_ID;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    
    // Validate required environment variables
    if (!this.googleApiKey || !this.searchEngineId) {
      throw new Error('Google Custom Search API credentials are required');
    }
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  /**
   * Main pipeline method - processes all unprocessed articles
   */
  async processArticles() {
    console.log('🚀 Starting AI Article Rewriter Pipeline...');
    
    try {
      // Get articles that haven't been processed yet
      const unprocessedArticles = await Article.find({ isProcessed: false });
      
      if (unprocessedArticles.length === 0) {
        console.log('✅ No articles to process');
        return { processed: 0, success: 0, errors: 0 };
      }

      console.log(`📝 Found ${unprocessedArticles.length} articles to process`);
      
      let stats = { processed: 0, success: 0, errors: 0 };
      
      // Process each article
      for (const article of unprocessedArticles) {
        stats.processed++;
        
        try {
          console.log(`\n🔄 Processing: ${article.title}`);
          await this.processArticle(article);
          stats.success++;
          console.log(`✅ Successfully processed: ${article.title}`);
          
          // Add delay to be respectful to APIs
          await this.delay(2000);
          
        } catch (error) {
          stats.errors++;
          console.error(`❌ Failed to process ${article.title}:`, error.message);
        }
      }
      
      console.log('\n📊 Pipeline Summary:');
      console.log(`📝 Processed: ${stats.processed}`);
      console.log(`✅ Success: ${stats.success}`);
      console.log(`❌ Errors: ${stats.errors}`);
      
      return stats;
      
    } catch (error) {
      console.error('💥 Pipeline failed:', error.message);
      throw error;
    }
  }

  /**
   * Process a single article through the AI pipeline
   */
  async processArticle(article) {
    // Step 1: Search Google for similar articles
    console.log('🔍 Searching Google for reference articles...');
    const searchResults = await this.searchGoogle(article.title);
    
    // Step 2: Filter and get top reference articles
    const referenceUrls = this.filterSearchResults(searchResults, article.sourceUrl);
    
    if (referenceUrls.length === 0) {
      console.log('⚠️ No external references found, proceeding with AI-only rewrite...');
      // Fallback: Use AI to improve the article without external references
      const rewrittenContent = await this.rewriteWithoutReferences(article);
      await this.updateArticleWithoutReferences(article, rewrittenContent);
      return;
    }
    
    console.log(`📖 Found ${referenceUrls.length} reference articles`);
    
    // Step 3: Scrape content from reference articles
    const references = [];
    for (const url of referenceUrls) {
      try {
        const scrapedContent = await this.scrapeReferenceArticle(url);
        if (scrapedContent) {
          references.push(scrapedContent);
        }
      } catch (error) {
        console.log(`⚠️ Failed to scrape ${url}:`, error.message);
      }
    }
    
    if (references.length === 0) {
      console.log('⚠️ Failed to scrape references, proceeding with AI-only rewrite...');
      const rewrittenContent = await this.rewriteWithoutReferences(article);
      await this.updateArticleWithoutReferences(article, rewrittenContent);
      return;
    }
    
    // Step 4: Use AI to rewrite the article
    console.log('🤖 Rewriting article with AI...');
    const rewrittenContent = await this.rewriteWithAI(article, references);
    
    // Step 5: Update article in database
    await this.updateArticle(article, rewrittenContent, references);
  }

  /**
   * Search Google Custom Search API for similar articles
   */
  async searchGoogle(query) {
    try {
      const searchUrl = 'https://www.googleapis.com/customsearch/v1';
      
      // Create more generic search terms from the article title
      const genericQuery = this.createGenericSearchQuery(query);
      
      const params = {
        key: this.googleApiKey,
        cx: this.searchEngineId,
        q: genericQuery,
        num: 10,
        dateRestrict: 'y2'
      };
      
      console.log(`🔍 Searching Google for: "${genericQuery}"`);
      const response = await axios.get(searchUrl, { params });
      
      const items = response.data.items || [];
      console.log(`📊 Google returned ${items.length} results`);
      
      // If no results with generic query, try even simpler terms
      if (items.length === 0) {
        const simpleQuery = this.createSimpleSearchQuery(query);
        console.log(`🔍 Trying simpler search: "${simpleQuery}"`);
        
        const simpleParams = { ...params, q: simpleQuery };
        const simpleResponse = await axios.get(searchUrl, { params: simpleParams });
        const simpleItems = simpleResponse.data.items || [];
        
        console.log(`📊 Simple search returned ${simpleItems.length} results`);
        return simpleItems;
      }
      
      return items;
      
    } catch (error) {
      console.error('Google Search API error:', error.response?.data || error.message);
      throw new Error('Failed to search Google');
    }
  }

  /**
   * Create a more generic search query from article title
   */
  createGenericSearchQuery(title) {
    // Extract key terms and create a broader search
    const keywords = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(' ')
      .filter(word => word.length > 3) // Keep meaningful words
      .filter(word => !['the', 'and', 'are', 'you', 'your', 'this', 'that', 'with', 'from', 'will', 'should', 'what', 'when', 'where', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word))
      .slice(0, 3) // Take first 3 keywords
      .join(' ');
    
    // Add broader search terms and exclude BeyondChats
    return `${keywords} blog article guide -site:beyondchats.com`;
  }

  /**
   * Create an even simpler search query
   */
  createSimpleSearchQuery(title) {
    // Extract the most important 1-2 terms and add generic terms
    const mainTerms = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => ['ai', 'artificial', 'intelligence', 'chatbot', 'healthcare', 'google', 'ads', 'patient', 'care', 'trust', 'building', 'guide', 'choosing'].includes(word))
      .slice(0, 2)
      .join(' ');
    
    // If no specific terms found, use broader healthcare/AI terms
    const fallbackTerms = mainTerms || 'artificial intelligence healthcare';
    return `${fallbackTerms} blog article -site:beyondchats.com`;
  }

  /**
   * Filter search results to get best reference articles
   * 
   * FILTERING CRITERIA:
   * - Not from BeyondChats (we want external sources)
   * - Must be from blogs or article sites
   * - Must have reasonable titles
   * - Prefer well-known domains
   */
  filterSearchResults(searchResults, originalUrl) {
    console.log(`🔍 Filtering ${searchResults.length} search results...`);
    
    const filtered = searchResults
      .filter(result => {
        console.log(`  Checking: ${result.link}`);
        
        // Exclude our own domain
        if (result.link.includes('beyondchats.com')) {
          console.log(`    ❌ Excluded: BeyondChats domain`);
          return false;
        }
        
        // Exclude social media and non-article sites
        const excludeDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'youtube.com', 'pinterest.com'];
        if (excludeDomains.some(domain => result.link.includes(domain))) {
          console.log(`    ❌ Excluded: Social media/non-article site`);
          return false;
        }
        
        // Must have a reasonable title
        if (!result.title || result.title.length < 10) {
          console.log(`    ❌ Excluded: Title too short`);
          return false;
        }
        
        // More lenient filtering - accept more types of content
        const excludeKeywords = ['pdf', 'download', 'login', 'signup', 'register'];
        if (excludeKeywords.some(keyword => result.link.toLowerCase().includes(keyword))) {
          console.log(`    ❌ Excluded: Contains excluded keyword`);
          return false;
        }
        
        console.log(`    ✅ Accepted: ${result.title}`);
        return true;
      })
      .slice(0, 3) // Take top 3 results instead of 2
      .map(result => result.link); // Return just URLs for now
    
    console.log(`📋 Filtered results: ${filtered.length} articles selected`);
    return filtered;
  }

  /**
   * Scrape content from a reference article
   * 
   * CONTENT EXTRACTION STRATEGY:
   * - Use Cheerio for static content extraction
   * - Focus on main content, ignore navigation/ads
   * - Clean and format the text
   * - Extract meaningful paragraphs only
   */
  async scrapeReferenceArticle(url) {
    try {
      console.log(`📖 Scraping reference: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .advertisement, .ads').remove();
      
      // Try multiple selectors to find main content
      const contentSelectors = [
        'article',
        '.post-content',
        '.entry-content', 
        '.content',
        'main',
        '.article-body',
        '[role="main"]'
      ];
      
      let content = '';
      let title = $('h1').first().text().trim() || $('title').text().trim();
      
      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          // Get text content and clean it
          content = element.text()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n') // Replace multiple newlines
            .trim();
          
          if (content.length > 500) { // Ensure we have substantial content
            break;
          }
        }
      }
      
      if (!content || content.length < 200) {
        throw new Error('Insufficient content extracted');
      }
      
      // Limit content length to avoid token limits
      if (content.length > 3000) {
        content = content.substring(0, 3000) + '...';
      }
      
      return {
        url,
        title,
        scrapedContent: content
      };
      
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Use OpenAI to rewrite the article
   * 
   * PROMPT ENGINEERING DECISIONS:
   * - Clear instructions to avoid plagiarism
   * - Emphasis on maintaining original meaning
   * - Request for improved structure and clarity
   * - Ask for similar tone to reference articles
   * - Include citation requirements
   */
  async rewriteWithAI(originalArticle, references) {
    try {
      const prompt = this.buildRewritePrompt(originalArticle, references);
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer and editor. Your job is to improve articles while maintaining originality and avoiding plagiarism.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error('Failed to rewrite article with AI');
    }
  }

  /**
   * Build the prompt for AI rewriting
   */
  buildRewritePrompt(originalArticle, references) {
    const referenceTexts = references.map((ref, index) => 
      `Reference ${index + 1} (${ref.title}):\n${ref.scrapedContent.substring(0, 1000)}...\n`
    ).join('\n');
    
    return `
Please rewrite the following article to improve its quality, clarity, and structure. Use the reference articles as inspiration for tone and style, but DO NOT copy any content directly.

REQUIREMENTS:
1. Maintain the original meaning and key points
2. Improve formatting, structure, and readability
3. Use a similar professional tone as the reference articles
4. Make it more engaging and informative
5. DO NOT plagiarize - create original content
6. Keep the same general length
7. Add a "References" section at the end

ORIGINAL ARTICLE:
Title: ${originalArticle.title}
Content: ${originalArticle.content}

REFERENCE ARTICLES FOR INSPIRATION:
${referenceTexts}

Please provide the rewritten article with improved structure and clarity:
    `.trim();
  }

  /**
   * Update the article in the database
   */
  async updateArticle(article, rewrittenContent, references) {
    try {
      // Store original content as backup
      article.originalContent = article.content;
      article.content = rewrittenContent;
      article.isProcessed = true;
      article.references = references.map(ref => ({
        title: ref.title,
        url: ref.url,
        scrapedContent: ref.scrapedContent.substring(0, 500) // Store excerpt
      }));
      
      await article.save();
      console.log('💾 Article updated in database');
      
    } catch (error) {
      console.error('Database update error:', error.message);
      throw new Error('Failed to update article in database');
    }
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Use OpenAI to rewrite article without external references
   */
  async rewriteWithoutReferences(article) {
    try {
      const prompt = `
Please rewrite the following article to improve its quality, clarity, and structure. Since no reference articles are available, focus on:

1. Improving the writing style and flow
2. Enhancing readability and structure
3. Making it more engaging and professional
4. Correcting any grammar or style issues
5. Adding better formatting with clear sections
6. Maintaining the original meaning and key points

ORIGINAL ARTICLE:
Title: ${article.title}
Content: ${article.content}

Please provide the rewritten article with improved structure and clarity:
      `.trim();
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer and editor. Your job is to improve articles while maintaining originality.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error('Failed to rewrite article with AI');
    }
  }

  /**
   * Update article without external references
   */
  async updateArticleWithoutReferences(article, rewrittenContent) {
    try {
      // Store original content as backup
      article.originalContent = article.content;
      article.content = rewrittenContent;
      article.isProcessed = true;
      article.references = []; // No external references
      
      await article.save();
      console.log('💾 Article updated in database (AI-only rewrite)');
      
    } catch (error) {
      console.error('Database update error:', error.message);
      throw new Error('Failed to update article in database');
    }
  }
}

module.exports = AIRewriterService;