const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('../helpers/sendEmail');

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

const sendVerification = async (user) => {
    const reset_code = Math.random().toString(36).slice(2, 8).toUpperCase();
    user.reset_code = reset_code;
    user.reset_code_expiry = Date.now() + 3600000; // 1 hour
    await user.save();
    await sendVerificationEmail(user);
};

module.exports = {
    hashPassword,
    sendVerification
};
