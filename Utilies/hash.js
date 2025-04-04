const crypto = require('crypto');

const generateHash = (username, clientId, clientSecret) => {
  if (!clientSecret) {
    return undefined;
  }

  const hash = crypto
    .createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');

  return hash;
};

module.exports = generateHash;
