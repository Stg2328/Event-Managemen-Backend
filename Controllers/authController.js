const AWS = require("aws-sdk");
const sendResponse = require("../Utilies/response");
const {
  confirmSchema,
  loginSchema,
  registerSchema,
} = require("../Validations/userValidation");
const generateHash = require("../Utilies/hash");
const { sendWelcomeEmail } = require("../Utilies/emailUtils");
const { sendWelcomeSMS } = require("../Utilies/SMSUtils");
require("dotenv").config();

const cognito = new AWS.CognitoIdentityServiceProvider();
const clientId = process.env.CLIENT_ID;

const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return sendResponse(res, 400, "error", error.details[0].message);

  const { name, email, password, phoneNumber } = req.body;

  try {
    const secretHash = await generateHash(
      email,
      clientId,
      process.env.CLIENT_SECRET
    );

    const params = {
      ClientId: clientId,
      SecretHash: secretHash,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "phone_number", Value: phoneNumber },
        { Name: "name", Value: name },
      ],
    };

    const signUpResponse = await cognito.signUp(params).promise();

    // Send welcome email and SMS after successful sign-up
    await Promise.all([
      sendWelcomeEmail(name, email),
      sendWelcomeSMS(phoneNumber),
    ]);

    sendResponse(
      res,
      201,
      "success",
      "User registration initiated. Please confirm your email.",
      signUpResponse
    );
  } catch (error) {
    sendResponse(res, 400, "error", error.message);
  }
};


const confirm = async (req, res) => {
  const { error } = confirmSchema.validate(req.body);
  if (error) return sendResponse(res, 400, "error", error.details[0].message);

  const { email, ConfirmationCode } = req.body;

  const secretHash = await generateHash(
    email,
    clientId,
    process.env.CLIENT_SECRET 
  );

  const params = {
    ClientId: clientId,
    SecretHash: secretHash,
    Username: email,
    ConfirmationCode: ConfirmationCode,
  };

  try {
    const confirmResponse = await cognito.confirmSignUp(params).promise();

    sendResponse(
      res,
      200,
      "success",
      "User confirmed successfully",
      confirmResponse
    );
  } catch (error) {
    console.log(error);
    sendResponse(res, 400, "error", error.message);
  }
};

// Resend Confirmation Code Function
const resendConfirmationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendResponse(res, 400, "error", "Email is required");
  const secretHash = await generateHash(
    email,
    clientId,
    process.env.CLIENT_SECRET
  );

  const params = {
    ClientId: clientId,
    SecretHash: secretHash,
    Username: email,
  };

  try {
    await cognito.resendConfirmationCode(params).promise();
    sendResponse(res, 200, "success", "Confirmation code resent successfully");
  } catch (error) {
    sendResponse(res, 400, "error", error.message);
  }
};

// Login Function
const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return sendResponse(res, 400, "error", error.details[0].message);

  const { email, password } = req.body;

  const secretHash = await generateHash(
    email,
    clientId,
    process.env.CLIENT_SECRET
  );

  if (!secretHash) {
    return sendResponse(res, 500, "error", "Failed to generate secret hash");
  }
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: secretHash,
    },
  };

  try {
    const loginResponse = await cognito.initiateAuth(params).promise();

    const { AccessToken } =
      loginResponse.AuthenticationResult;
    sendResponse(res, 200, "success", "Login successful", {
      accessToken: AccessToken,
    });
  } catch (error) {
    sendResponse(res, 400, "error", error.message);
  }
};

module.exports = { register, confirm, login, resendConfirmationCode };
