const express = require('express');
const { register, confirm, login, resendConfirmationCode } = require('../Controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/confirm', confirm);
router.post('/login', login);
router.post('/resend', resendConfirmationCode);


module.exports = router;