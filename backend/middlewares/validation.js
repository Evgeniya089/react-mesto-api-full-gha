/* eslint-disable no-undef */
const { celebrate, Joi } = require('celebrate');

const urlRegExp = /https?:\/\/(www\.)?[a-z0-9.-]{2,}\.[a-z]{2,}\/?[-._~:/?#[\]@!$&'()*+,;=]*/;

module.exports = { urlRegExp };

module.exports.validateEditProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  })
});

module.exports.validateAddCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(urlRegExp),
  })
});

module.exports.validateUserById = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24),
  })
});

module.exports.validateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(urlRegExp),
  })
});

module.exports.validateCardId = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  })
});

module.exports.validateLikeCard = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  })
});
