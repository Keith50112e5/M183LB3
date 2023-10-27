const AES = require("aes-encryption");

const aesSecret =
  process.env.AES_SECRET ||
  "11122233344455566677788822244455555555555555555231231321313aaaff";

const aesInit = () => {
  const aes = new AES();
  aes.setSecretKey(aesSecret);
  return aes;
};

module.exports = { aesInit };
