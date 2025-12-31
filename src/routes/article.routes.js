const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article.controller");

/**
 * Article Routes - RESTful API Design
 * 
 * REST Principles:
 * - GET: Retrieve data (safe, no side effects)
 * - POST: Create new resources
 * - PUT: Update existing resources (replace entire resource)
 * - DELETE: Remove resources
 * 
 * URL Structure:
 * - /api/articles -> Collection of articles
 * - /api/articles/:id -> Specific article
 * - /api/articles/action -> Special operations
 */

// GET /api/articles - Fetch all articles with pagination
router.get("/", articleController.getAllArticles);

// GET /api/articles/stats - Get article statistics (before /:id to avoid conflict)
router.get("/stats", articleController.getStats);

// GET /api/articles/:id - Fetch single article by ID
router.get("/:id", articleController.getArticleById);

// POST /api/articles/:id/process - Process single article manually
router.post("/:id/process", articleController.processSingleArticle);

// GET /api/articles/:id/updated - Fetch updated version of article
router.get("/:id/updated", articleController.getUpdatedArticle);

// POST /api/articles - Create new article
router.post("/", articleController.createArticle);

// POST /api/articles/scrape - Trigger scraping process
router.post("/scrape", articleController.scrapeArticles);

// POST /api/articles/ai-rewrite - Trigger AI rewriting pipeline
router.post("/ai-rewrite", articleController.runAIPipeline);

// POST /api/articles/demo-ai-rewrite - Trigger demo AI rewriting pipeline
router.post("/demo-ai-rewrite", articleController.runDemoAIPipeline);

// POST /api/articles/reset-processing - Reset all articles to unprocessed (for testing)
router.post("/reset-processing", articleController.resetProcessing);

// PUT /api/articles/:id - Update existing article
router.put("/:id", articleController.updateArticle);

// DELETE /api/articles/:id - Delete article
router.delete("/:id", articleController.deleteArticle);

module.exports = router;