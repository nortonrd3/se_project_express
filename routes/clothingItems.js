const router = require("express").Router();
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

// Create a clothing item

router.post("/", createItem);

// Read all clothing items

router.get("/", getItems);

// Update a clothing item

// router.put("/:itemId", updateItem);

// Delete a clothing item

router.delete("/:itemId", deleteItem);

// Like a clothing item

router.put("/:itemId/likes", likeItem);

// Dislike a clothing item

router.delete("/:itemId/likes", dislikeItem);

module.exports = router;
