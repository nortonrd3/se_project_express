const router = require("express").Router();
const auth = require("../middlewares/auth");
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

router.post("/", createItem);

// Delete a clothing item

router.delete("/:itemId", deleteItem);

// Like a clothing item

router.put("/:itemId/likes", likeItem);

// Dislike a clothing item

router.delete("/:itemId/likes", dislikeItem);

module.exports = router;
