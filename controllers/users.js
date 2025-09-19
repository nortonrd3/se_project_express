const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");
const UnauthorizedError = require("../errors/UnauthorizedError");
const {
  OK,
  CREATED,
  MONGO_DUPLICATE_KEY_ERROR,
} = require("../utils/errors");

// POST /signup
// This route is used to create a new user
const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new BadRequestError("All fields are required"));
  }
  return bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({ name, avatar: avatar || undefined, email, password: hash })
    )
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return res.status(CREATED).send(userObj);
    })
    .catch((err) => {
      console.error(err);
      if (err.code === MONGO_DUPLICATE_KEY_ERROR) {
        return next(new ConflictError("Email already exists"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

// GET /users/me
// This route returns the current user
const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  return User.findById(_id)
    .orFail()
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return res.status(OK).send({ data: userObj });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Requested resource not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

// POST /signin
// This route is used to log in a user
const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
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
      return next(new UnauthorizedError("Incorrect email or password"));
    });
};

// PATCH /users/me
// This route updates the current user's information

const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;
  const { _id } = req.user;

  if (!name && !avatar) {
    return next(new BadRequestError("At least one of 'name' or 'avatar' is required"));
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
      return res.status(OK).send({ data: userObj });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Requested resource not found"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  updateUser,
  login,
};
