import mongoose from "mongoose";
import Movie from "./models/movie.model.js";
import List from "./models/list.model.js";
import movies from "./movies.js"; // will be changed to api call from tmdb database
import lists from "./lists.js";
import dotenv from "dotenv";
dotenv.config();

// Helper function to introduce a delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDetails(movieID) {
  const url = `https://api.themoviedb.org/3/movie/${movieID}?language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_BEARER}`,
    },
  };
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    let genreNames = json.genres.map((genre) => genre.name);

    return { genres: genreNames, runtime: json.runtime };
  } catch (error) {
    console.error("error:" + error);
  }
}

async function getCastandCrew(movieID) {
  const url = `https://api.themoviedb.org/3/movie/${movieID}/credits?language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_BEARER}`,
    },
  };

  try {
    const res = await fetch(url, options);
    const json = await res.json();

    let castNames = json.cast.map((person) => person.name);
    let director = json.crew.find(
      (person) => person.job.toLowerCase() === "director"
    );
    return { names: castNames, director: director.name };
  } catch (err) {
    console.error("error:" + err);
    return null;
  }
}

async function formatMovies() {
  let formattedMovies = [];
  for (const movie of movies) {
    let castAndCrew = await getCastandCrew(movie.id);
    let details = await getDetails(movie.id);

    await delay(500);

    let object = {
      tmdbID: movie.id,
      title: movie.title,
      director: castAndCrew?.director,
      cast: castAndCrew?.names,
      description: movie.overview,
      poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      backdrop: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
      runtime: details?.runtime,
      genres: details?.genres,
      releaseDate: new Date(movie.release_date),
    };

    formattedMovies.push(object);
  }

  return formattedMovies;
}

let isConnected = false;
const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("mongo db url not found");
  if (isConnected) return console.log("Already connected to MongoDB");

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

const processMovieData = async () => {
  try {
    let finalMovies = await formatMovies();

    await connectToDB();
    let counter = 0;

    for (const movie of finalMovies) {
      console.log("Processing Movie: ", counter++);
      //prevent duplication by skipping tmdb ID:
      const movieObject = await Movie.findOne({ tmdbID: movie.tmdbID });

      if (!movieObject) {
        // Movie does not exist, proceed to create
        await Movie.create(movie);
        console.log("creating Movie: ", movie.tmdbID);
      } else {
        // Movie already exists, skip insertion
        console.log("Already exists:", movie.title);
      }
      await delay(500);
    }
    console.log("All movies processed. Exiting...");

    return null;
  } catch (error) {
    console.error("ERROR loading movies into DB: ", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

const processListData = async () => {
  try {
    await connectToDB();
    let counter = 0;

    for (const item of lists) {
      console.log("Processing List Item: ", counter++);
      const listItem = await List.create(item);
      if (!listItem) {
        console.log("List Item not created");
      }
      await delay(500);
    }
    console.log("DONE processing lists. Exiting....");
    return null;
  } catch (error) {
    console.error("ERROR loading lists into DB: ", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

processListData();
