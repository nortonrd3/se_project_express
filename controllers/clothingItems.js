const mongoose = require("mongoose");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");
const ClothingItem = require("../models/clothingItem");

const { OK, CREATED } = require("../utils/errors");

// Create a clothing item
const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(CREATED).send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid data provided"));
      } else {
        next(err);
      }
    });
};

// GET all clothing items

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send({ data: items }))
    .catch(next); // Let middleware handle any errors
};

// Delete a clothing item

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new BadRequestError("Invalid item ID format"));
  }

  const userId = req.user._id;

  return ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");
      }

      if (!item.owner.equals(userId)) {
        throw new ForbiddenError(
          "You don't have permission to delete this item"
        );
      }

      return item.deleteOne();
    })
    .then((result) => {
      // Only send response if deleteOne was called
      if (result) {
        return res.send({ message: "Item deleted" });
      }
      return undefined;
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID format"));
      }
      console.error(err);
      return next(err);
    });
};

// Adding a like to a clothing item

const likeItem = (req, res, next) => {
  // Check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
    return next(new BadRequestError("Invalid item ID format"));
  }
  return ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.status(OK).send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Requested resource not found"));
      }
      return next(err);
    });
};

// Removing a like from a clothing item
const dislikeItem = (req, res, next) => {
  // Check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
    return next(new BadRequestError("Invalid item ID format"));
  }
  return ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.status(OK).send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Requested resource not found"));
      }
      return next(err);
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
