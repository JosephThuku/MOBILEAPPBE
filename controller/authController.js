const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail, sendResetCode } = require("../helpers/sendEmail");
const { check, validationResult } = require('express-validator');
const { hashPassword, sendVerification } = require("../services/authService");
const {generateToken, verifyToken} = require("../config/jwtToken");
const {generateRefreshToken,  decodeRefreshToken} = require("../config/refreshToken");

const validateSignup = [
    check('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    check('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/\d/).withMessage('Password must contain a number'),
    check('username')
      .notEmpty().withMessage('Username is required')
  ];
  

const signup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        const { email, username, password, guide = false } = req.body;
        const { company_name, nationality } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email or username already exists" });
        }

        const hashedPassword = await hashPassword(password, 12);
        
        const newUser = new User({
            email,
            username,
            password_hash: hashedPassword,
            role: guide ? "guide" : "tourist",
        });

        if (guide) {
            newUser.guide_data = {
                company_name: req.body.company_name,
                Nationality: req.body.nationality,
            };
        }

        await newUser.save();

        await sendVerification(newUser);
        res.status(201).json({ message: "User created successfully. Please check your email for verification." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const verifyUser = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is already verified
        if (user.verified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        // Check if the verification code matches and hasn't expired
        if (user.reset_code !== verificationCode || user.reset_code_expiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        // Update user verification status
        user.verified = true;
        user.reset_code = undefined;
        user.reset_code_expiry = undefined;

        await user.save();

        res.status(200).json({ message: "User verified successfully" });
    } catch (error) {
        console.error("The following error occurred while verifying the user: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check if the user's email is verified
        if (!user.verified) {
            return res.status(403).json({ message: "Please verify your email before logging in" });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.role);

        // Generate refresh token and invalidate the old one
        const refreshToken = generateRefreshToken(user._id);
        user.refresh_token = refreshToken;
        user.refresh_token_expiry = process.env.REFRESH_TOKEN_EXPIRES_IN;
        await user.save();

        res.json({
            userId: user._id,
            userRole: user.role,
            token,
            refreshToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is already verified
        if (!user.verified) {
            return res.status(400).json({ message: "Please verify your email before resetting the password" });
        }

        // Generate a reset code number and char combination
        const reset_code = Math.random().toString(36).slice(2, 8).toUpperCase();
        user.reset_code = reset_code;
        user.reset_code_expiry = Date.now() + 3600000; // 1 hour

        await user.save();

        // Send reset password email
        await sendResetCode(user);

        res.status(200).json({ message: "Reset code sent to your email" });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the reset code matches and hasn't expired
        if (user.reset_code !== resetCode || user.reset_code_expiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword, 12);


        // Update user's password and clear reset code fields
        user.password_hash = hashedPassword;
        user.reset_code = undefined;
        user.reset_code_expiry = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const resendCode = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User
            .findOne({ email });
            
        if (!user) {
            return res.status(404).json({ message: `User with email ${email} not found` });
        }

        // Generate a verification code number and char combination
        const reset_code = Math.random().toString(36).slice(2, 8).toUpperCase();
        user.reset_code = reset_code;

        user.reset_code_expiry = Date.now() + 3600000; // 1 hour

        await user.save();

        // Send verification email
        await sendVerification(user);

        res.status(200).json({ message: "Verification code sent to your email" });
    }

    catch (error) {
        console.error("Error in resendCode:", error);
        res.status(500).json({ message: "Internal server error" });
    }

};


const refreshTokenHandler = async (req, res) => {
    try {
        const providedRefreshToken = req.body.refreshToken;

        if (!providedRefreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }

        console.log("providedRefreshToken", providedRefreshToken);

        // Decode the user ID from the provided refresh token
        let userobj;
        try {
            userobj = decodeRefreshToken(providedRefreshToken);
        } catch (error) {
            return res.status(401).json({ message: error.message });
        }
        if (!userobj) {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }
        // Find the user by id
        const user = await User.findById(userobj.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the provided refresh token matches the stored one
        if (user.refresh_token !== providedRefreshToken) {
            return res.status(403).json({ message: "Token mismatch - unauthorized" });
        }

        // Check token expiry
        const now = Date.now();
        if (user.refresh_token_expiry && user.refresh_token_expiry < now) {
            console.log("Refresh token has expired for user:", user._id);
            return res.status(401).json({ message: "Refresh token has expired" });
        }

        // Generate a new JWT token
        const token = generateToken(user._id, user.role);
        res.json({ success: true, token });
    } catch (error) {
        console.error("Error in refreshTokenHandler:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
module.exports = {
    signup,
    validateSignup,
    login,
    verifyUser,
    forgotPassword,
    resetPassword,
    resendCode,
    refreshTokenHandler
};
