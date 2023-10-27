const { initializeDatabase, queryDB, insertDB } = require("./database");
const decapitate = require("./middlewares/decapitate");
const bcrypt = require("bcrypt");
const jwtMiddleware = require("./middlewares/jwt");
const valid = require("express-validator");
const validated = require("./middlewares/validated");
const { aesInit } = require("./aes");

const aes = aesInit();

let db;

const initializeAPI = async (app) => {
  db = await initializeDatabase();
  app.get("/api/feed", jwtMiddleware.verify, decapitate, getFeed);
  app.post(
    "/api/feed",
    jwtMiddleware.verify,
    valid.body("text").notEmpty().withMessage("Feed can't be Empty.").escape(),
    validated,
    decapitate,
    postTweet
  );
  app.post(
    "/api/login",
    valid
      .body("username")
      .notEmpty()
      .withMessage("Username can't be Empty.")
      .escape(),
    valid
      .body("password")
      .isLength({ min: 6, max: 64 })
      .withMessage("Password must be between 6 to 64 characters.")
      .escape(),
    validated,
    decapitate,
    login
  );
};

const getFeed = async (req, res) => {
  const { username } = req.user;
  req.log.info(username + " schaut sich die Tweets an.");

  const query = "SELECT * FROM tweets ORDER BY id DESC";
  const plainTweets = await queryDB(db, query);
  const decryptText = (tweet) => {
    const text = aes.decrypt(tweet.text);
    return { ...tweet, text };
  };
  const tweets = plainTweets.map(decryptText);
  return res.json(tweets);
};

const postTweet = async (req, res) => {
  const { username } = req.user;
  req.log.info(username + " postet einen Tweet.");

  const { timestamp, text } = req.body;
  const encryption = aes.encrypt(text);
  const query = `INSERT INTO tweets (username, timestamp, text) VALUES ('${username}', '${timestamp}', '${encryption}')`;
  await insertDB(db, query);
  return res.json({ status: "ok" });
};

const login = async (req, res) => {
  req.log.info("Benutzer loggt sich ein");

  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const users = await queryDB(db, query);
  const genericMessage = { error: "Wrong Username or Password." };

  if (users.length !== 1) return res.json(genericMessage);

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.json(genericMessage);

  const { role } = user;
  const data = { username, role };
  const token = jwtMiddleware.sign({ data });

  return res.json({ token });
};

module.exports = { initializeAPI };
