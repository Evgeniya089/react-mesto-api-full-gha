/* eslint-disable no-undef */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = require('../models/user');
const { сreated } = require('../errors/errorCodes');

const ConflictErr = require('../errors/conflict');
const NotFound = require('../errors/notFound');
const Unauthorized = require('../errors/unauthorized');
const BadRequest = require('../errors/badRequest');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  userSchema
    .find({})
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  userSchema
    .findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      return res.send(user);
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;

  userSchema
    .findById(_id)
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      return res.send(user);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => userSchema
      .create({
        name, about, avatar, email, password: hash
      }))
    .then((user) => res.status(сreated).send({
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    }))
    .catch((error) => {
      if (error.code === 11000) {
        next(new ConflictErr('Такой пользователь уже существует'));
      } else if (error.name === 'ValidationError') {
        next(new BadRequest('Некорректные данные'));
      } else {
        next(error);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new Unauthorized('Пользователь не найден');
      }
      return bcrypt.compare(password, user.password)
        .then((match) => {
          if (!match) {
            return next(new Unauthorized('Не правильно указан логин или пароль'));
          }
          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
            { expiresIn: '7d' },
          );
          return res.send({ token });
        });
    })
    .catch(next);
};

module.exports.editUserProfile = (req, res, next) => {
  const id = req.user._id;
  const { name, about } = req.body;

  userSchema.findByIdAndUpdate(id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      return res.send(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(
          new BadRequest('Переданы некорректные данные.')
        );
      } else next(error);
    });
};

module.exports.editAvatar = (req, res, next) => {
  const id = req.user._id;
  const { avatar } = req.body;

  userSchema.findByIdAndUpdate(id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      return res.send(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(
          new BadRequest('Переданы некорректные данные.')
        );
      } else next(error);
    });
};
