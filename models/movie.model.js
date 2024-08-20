import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    tmdbID: { type: Number, unique: true },
    title: {
      type: String,
      required: true,
    },
    director: String,
    cast: [String],
    description: {
      type: String,
    },
    poster: String,
    backdrop: String,
    runtime: Number,
    genres: [String],
    releaseDate: String,
  },
  { timestamps: true }
);

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);

export default Movie;
