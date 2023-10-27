const { initializeDatabase, queryDB, insertDB } = require("./database");
const decapitate = require("./middlewares/decapitate");
const log = require("./middlewares/log");

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
    postTweet
  );
  app.post("/api/login", log("Benutzer loggt sich ein."), decapitate, login);
};

const getFeed = async (req, res) => {
  const query = req.query.q;
  const tweets = await queryDB(db, query);
  res.json(tweets);
};

const postTweet = (req, res) => {
  insertDB(db, req.body.query);
  res.json({ status: "ok" });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = await queryDB(db, query);
  if (user.length === 1) {
    res.json(user[0]);
  } else {
    res.json(null);
  }
};

module.exports = { initializeAPI };
