const valid = require("express-validator");

const validated = (req, res, next) => {
  const result = valid.validationResult(req);

  if (result.isEmpty()) return next();

  const formattedErrors = result.array().map((error) => {
    console.log(error);
    return { [error.path]: error.msg };
  });

  return res.status(400).json(formattedErrors);
};
module.exports = validated;
