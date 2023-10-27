require("dotenv").config();
const express = require("express");
const http = require("http");
const { initializeAPI } = require("./api");
const decapitate = require("./middlewares/decapitate");
const pino = require("pino-http");
const log = require("./middlewares/log");
const { rateLimit } = require("express-rate-limit");

const perMinute = 60 * 1000;

const limiter = rateLimit({
  windowMs: perMinute,
  limit: 50,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Create the express server
const app = express();
app.use(express.json());
app.use(pino());
app.use(limiter);
const server = http.createServer(app);

// deliver static files from the client folder like css, js, images
app.use(express.static("client"));
// route for the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

// Initialize the REST api
initializeAPI(app);

//start the web server
const serverPort = process.env.PORT || 3000;

server.listen(serverPort, () =>
  console.log(`Express Server started on http://127.0.0.1:${serverPort}/`)
);
