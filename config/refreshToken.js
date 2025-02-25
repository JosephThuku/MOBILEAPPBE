const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");



/**
 * 
 * @param {*} id  - the user id
 * @returns  - the generated refresh token
 */
const generateRefreshToken = (id) => {
    try {
      return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "1d" });
    } catch (error) {
      console.error("Error generating refresh token:", error.message);
      throw new Error("Failed to generate refresh token");
    }
  };


/**
 * Decodes and verifies the provided refresh token.
 * @param {string} refreshToken - The refresh token to decode.
 * @returns {object|null} - The decoded token if valid, otherwise throws an error.
 */
const decodeRefreshToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error("JWT verification error: Token has expired");
            throw new Error("Token has expired");
        } else if (error.name === 'JsonWebTokenError') {
            console.error("JWT verification error: Invalid token");
            throw new Error("Token is invalid");
        } else {
            console.error("JWT verification error:", error.message);
            throw new Error("Token is invalid or expired");
        }
    }
};
module.exports = { generateRefreshToken, decodeRefreshToken };