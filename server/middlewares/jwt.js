const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "secret";

const sign = (data) => jwt.sign(data, jwtSecret, { expiresIn: "1h" });
const verify = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ error: "No authorization header." });
  }
  const [prefix, token] = authorization.split(" ");
  if (prefix !== "Bearer") {
    return res.status(401).json({ error: "Invalid authorization prefix." });
  }
  const tokenValidation = jwt.verify(token, jwtSecret);
  if (!tokenValidation?.data) {
    return res.status(401).json({ error: "Invalid token." });
  }
  if (!tokenValidation.data.role?.includes("viewer")) {
    return res.status(403).json({ error: "You are not a viewer." });
  }
  req.user = tokenValidation.data;
  next();
};
module.exports = { sign, verify };
