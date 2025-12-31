require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/articles';

async function testScraper() {
  console.log('Starting scraper tests...\n');
  
  try {
    console.log('1. Getting initial stats...');
    const initialStats = await axios.get(`${BASE_URL}/stats`);
    console.log(`Initial articles: ${initialStats.data.data.totalArticles}\n`);
    
    console.log('2. Running scraper...');
    const scrapeResponse = await axios.post(`${BASE_URL}/scrape`);
    console.log(scrapeResponse.data.message);
    
    await new Promise(resolve => setTimeout(resolve, 90000));
    
    console.log('\n3. Getting final stats...');
    const finalStats = await axios.get(`${BASE_URL}/stats`);
    console.log(`Final articles: ${finalStats.data.data.totalArticles}`);
    
    console.log('\n4. Validating data quality...');
    const validation = await axios.get(`${BASE_URL}/validate`);
    console.log(`Data is valid: ${validation.data.isValid}`);
    if (validation.data.issues.length > 0) {
      console.log('Issues found:', validation.data.issues);
    }
    
    console.log('\n5. Testing duplicate prevention...');
    console.log('Running scraper again...');
    await axios.post(`${BASE_URL}/scrape`);
    
    await new Promise(resolve => setTimeout(resolve, 90000));
    
    const duplicateTestStats = await axios.get(`${BASE_URL}/stats`);
    const articlesAfterDuplicate = duplicateTestStats.data.data.totalArticles;
    
    console.log(`Articles after duplicate test: ${articlesAfterDuplicate}`);
    
    if (articlesAfterDuplicate === finalStats.data.data.totalArticles) {
      console.log('✓ Duplicate prevention working correctly');
    } else {
      console.log('✗ Duplicate prevention failed');
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

if (require.main === module) {
  testScraper();
}

module.exports = testScraper;