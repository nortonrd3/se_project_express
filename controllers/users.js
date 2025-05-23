const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  OK,
  CREATED,
  CONFLICT,
  MONGO_DUPLICATE_KEY_ERROR,
  UNAUTHORIZED,
} = require("../utils/errors");

// POST /signup
// This route is used to create a new user
const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;
  if (!name || !avatar || !email || !password) {
    return res.status(BAD_REQUEST).send({
      message: "All fields are required",
    });
  }
  return bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return res.status(CREATED).send(userObj);
    })
    .catch((err) => {
      console.error(err);
      if (err.code === MONGO_DUPLICATE_KEY_ERROR) {
        return res.status(CONFLICT).send({
          message: "User already exists",
        });
      }
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({
          message: err.message,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error has occurred on the server",
      });
    });
};

// GET /users/me
// This route returns the current user
const getCurrentUser = (req, res) => {
  const { _id } = req.user;
  return User.findById(_id)
    .orFail()
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return res.status(OK).send(userObj);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({
          message: err.message,
        });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message: err.message,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error has occurred on the server",
      });
    });
};

// POST /signin
// This route is used to log in a user
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(BAD_REQUEST).send({
      message: "Email and password are required",
    });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({
        token,
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        return res.status(UNAUTHORIZED).send({
          message: err.message,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error has occurred on the server",
      });
    });
};

// PATCH /users/me
// This route updates the current user's information

const updateUser = (req, res) => {
  const { name, avatar } = req.body;
  const { _id } = req.user;

  if (!name && !avatar) {
    return res.status(BAD_REQUEST).send({
      message: "At least one of 'name' or 'avatar' is required",
    });
  }

  const updateData = {};
  if (name) {
    updateData.name = name;
  }
  if (avatar) {
    updateData.avatar = avatar;
  }

  return User.findByIdAndUpdate(_id, updateData, {
    new: true,
    runValidators: true,
  })
    .orFail()
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return res.status(OK).send(userObj);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({
          message: err.message,
        });
      }
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({
          message: err.message,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error has occurred on the server",
      });
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  updateUser,
  login,
};
