require('dotenv').config();
const DemoAIRewriterService = require('../src/services/demo-ai-rewriter.service');
const connectDB = require('../src/config/db');

/**
 * Demo AI Pipeline Script - Works without API keys
 * 
 * This script demonstrates the complete AI rewriting workflow
 * without requiring OpenAI API credits. It creates mock improved
 * content to show how the system works.
 * 
 * USAGE:
 * npm run demo-ai-pipeline
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - MONGO_URI: MongoDB connection string (only this is needed)
 */

async function runDemoAIPipeline() {
  console.log('🎭 Demo AI Article Rewriter Pipeline Starting...');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('🎯 This demo works without API keys and shows the complete workflow');
  
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    // Initialize demo AI service
    const demoAiService = new DemoAIRewriterService();
    
    // Run the pipeline
    const stats = await demoAiService.processArticles();
    
    console.log('\n🎉 Demo AI Pipeline completed successfully!');
    console.log('📊 Final Statistics:');
    console.log(`   📝 Articles Processed: ${stats.processed}`);
    console.log(`   ✅ Successful Rewrites: ${stats.success}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log(`   📈 Success Rate: ${((stats.success / stats.processed) * 100).toFixed(1)}%`);
    
    console.log('\n🎯 What happened:');
    console.log('   • Original articles were backed up');
    console.log('   • Content was enhanced with better structure');
    console.log('   • Mock reference articles were added');
    console.log('   • Articles are now marked as processed');
    
    console.log('\n🌐 Next steps:');
    console.log('   • Visit http://localhost:3000 to see the results');
    console.log('   • Articles now show as "Processed" in the UI');
    console.log('   • You can compare original vs improved versions');
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Demo AI Pipeline failed:', error.message);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runDemoAIPipeline();
}

module.exports = runDemoAIPipeline;