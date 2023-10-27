const { initializeDatabase, queryDB, insertDB } = require("./database");
const decapitate = require("./middlewares/decapitate");
const log = require("./middlewares/log");
const bcrypt = require("bcrypt");
const jwt = require("./middlewares/jwt");

const AES = require("aes-encryption");

const aes = new AES();

const aesSecret = process.env.AES_SECRET;

aes.setSecretKey(aesSecret);

let db;

const initializeAPI = async (app) => {
  db = await initializeDatabase();
  app.get(
    "/api/feed",
    log("Benutzer schaut sich die Feeds an."),
    decapitate,
    getFeed
  );
  app.post(
    "/api/feed",
    log("Benutzer postet einen Feed."),
    decapitate,
    jwt.verify,
    postTweet
  );
  app.post("/api/login", log("Benutzer loggt sich ein"), decapitate, login);
};

const getFeed = async (req, res) => {
  const query = "SELECT * FROM tweets ORDER BY id DESC";
  const plainTweets = await queryDB(db, query);
  const tweets = plainTweets.map((tweet) => {
    const text = aes.decrypt(tweet.text);
    return { ...tweet, text };
  });
  res.json(tweets);
};

const postTweet = (req, res) => {
  const { username } = req.user;
  const { timestamp, text } = req.body.data;
  const query = `INSERT INTO tweets (username, timestamp, text) VALUES ('${username}', '${timestamp}', '${aes.encrypt(
    text
  )}')`;
  insertDB(db, query);
  res.json({ status: "ok" });
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

  res.json({ token });
};

module.exports = { initializeAPI };
