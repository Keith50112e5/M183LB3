const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "secret";

const sign = (data) => jwt.sign(data, jwtSecret, { expiresIn: "1h" });

const verify = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization)
    return res.status(401).json({ error: "No authorization header." });

  const [prefix, token] = authorization.split(" ");

  const sendError = (error, statusCode = 401) => {
    req.log.error(error);
    res.status(statusCode).json({ error });
  };

  if (prefix !== "Bearer") return sendError("Invalid authorization prefix.");

  const tokenValidation = jwt.verify(token, jwtSecret);

  if (!tokenValidation?.data) return sendError("Invalid token.");

  if (tokenValidation.data.role !== "viewer")
    return sendError("You are not a viewer.", 403);

  req.user = tokenValidation.data;

  return next();
};
module.exports = { sign, verify };
