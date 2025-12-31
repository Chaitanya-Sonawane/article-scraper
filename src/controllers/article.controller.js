const { Article } = require('../models');
const ArticleScraper = require('../scrapers/beyondchats.scraper');

/**
 * Article Controller - Handles all article-related API requests
 * 
 * CRUD Operations Explained:
 * - CREATE: Add new articles to database
 * - READ: Fetch articles (all or single)
 * - UPDATE: Modify existing articles
 * - DELETE: Remove articles from database
 * 
 * Why we separate controllers from routes:
 * - Controllers contain business logic
 * - Routes just handle HTTP routing
 * - This makes code easier to test and maintain
 */

class ArticleController {
  
  /**
   * GET /api/articles
   * Fetch all articles with pagination and sorting
   */
  async getAllArticles(req, res) {
    try {
      // Extract query parameters for pagination and filtering
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sortBy = req.query.sortBy || 'scrapedAt'; // Default sort by scrape date
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Default descending
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder;
      
      // Fetch articles with pagination
      const articles = await Article.find()
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v'); // Exclude version field from response
      
      // Get total count for pagination info
      const totalArticles = await Article.countDocuments();
      const totalPages = Math.ceil(totalArticles / limit);
      
      res.json({
        success: true,
        data: articles,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalArticles: totalArticles,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
      
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch articles',
        error: error.message
      });
    }
  }

  /**
   * GET /api/articles/:id
   * Fetch a single article by ID
   */
  async getArticleById(req, res) {
    try {
      const { id } = req.params;
      
      // Validate MongoDB ObjectId format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid article ID format'
        });
      }
      
      const article = await Article.findById(id).select('-__v');
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }
      
      res.json({
        success: true,
        data: article
      });
      
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch article',
        error: error.message
      });
    }
  }

  /**
   * POST /api/articles
   * Create a new article manually
   */
  async createArticle(req, res) {
    try {
      const { title, content, sourceUrl, publishedDate } = req.body;
      
      // Validate required fields
      if (!title || !content || !sourceUrl) {
        return res.status(400).json({
          success: false,
          message: 'Title, content, and sourceUrl are required'
        });
      }
      
      // Check if article with this URL already exists
      const existingArticle = await Article.findOne({ sourceUrl });
      if (existingArticle) {
        return res.status(409).json({
          success: false,
          message: 'Article with this URL already exists'
        });
      }
      
      // Create new article
      const article = new Article({
        title,
        content,
        sourceUrl,
        publishedDate: publishedDate ? new Date(publishedDate) : null,
        scrapedAt: new Date()
      });
      
      await article.save();
      
      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: article
      });
      
    } catch (error) {
      console.error('Error creating article:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create article',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/articles/:id
   * Update an existing article
   */
  async updateArticle(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Validate MongoDB ObjectId format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid article ID format'
        });
      }
      
      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.createdAt;
      delete updates.scrapedAt;
      
      // Update article
      const article = await Article.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { 
          new: true, // Return updated document
          runValidators: true // Run schema validation
        }
      ).select('-__v');
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Article updated successfully',
        data: article
      });
      
    } catch (error) {
      console.error('Error updating article:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update article',
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/articles/:id
   * Delete an article
   */
  async deleteArticle(req, res) {
    try {
      const { id } = req.params;
      
      // Validate MongoDB ObjectId format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid article ID format'
        });
      }
      
      const article = await Article.findByIdAndDelete(id);
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Article deleted successfully',
        data: { id: article._id, title: article.title }
      });
      
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete article',
        error: error.message
      });
    }
  }

  /**
   * POST /api/articles/scrape
   * Trigger the scraping process
   */
  async scrapeArticles(req, res) {
    try {
      // Start scraping in background
      const scraper = new ArticleScraper();
      
      // Don't wait for scraping to complete - return immediately
      scraper.scrapeArticles().catch(error => {
        console.error('Background scraping failed:', error);
      });
      
      res.json({
        success: true,
        message: 'Scraping started. Check server logs for progress.'
      });
      
    } catch (error) {
      console.error('Error starting scraper:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start scraping',
        error: error.message
      });
    }
  }

  /**
   * POST /api/articles/ai-rewrite
   * Trigger the AI rewriting pipeline
   */
  async runAIPipeline(req, res) {
    try {
      const AIRewriterService = require('../services/ai-rewriter.service');
      const aiService = new AIRewriterService();
      
      // Start AI pipeline in background
      aiService.processArticles().catch(error => {
        console.error('Background AI pipeline failed:', error);
      });
      
      res.json({
        success: true,
        message: 'AI rewriting pipeline started. Check server logs for progress.'
      });
      
    } catch (error) {
      console.error('Error starting AI pipeline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start AI pipeline',
        error: error.message
      });
    }
  }

  /**
   * POST /api/articles/demo-ai-rewrite
   * Trigger the demo AI rewriting pipeline
   */
  async runDemoAIPipeline(req, res) {
    try {
      const DemoAIRewriterService = require('../services/demo-ai-rewriter.service');
      const demoAiService = new DemoAIRewriterService();
      
      // Start demo AI pipeline in background
      demoAiService.processArticles().catch(error => {
        console.error('Background demo AI pipeline failed:', error);
      });
      
      res.json({
        success: true,
        message: 'Demo AI rewriting pipeline started. Check server logs for progress.'
      });
      
    } catch (error) {
      console.error('Error starting demo AI pipeline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start demo AI pipeline',
        error: error.message
      });
    }
  }

  /**
   * POST /api/articles/reset-processing
   * Reset all articles to unprocessed state (for testing)
   */
  async resetProcessing(req, res) {
    try {
      await Article.updateMany(
        {},
        {
          $set: {
            isProcessed: false,
            originalContent: null,
            references: []
          }
        }
      );
      
      res.json({
        success: true,
        message: 'All articles reset to unprocessed state'
      });
      
    } catch (error) {
      console.error('Error resetting articles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset articles',
        error: error.message
      });
    }
  }
  /**
   * GET /api/articles/:id/updated
   * Fetch the updated version of an article
   */
  async getUpdatedArticle(req, res) {
    try {
      const { id } = req.params;
      
      // Validate MongoDB ObjectId format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid article ID format'
        });
      }
      
      const UpdatedArticle = require('../models/UpdatedArticle');
      
      // Find the most recent update for this article
      const updatedArticle = await UpdatedArticle.findOne({ originalArticleId: id })
        .sort({ createdAt: -1 })
        .populate('originalArticle', 'title sourceUrl')
        .select('-__v');
      
      if (!updatedArticle) {
        return res.status(404).json({
          success: false,
          message: 'No updated version found for this article'
        });
      }
      
      res.json({
        success: true,
        data: updatedArticle
      });
      
    } catch (error) {
      console.error('Error fetching updated article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch updated article',
        error: error.message
      });
    }
  }
  async getStats(req, res) {
    try {
      const totalArticles = await Article.countDocuments();
      const processedArticles = await Article.countDocuments({ isProcessed: true });
      const recentArticles = await Article.countDocuments({
        scrapedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      const latestArticle = await Article.findOne()
        .sort({ scrapedAt: -1 })
        .select('title scrapedAt');
      
      res.json({
        success: true,
        data: {
          totalArticles,
          processedArticles,
          unprocessedArticles: totalArticles - processedArticles,
          recentArticles,
          latestArticle
        }
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }
  /**
   * POST /api/articles/:id/process
   * Process a single article manually
   */
  async processSingleArticle(req, res) {
    try {
      const { id } = req.params;
      
      // Validate MongoDB ObjectId format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid article ID format'
        });
      }
      
      // Find the article
      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }
      
      // Check if already processed
      if (article.isProcessed) {
        return res.status(400).json({
          success: false,
          message: 'Article has already been processed'
        });
      }
      
      // Process the article
      const DemoAIRewriterService = require('../services/demo-ai-rewriter.service');
      const aiService = new DemoAIRewriterService();
      
      await aiService.processArticle(article);
      
      res.json({
        success: true,
        message: 'Article processed successfully',
        data: { id: article._id, title: article.title }
      });
      
    } catch (error) {
      console.error('Error processing single article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process article',
        error: error.message
      });
    }
  }
  async getStats(req, res) {
    try {
      const totalArticles = await Article.countDocuments();
      const processedArticles = await Article.countDocuments({ isProcessed: true });
      const recentArticles = await Article.countDocuments({
        scrapedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      const latestArticle = await Article.findOne()
        .sort({ scrapedAt: -1 })
        .select('title scrapedAt');
      
      res.json({
        success: true,
        data: {
          totalArticles,
          processedArticles,
          unprocessedArticles: totalArticles - processedArticles,
          recentArticles,
          latestArticle
        }
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }
}

module.exports = new ArticleController();