const User = require("../models/User");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  OK,
  CREATED,
} = require("../utils/errors");

// GET /users

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(OK).send({ users }))
    .catch((err) => {
      console.error(err);
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error has occurred on the server",
      });
    });
};

// POST /users
const createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) =>
      res
        .status(CREATED)
        .send(user)
    )
    .catch((err) => {
      console.error(err);
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

// GET /users/:userId
const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(OK).send(user))
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

module.exports = {
  getUsers,
  createUser,
  getUser,
};
