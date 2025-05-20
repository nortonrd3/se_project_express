const router = require("express").Router();
const clothingItemsRouter = require("./clothingItems");
const { NOT_FOUND } = require("../utils/errors");
const {
  login,
  createUser,
  getCurrentUser,
  updateUser,
} = require("../controllers/users");
const auth = require("../middlewares/auth");

// Public routes
router.post("/signup", createUser);
router.post("/signin", login);


// Authentication middleware
router.use(auth);

// All routes below this line require authentication

router.get("/users/me", getCurrentUser);
router.patch("/users/me", updateUser);
router.use("/items", clothingItemsRouter);
router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Requested resource not found" });
});

module.exports = router;
