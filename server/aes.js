const AES = require("aes-encryption");

const aesSecret = process.env.AES_SECRET;

const aesInit = () => {
  const aes = new AES();
  aes.setSecretKey(aesSecret);
  return aes;
};

module.exports = { aesInit };
