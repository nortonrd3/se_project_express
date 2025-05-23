const router = require("express").Router();
const clothingItemsRouter = require("./clothingItems");
const userRouter = require("./users");
const { NOT_FOUND } = require("../utils/errors");
const {
  login,
  createUser,
} = require("../controllers/users");
const auth = require("../middlewares/auth");

// Public routes
router.post("/signup", createUser);
router.post("/signin", login);

router.use("/items", clothingItemsRouter);


// Authentication middleware
router.use(auth);

// All routes below this line require authentication

router.use("/", userRouter);
router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Requested resource not found" });
});

module.exports = router;
