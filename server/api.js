const { initializeDatabase, queryDB, insertDB } = require("./database");
const decapitate = require("./middlewares/decapitate");
const log = require("./middlewares/log");
const bcrypt = require("bcrypt");
const jwt = require("./middlewares/jwt");
const valid = require("express-validator");
const validated = require("./middlewares/validated");
const { aesInit } = require("./aes");

const aes = aesInit();

let db;

const initializeAPI = async (app) => {
  db = await initializeDatabase();
  app.get(
    "/api/feed",
    jwt.verify,
    log("Benutzer schaut sich die Feeds an."),
    decapitate,
    getFeed
  );
  app.post(
    "/api/feed",
    jwt.verify,
    valid.body("text"),
    validated,
    log("Benutzer postet einen Feed."),
    decapitate,
    postTweet
  );
  app.post(
    "/api/login",
    valid.body("username").escape(),
    valid.body("password").escape(),
    validated,
    log("Benutzer loggt sich ein"),
    decapitate,
    login
  );
};

const getFeed = async (req, res) => {
  const query = "SELECT * FROM tweets ORDER BY id DESC";
  const plainTweets = await queryDB(db, query);
  const tweets = plainTweets.map((tweet) => {
    const text = aes.decrypt(tweet.text);
    return { ...tweet, text };
  });
  return res.json(tweets);
};

const postTweet = (req, res) => {
  const { username } = req.user;
  const { timestamp, text } = req.body;
  const query = `INSERT INTO tweets (username, timestamp, text) VALUES ('${username}', '${timestamp}', '${aes.encrypt(
    text
  )}')`;
  insertDB(db, query);
  return res.json({ status: "ok" });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const users = await queryDB(db, query);
  if (users.length !== 1) return res.json(null);

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ error: "Wrong Username or Password" });
  const { role } = user;
  const data = { username, role };
  const token = jwt.sign({ data });

  return res.json({ token });
};

module.exports = { initializeAPI };
