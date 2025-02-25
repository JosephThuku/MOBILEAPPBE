const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3d" });
}

// verify token function
const verifyToken = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("JWT verification error:", error.message);
      throw new Error("Token is invalid or expired");
    }
  };
module.exports = { generateToken, verifyToken };