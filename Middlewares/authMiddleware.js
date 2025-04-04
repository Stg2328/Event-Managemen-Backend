const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem');
const sendResponse = require('../Utilies/response'); // Assuming you have this utility function for responses
require('dotenv').config();
// Fetch the JWKS keys from Cognito
const getCognitoJWKS = async () => {
  const URL = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.POOL_ID}/.well-known/jwks.json`;
  try {
    const response = await axios.get(URL);
    const data = response.data;
    const keys = data.keys;
    const pemKeys = {};

    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const { kid, n, e, kty } = key;
      const jwk = { kty, n, e };
      pemKeys[kid] = jwkToPem(jwk);
    }

    return pemKeys;
  } catch (error) {
    console.error("Error fetching JWKS", error);
    throw new Error('Could not fetch JWKS');
  }
};

// Middleware for verifying the token
const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; 

  if (!token) {
    return sendResponse(res, 400, 'error', 'Authorization token is required');
  }

  try {
    const decodedJwt = jwt.decode(token, { complete: true });

    if (!decodedJwt || !decodedJwt.header || !decodedJwt.header.kid) {
      return sendResponse(res, 400, 'error', 'Invalid token structure');
    }

    // Fetch JWKS
    const pemKeys = await getCognitoJWKS();

    const kid = decodedJwt.header.kid;
    const pem = pemKeys[kid];

    if (!pem) {
      return sendResponse(res, 400, 'error', 'Public key not found');
    }

    // Verify token with the correct PEM key
    jwt.verify(token, pem, (err, decoded) => {
      if (err) {
        console.log(err);
        
        return sendResponse(res, 401, 'error', 'Token verification failed');
      }
      req.user = decoded; 
      next(); 
    });
  } catch (error) {
    console.error("Error in token verification middleware", error);
    return sendResponse(res, 500, 'error', 'Internal server error');
  }
};

module.exports = { verifyToken };
