const Joi = require('joi');

const eventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  date: Joi.date().iso().required(),
});

module.exports = { eventSchema };
