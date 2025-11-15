// server.js
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Fake "database"
const movies = [
  {
    id: 1,
    title: "Inception",
    durationMinutes: 148,
    posterUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzyFNPbMrTQ_AUYnyBDLibVcpXDCxAl7EJpw&s",
    description: "A thief who steals corporate secrets through dream-sharing tech."
  },
  {
    id: 2,
    title: "Interstellar",
    durationMinutes: 169,
    posterUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDTub_bBGszu356QIoRKefZvZ8VP1tNEzi6A&s",
    description: "Explorers travel through a wormhole in space in an attempt to save humanity."
  }
];

// Serve static files
app.use(express.static("public"));
app.use(express.json());

// API: list movies
app.get("/api/movies", (req, res) => {
  res.json(movies);
});

// API: movie details
app.get("/api/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find(m => m.id === id);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }
  res.json(movie);
});

// API: "book" a movie (just logs)
app.post("/api/movies/:id/book", (req, res) => {
  const id = Number(req.params.id);
  console.log(`Booking request for movie id=${id}`);
  res.status(201).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Cinema app running at http://localhost:${PORT}`);
});
