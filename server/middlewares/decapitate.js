const decapitate = (req, res, next) => {
  const heads = Object.keys(res.getHeaders());

  heads.forEach((head) => res.removeHeader(head));

  return next();
};
module.exports = decapitate;
