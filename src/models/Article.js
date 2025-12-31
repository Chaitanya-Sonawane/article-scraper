const mongoose = require("mongoose");

/**
 * Article Schema Design
 * 
 * Why each field exists:
 * - title: The article headline (required for display and SEO)
 * - content: Full article text (the main value we're storing)
 * - sourceUrl: Original URL (for attribution and avoiding duplicates)
 * - publishedDate: When the article was originally published (for sorting and relevance)
 * - scrapedAt: When we collected this data (for tracking freshness)
 * - references: Array of related articles (for Phase 2 - AI rewriting)
 * - isProcessed: Flag to track if AI has rewritten this article
 * - originalContent: Backup of original content before AI processing
 */

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    
    content: {
      type: String,
      required: [true, "Article content is required"],
      minlength: [50, "Content must be at least 50 characters"]
    },
    
    sourceUrl: {
      type: String,
      required: [true, "Source URL is required"],
      unique: true, // Prevents duplicate articles
      validate: {
        validator: function(url) {
          return /^https?:\/\/.+/.test(url);
        },
        message: "Please provide a valid URL"
      }
    },
    
    publishedDate: {
      type: Date,
      default: null // Some articles might not have published dates
    },
    
    scrapedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    
    // For Phase 2 - AI rewriting pipeline
    references: [{
      title: String,
      url: String,
      scrapedContent: String // Content from reference articles
    }],
    
    isProcessed: {
      type: Boolean,
      default: false // Tracks if AI has rewritten this article
    },
    
    originalContent: {
      type: String,
      default: null // Backup before AI processing
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // Include virtual fields in JSON output
    toObject: { virtuals: true }
  }
);

// Index for better query performance
// Note: sourceUrl already has unique index, so we don't need to add another one
articleSchema.index({ scrapedAt: -1 }); // Fast sorting by scrape date
articleSchema.index({ isProcessed: 1 }); // Fast filtering for AI pipeline

// Virtual field - computed property that doesn't store in DB
articleSchema.virtual('wordCount').get(function() {
  return this.content ? this.content.split(' ').length : 0;
});

// Pre-save middleware - runs before saving to database
articleSchema.pre('save', function(next) {
  // If this is the first time being processed, backup original content
  if (this.isProcessed && !this.originalContent) {
    this.originalContent = this.content;
  }
  next();
});

module.exports = mongoose.model("Article", articleSchema);
