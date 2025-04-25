const router = require('express').Router();
const userRouter = require('./Users');

router.use('/users', userRouter);

module.exports = router;