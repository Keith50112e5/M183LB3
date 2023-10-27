const { initializeDatabase, queryDB, insertDB } = require("./database");
const decapitate = require("./middlewares/decapitate");

let db;

const initializeAPI = async (app) => {
  db = await initializeDatabase();
  app.get("/api/feed", decapitate, getFeed);
  app.post("/api/feed", decapitate, postTweet);
  app.post("/api/login", decapitate, login);
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
