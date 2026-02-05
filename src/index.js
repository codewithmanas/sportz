import http from "node:http";
import express from "express";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import { matchesRouter } from "./routes/matches.js";
import { commentaryRouter } from "./routes/commentary.js";

const parsedPort = Number(process.env.PORT);
const PORT = Number.isFinite(parsedPort) ? parsedPort : 8000;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();

const server = http.createServer(app);


app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from express server!");
})

app.use(securityMiddleware());

// Routes
app.use("/api/matches", matchesRouter);
app.use("/api/matches/:id/commentary", commentaryRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {

    const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

    console.log(`Server is running at ${baseUrl}`);
    console.log(`WebSocket Server is running at ${baseUrl.replace("http", "ws")}/ws`);
})