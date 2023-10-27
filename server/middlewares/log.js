const log = (info) => (req, res, next) => {
  req.log.info(info);
  return next();
};
module.exports = log;
