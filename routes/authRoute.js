const express = require('express');
const { authMiddleware } = require("../middleware/authMiddleware");
const { signup, validateSignup, login, verifyUser, forgotPassword, resetPassword, resendCode, refreshTokenHandler } = require('../controller/authController');
const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', login);
router.post('/verify', verifyUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-reset-code', resendCode);
router.post('/refresh-token', refreshTokenHandler);

module.exports = router;