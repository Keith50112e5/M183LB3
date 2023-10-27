const valid = require("express-validator");

const validated = (req, res, next) => {
  const result = valid.validationResult(req);

  if (result.isEmpty()) return next();

  const logAndGetMessages = (err) => (console.log(err) ? 0 : err.msg);
  const error = result.array().map(logAndGetMessages).join("\n");
  return res.status(400).json({ error });
};
module.exports = validated;
