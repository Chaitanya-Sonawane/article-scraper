require('dotenv').config();
const AIRewriterService = require('../src/services/ai-rewriter.service');
const connectDB = require('../src/config/db');

/**
 * AI Pipeline Script - Standalone script for article rewriting
 * 
 * This script:
 * 1. Connects to the database
 * 2. Finds unprocessed articles
 * 3. Runs them through the AI rewriting pipeline
 * 4. Updates articles with improved content and references
 * 
 * USAGE:
 * npm run ai-pipeline
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - GOOGLE_API_KEY: Google Custom Search API key
 * - SEARCH_ENGINE_ID: Google Custom Search Engine ID
 * - OPENAI_API_KEY: OpenAI API key for GPT
 * - MONGO_URI: MongoDB connection string
 */

async function runAIPipeline() {
  console.log('🤖 AI Article Rewriter Pipeline Starting...');
  console.log('⏰ Started at:', new Date().toISOString());
  
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    // Initialize AI service
    const aiService = new AIRewriterService();
    
    // Run the pipeline
    const stats = await aiService.processArticles();
    
    console.log('\n🎉 AI Pipeline completed successfully!');
    console.log('📊 Final Statistics:');
    console.log(`   📝 Articles Processed: ${stats.processed}`);
    console.log(`   ✅ Successful Rewrites: ${stats.success}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log(`   📈 Success Rate: ${((stats.success / stats.processed) * 100).toFixed(1)}%`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 AI Pipeline failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('Google Custom Search')) {
      console.error('\n🔧 Setup Help:');
      console.error('1. Get Google Custom Search API key: https://developers.google.com/custom-search/v1/introduction');
      console.error('2. Create a Custom Search Engine: https://cse.google.com/');
      console.error('3. Add GOOGLE_API_KEY and SEARCH_ENGINE_ID to your .env file');
    }
    
    if (error.message.includes('OpenAI')) {
      console.error('\n🔧 Setup Help:');
      console.error('1. Get OpenAI API key: https://platform.openai.com/api-keys');
      console.error('2. Add OPENAI_API_KEY to your .env file');
    }
    
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runAIPipeline();
}

module.exports = runAIPipeline;