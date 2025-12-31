const { Article } = require('../models');

/**
 * Demo AI Rewriter Service - Works without OpenAI API
 * 
 * This is a demonstration version that shows how the system works
 * without requiring OpenAI API credits. It creates mock improved content
 * to demonstrate the complete workflow.
 */

class DemoAIRewriterService {
  constructor() {
    console.log('🎭 Demo AI Rewriter Service initialized (no API keys required)');
  }

  /**
   * Main pipeline method - processes all unprocessed articles
   */
  async processArticles() {
    console.log('🚀 Starting Demo AI Article Rewriter Pipeline...');
    
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
          
          // Add delay to simulate real processing
          await this.delay(1000);
          
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
   * Process a single article through the demo pipeline
   */
  async processArticle(article) {
    // Step 1: Simulate finding reference articles
    console.log('🔍 Simulating reference article search...');
    const mockReferences = this.generateMockReferences(article.title);
    
    // Step 2: Generate improved content
    console.log('🤖 Generating improved content...');
    const improvedContent = this.generateImprovedContent(article);
    
    // Step 3: Update article in database
    await this.updateArticle(article, improvedContent, mockReferences);
  }

  /**
   * Generate mock reference articles based on the topic
   */
  generateMockReferences(title) {
    const references = [];
    
    // Generate 2-3 mock references based on the article topic
    if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('chatbot')) {
      references.push({
        title: "The Future of AI in Business: A Comprehensive Guide",
        url: "https://example-tech-blog.com/ai-business-guide",
        scrapedContent: "Artificial intelligence is transforming how businesses operate, from customer service to data analysis. Companies that embrace AI early are seeing significant improvements in efficiency and customer satisfaction..."
      });
      
      references.push({
        title: "Building Trust in AI Systems: Best Practices",
        url: "https://ai-research-institute.org/trust-in-ai",
        scrapedContent: "Trust in AI systems is built through transparency, consistent performance, and clear communication about capabilities and limitations. Organizations must focus on ethical AI development..."
      });
    }
    
    if (title.toLowerCase().includes('healthcare') || title.toLowerCase().includes('patient')) {
      references.push({
        title: "Digital Health Revolution: Improving Patient Outcomes",
        url: "https://healthcare-innovation.com/digital-health",
        scrapedContent: "Digital health technologies are revolutionizing patient care by enabling remote monitoring, personalized treatment plans, and improved communication between patients and providers..."
      });
      
      references.push({
        title: "The Role of Technology in Modern Healthcare",
        url: "https://medical-tech-review.org/technology-healthcare",
        scrapedContent: "Technology in healthcare has evolved from simple record-keeping to sophisticated AI-driven diagnostic tools. The integration of technology improves accuracy, reduces costs, and enhances patient experience..."
      });
    }
    
    if (title.toLowerCase().includes('google') || title.toLowerCase().includes('ads')) {
      references.push({
        title: "Maximizing ROI from Digital Advertising Campaigns",
        url: "https://marketing-insights.com/digital-advertising-roi",
        scrapedContent: "Successful digital advertising requires more than just high click-through rates. Businesses must focus on conversion optimization, audience targeting, and comprehensive analytics to achieve real ROI..."
      });
      
      references.push({
        title: "The Complete Guide to PPC Campaign Optimization",
        url: "https://digital-marketing-hub.org/ppc-optimization",
        scrapedContent: "Pay-per-click advertising success depends on continuous optimization of keywords, ad copy, landing pages, and bid strategies. Regular analysis and adjustment are key to maintaining profitable campaigns..."
      });
    }
    
    // If no specific references, add generic business/tech references
    if (references.length === 0) {
      references.push({
        title: "Digital Transformation in Modern Business",
        url: "https://business-tech-today.com/digital-transformation",
        scrapedContent: "Digital transformation is no longer optional for businesses wanting to stay competitive. Companies must embrace new technologies while maintaining focus on customer experience and operational efficiency..."
      });
    }
    
    return references;
  }

  /**
   * Generate improved content based on the original article
   */
  generateImprovedContent(article) {
    const originalContent = article.content;
    const title = article.title;
    
    // Create an improved version with better structure and additional insights
    const improvedContent = `# ${title}

## Executive Summary

${this.generateExecutiveSummary(title)}

## Introduction

${this.extractIntroduction(originalContent)}

## Key Insights

${this.generateKeyInsights(title, originalContent)}

## Main Content

${this.improveMainContent(originalContent)}

## Best Practices

${this.generateBestPractices(title)}

## Conclusion

${this.generateConclusion(title)}

## References

The insights in this article are supported by research from leading industry publications and expert analysis in the field.

---

*This article has been enhanced with additional insights and improved structure to provide maximum value to readers.*`;

    return improvedContent;
  }

  /**
   * Generate an executive summary based on the title
   */
  generateExecutiveSummary(title) {
    if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('chatbot')) {
      return "Artificial intelligence and chatbot technologies are rapidly transforming business operations. This comprehensive guide explores the key considerations, benefits, and implementation strategies for organizations looking to leverage AI effectively.";
    }
    
    if (title.toLowerCase().includes('healthcare') || title.toLowerCase().includes('patient')) {
      return "Healthcare technology continues to evolve, presenting both opportunities and challenges for patient care. This analysis examines the current state of healthcare AI, trust factors, and the path forward for sustainable implementation.";
    }
    
    if (title.toLowerCase().includes('google') || title.toLowerCase().includes('ads')) {
      return "Digital advertising effectiveness depends on more than just traffic generation. This guide reveals the critical factors that separate successful campaigns from costly mistakes, focusing on conversion optimization and ROI measurement.";
    }
    
    return "This comprehensive analysis provides actionable insights and practical strategies for modern business challenges, backed by industry research and expert recommendations.";
  }

  /**
   * Extract and improve the introduction from original content
   */
  extractIntroduction(originalContent) {
    // Take the first paragraph or two and enhance them
    const firstParagraphs = originalContent.split('\n\n').slice(0, 2).join('\n\n');
    return firstParagraphs.substring(0, 300) + "...\n\nThis enhanced analysis builds upon these foundational concepts to provide deeper insights and actionable strategies.";
  }

  /**
   * Generate key insights based on the topic
   */
  generateKeyInsights(title, originalContent) {
    const insights = [];
    
    if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('chatbot')) {
      insights.push("• AI implementation success depends heavily on clear use case definition and realistic expectations");
      insights.push("• Integration capabilities often matter more than advanced AI features for business applications");
      insights.push("• Ongoing training and maintenance are critical for long-term AI system effectiveness");
    }
    
    if (title.toLowerCase().includes('healthcare') || title.toLowerCase().includes('patient')) {
      insights.push("• Patient trust in healthcare AI is built through transparency and consistent performance");
      insights.push("• Healthcare AI should augment, not replace, human medical expertise");
      insights.push("• Regulatory compliance and data privacy are fundamental requirements");
    }
    
    if (title.toLowerCase().includes('google') || title.toLowerCase().includes('ads')) {
      insights.push("• Conversion tracking and attribution are more valuable than vanity metrics");
      insights.push("• Landing page optimization significantly impacts advertising ROI");
      insights.push("• Audience understanding drives more effective ad targeting than broad reach");
    }
    
    if (insights.length === 0) {
      insights.push("• Strategic planning and clear objectives are essential for successful implementation");
      insights.push("• User experience and practical value drive adoption more than technical features");
      insights.push("• Continuous improvement and adaptation are key to long-term success");
    }
    
    return insights.join('\n');
  }

  /**
   * Improve the main content structure
   */
  improveMainContent(originalContent) {
    // Clean up the original content and add better structure
    const cleanContent = originalContent
      .replace(/\t+/g, '') // Remove tabs
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    // Take the main content and add some structure
    const sections = cleanContent.split('\n\n').filter(section => section.length > 50);
    
    return sections.slice(0, 5).map((section, index) => {
      return `### Section ${index + 1}\n\n${section}`;
    }).join('\n\n');
  }

  /**
   * Generate best practices based on the topic
   */
  generateBestPractices(title) {
    const practices = [];
    
    if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('chatbot')) {
      practices.push("1. **Start Small**: Begin with a pilot project to test AI effectiveness before full deployment");
      practices.push("2. **Focus on Integration**: Ensure AI tools work seamlessly with existing systems");
      practices.push("3. **Monitor Performance**: Regularly review AI outputs and user feedback for continuous improvement");
      practices.push("4. **Maintain Human Oversight**: Keep humans in the loop for critical decisions and quality control");
    }
    
    if (title.toLowerCase().includes('healthcare') || title.toLowerCase().includes('patient')) {
      practices.push("1. **Prioritize Patient Safety**: Always maintain human oversight for medical decisions");
      practices.push("2. **Ensure Transparency**: Clearly communicate when AI is being used in patient care");
      practices.push("3. **Protect Privacy**: Implement robust data security and privacy protection measures");
      practices.push("4. **Provide Training**: Ensure healthcare staff are properly trained on AI tools and limitations");
    }
    
    if (title.toLowerCase().includes('google') || title.toLowerCase().includes('ads')) {
      practices.push("1. **Track Conversions**: Focus on meaningful business outcomes, not just clicks");
      practices.push("2. **Optimize Landing Pages**: Ensure ad traffic leads to relevant, high-converting pages");
      practices.push("3. **Test Continuously**: Regular A/B testing improves campaign performance over time");
      practices.push("4. **Analyze User Intent**: Understand why users click and what they're looking for");
    }
    
    if (practices.length === 0) {
      practices.push("1. **Set Clear Objectives**: Define specific, measurable goals before implementation");
      practices.push("2. **Gather User Feedback**: Regular feedback helps identify areas for improvement");
      practices.push("3. **Monitor Key Metrics**: Track performance indicators that align with business goals");
      practices.push("4. **Iterate and Improve**: Use data-driven insights to continuously enhance performance");
    }
    
    return practices.join('\n');
  }

  /**
   * Generate a conclusion based on the topic
   */
  generateConclusion(title) {
    if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('chatbot')) {
      return "The successful implementation of AI and chatbot technologies requires careful planning, realistic expectations, and ongoing commitment to improvement. Organizations that focus on practical applications, user experience, and continuous optimization will see the greatest benefits from their AI investments.";
    }
    
    if (title.toLowerCase().includes('healthcare') || title.toLowerCase().includes('patient')) {
      return "Healthcare AI represents a significant opportunity to improve patient outcomes and operational efficiency. However, success depends on maintaining the human element of care while leveraging technology to enhance, not replace, medical expertise. Trust, transparency, and patient safety must remain the top priorities.";
    }
    
    if (title.toLowerCase().includes('google') || title.toLowerCase().includes('ads')) {
      return "Effective digital advertising requires a holistic approach that goes beyond generating clicks. By focusing on conversion optimization, user experience, and comprehensive analytics, businesses can transform their advertising spend from a cost center into a growth driver.";
    }
    
    return "Success in today's competitive landscape requires a strategic approach that balances innovation with practical implementation. Organizations that focus on user value, continuous improvement, and data-driven decision making will achieve the best results.";
  }

  /**
   * Update the article in the database
   */
  async updateArticle(article, improvedContent, references) {
    try {
      // Store original content as backup
      const originalContent = article.content;
      
      // Update the main article
      article.originalContent = originalContent;
      article.content = improvedContent;
      article.isProcessed = true;
      article.references = references.map(ref => ({
        title: ref.title,
        url: ref.url,
        scrapedContent: ref.scrapedContent.substring(0, 500) // Store excerpt
      }));
      
      await article.save();
      
      // Create UpdatedArticle record for comparison view
      const UpdatedArticle = require('../models/UpdatedArticle');
      
      const updatedArticleRecord = new UpdatedArticle({
        originalArticleId: article._id,
        previousContent: originalContent,
        newContent: improvedContent,
        changesSummary: this.generateChangesSummary(article.title),
        updatedBy: "Demo AI System",
        updateReason: "content_change",
        confidence: 95
      });
      
      await updatedArticleRecord.save();
      console.log('💾 Article updated in database');
      console.log('📝 UpdatedArticle record created for comparison');
      
    } catch (error) {
      console.error('Database update error:', error.message);
      throw new Error('Failed to update article in database');
    }
  }

  /**
   * Generate a summary of changes made
   */
  generateChangesSummary(title) {
    return `Enhanced article structure with executive summary, key insights, and best practices. Added comprehensive analysis and actionable recommendations based on "${title}". Improved readability and added supporting references for better user value.`;
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DemoAIRewriterService;