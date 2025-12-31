const mongoose = require("mongoose");

const updatedArticleSchema = new mongoose.Schema(
  {
    originalArticleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, "Original article reference is required"]
    },
    previousContent: {
      type: String,
      required: [true, "Previous content is required for tracking changes"]
    },
    newContent: {
      type: String,
      required: [true, "New content is required"]
    },
    changesSummary: {
      type: String,
      trim: true,
      maxlength: [1000, "Changes summary cannot exceed 1000 characters"]
    },
    updatedBy: {
      type: String,
      default: "system",
      trim: true
    },
    updateReason: {
      type: String,
      enum: ["content_change", "correction", "addition", "removal", "formatting"],
      default: "content_change"
    },
    confidence: {
      type: Number,
      min: [0, "Confidence cannot be negative"],
      max: [100, "Confidence cannot exceed 100"],
      default: 100
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

updatedArticleSchema.index({ originalArticleId: 1 });
updatedArticleSchema.index({ createdAt: -1 });

updatedArticleSchema.virtual('originalArticle', {
  ref: 'Article',
  localField: 'originalArticleId',
  foreignField: '_id',
  justOne: true
});

updatedArticleSchema.statics.getUpdateHistory = function(articleId) {
  return this.find({ originalArticleId: articleId })
    .sort({ createdAt: -1 })
    .populate('originalArticle', 'title url');
};

module.exports = mongoose.model("UpdatedArticle", updatedArticleSchema);