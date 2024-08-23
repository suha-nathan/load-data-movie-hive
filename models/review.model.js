import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: { type: String, required: true },
    dateWatched: { type: Date },
    isSpoiler: Boolean,
    tags: [String],
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    numStars: Number,
  },
  { timestamps: true }
);

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
