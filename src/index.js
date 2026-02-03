import express from "express";
import { matchesRouter } from "./routes/matches.js";

const app = express();
const PORT = 8000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from express server!");
})

// Routes
app.use("/api/matches", matchesRouter);


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})