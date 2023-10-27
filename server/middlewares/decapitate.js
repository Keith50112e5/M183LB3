const decapitate = (req, res, next) => {
  const heads = Object.keys(res.getHeaders());
  const removeHeads = (head) => {
    res.removeHeader(head);
  };
  heads.forEach(removeHeads);
  next();
};
module.exports = decapitate;
