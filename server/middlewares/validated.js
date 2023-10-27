const { validationResult } = require("express-validator");

const validated = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) return next();

  const logAndGetMessages = (err) => {
    const { msg } = err;
    req.log.error(msg);
    return msg;
  };
  const error = result.array().map(logAndGetMessages).join("\n");
  return res.status(400).json({ error });
};
module.exports = validated;
