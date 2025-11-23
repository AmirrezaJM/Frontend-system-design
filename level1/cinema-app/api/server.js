import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

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

app.get("/api/movies", (req, res) => {
    console.log(`[API] GET /api/movies`);
    res.json(movies);
});

app.get("/api/movies/:id", (req, res) => {
    const id = Number(req.params.id);
    console.log(`[API] GET /api/movies/${id}`);
    const movie = movies.find(m => m.id === id);
    if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
    }
    res.json(movie);
});


app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
});
