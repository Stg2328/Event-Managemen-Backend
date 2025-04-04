const Joi = require('joi');

const registerSchema = Joi.object({
  name:Joi.string().min(3),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string()
  .pattern(/^\+91\d{10}$/) 
  .message('Phone number must be a valid Indian number starting with +91 and followed by 10 digits.') 
  .required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const confirmSchema = Joi.object({
  email: Joi.string().email().required(),
  ConfirmationCode: Joi.string().length(6).required(),
});

module.exports = { registerSchema, loginSchema, confirmSchema };
