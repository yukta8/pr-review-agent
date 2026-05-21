const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  repoName: String,
  prNumber: Number,
  prTitle: String,
  comments: [
    {
      file: String,
      line: Number,
      comment: String,
    },
  ],
  reviewedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Review = mongoose.model("Review", reviewSchema);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("MongoDB connection failed: ", err.message);
    throw err;
  }
}

async function saveReview(repoName, prNumber, prTitle, comments) {
  try {
    const review = new Review({ repoName, prNumber, prTitle, comments });
    await review.save();

    console.log("Review saved to DB");
  } catch (err) {
    console.log("Failed to save review: ", err.message);
    throw err;
  }
}

async function getReviews() {
  return await Review.find().sort({ reviewedAt: -1 });
}

module.exports = { connectDB, saveReview, getReviews };
