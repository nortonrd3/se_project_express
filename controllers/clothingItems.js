const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  OK,
  CREATED,
  FORBIDDEN,
} = require("../utils/errors");

// Create a clothing item
const createItem = (req, res) => {
  const owner = req.user._id;

  const { name, weather, imageUrl } = req.body;

  if (!name || !weather || !imageUrl) {
    return res.status(BAD_REQUEST).send({
      message: "Name, weather, and imageUrl are required",
    });
  }

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      // eslint-disable-next-line no-console
      console.log(item);
      res.status(CREATED).send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({
          message: err.message,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error has occurred on the server while creating the item",
      });
    });
};

// GET all clothing items

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => {
      res.status(OK).send({ data: items });
    })
    .catch((err) => {
      console.error(err);
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error has occurred on the server while getting the items",
      });
    });
};

// Update a clothing item

// const updateItem = (req, res) => {
//   const { itemId } = req.params;
//   const { name, weather, imageUrl } = req.body;

//   ClothingItem.findByIdAndUpdate(
//     itemId,
//     { $set: { name, weather, imageUrl } },
//     { new: true }
//   )
//     .orFail()
//     .then((item) => {
//       res.status(OK).send({ data: item });
//     })
//     .catch((err) => {
//       console.error(err);
//       if (err.name === "ValidationError") {
//         return res.status(BAD_REQUEST).send({
//           message: err.message,
//         });
//       }
//       if (err.name === "DocumentNotFoundError") {
//         return res.status(NOT_FOUND).send({
//           message: "Requested resource not found",
//         });
//       }
//       return res.status(INTERNAL_SERVER_ERROR).send({
//         message: "An error has occurred on the server while updating the item",
//       });
//     });
// };

// Delete a clothing item

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  return ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) {
        res.status(NOT_FOUND).send({ message: "Item not found" });
        return Promise.reject(new Error("Item not found"));
      }

      if (!item.owner.equals(userId)) {
        res.status(FORBIDDEN).send({
          message: "You don't have permission to delete this item",
        });
        return Promise.reject(new Error("Forbidden"));
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
      if (err.message === "Item not found" || err.message === "Forbidden") {
        // Response already sent, do nothing
        return undefined;
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message: "Invalid item ID format",
        });
      }
      console.error(err);
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error occurred on the server while deleting the item",
      });
    });
};

// Adding a like to a clothing item

const likeItem = (req, res) => {
  // Check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
    return res.status(BAD_REQUEST).send({
      message: "Invalid item ID format",
    });
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
        return res.status(NOT_FOUND).send({
          message: "Requested resource not found",
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error has occurred on the server while liking the item",
      });
    });
};

// Removing a like from a clothing item
const dislikeItem = (req, res) => {
  // Check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
    return res.status(BAD_REQUEST).send({
      message: "Invalid item ID format",
    });
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
        return res.status(NOT_FOUND).send({
          message: "Requested resource not found",
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error has occurred on the server while disliking the item",
      });
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
