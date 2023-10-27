const log = (info) => (req, res, next) => {
  req.log.info(info);
  next();
};
module.exports = log;
