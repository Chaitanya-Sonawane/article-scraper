const ArticleScraper = require('../scrapers/beyondchats.scraper');
const connectDB = require('../config/db');

/**
 * Scraper Service - Orchestrates the scraping process
 * 
 * Why we have a service layer:
 * - Separates business logic from controllers
 * - Handles database connections
 * - Can be reused by different parts of the application
 * - Makes testing easier
 */

class ScraperService {
  constructor() {
    this.scraper = new ArticleScraper();
  }

  async runScraper() {
    try {
      console.log('🔄 Connecting to database...');
      await connectDB();
      
      console.log('🚀 Starting article scraping...');
      const stats = await this.scraper.scrapeArticles();
      
      console.log('✅ Scraper service completed successfully');
      return stats;
    } catch (error) {
      console.error('❌ Scraper service failed:', error.message);
      throw error;
    }
  }
}

module.exports = ScraperService;