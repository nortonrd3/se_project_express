const router = require("express").Router();
const auth = require("../middlewares/auth");
const { validateClothingItem, validateId } = require("../middlewares/validation");
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

// Get all clothing items

router.get("/", getItems);

// Middleware to check authentication -- all routes below this line require authentication
router.use(auth);


// Create a clothing item

router.post("/", validateClothingItem, createItem);

// Delete a clothing item

router.delete("/:itemId", validateId, deleteItem);

// Like a clothing item

router.put("/:itemId/likes", validateId, likeItem);

// Dislike a clothing item

router.delete("/:itemId/likes", validateId, dislikeItem);

module.exports = router;
