const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");
const { validateUserUpdate } = require("../middlewares/validation");

router.get("/users/me", getCurrentUser);
router.patch("/users/me", validateUserUpdate, updateUser);

module.exports = router;
