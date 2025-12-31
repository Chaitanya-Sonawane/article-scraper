require('dotenv').config();
const ScraperService = require('../src/services/scraper.service');

/**
 * Scraper Script - Standalone script to run scraping
 * 
 * This script can be run independently of the web server
 * Useful for:
 * - Scheduled scraping (cron jobs)
 * - Manual scraping
 * - Testing the scraper
 */

async function runScraper() {
  const scraperService = new ScraperService();
  
  try {
    console.log('🎯 Starting scraper script...');
    const stats = await scraperService.runScraper();
    
    console.log('🎉 Scraper script completed successfully!');
    console.log('📊 Final stats:', stats);
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Scraper script failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly (not imported)
if (require.main === module) {
  runScraper();
}

module.exports = runScraper;