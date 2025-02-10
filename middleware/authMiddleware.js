const User = require("../models/user");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

/**
 * Middleware to authenticate users based on JWT token.
 * This middleware checks for the presence of a token in the 
 * Authorization header, verifies it, and attaches the user 
 * object to the request if valid.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  
  // Check if the Authorization header is present and starts with "Bearer"
  if (!req?.headers?.authorization?.startsWith("Bearer")) {
    return res.status(401).json({ 
      success: false, 
      message: "No token attached to the header" 
    });
  }
  
  // Extract the token from the Authorization header
  token = req.headers.authorization.split(" ")[1];
  
  // If no token is found, return an error
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Token is required" 
    });
  }
  
  try {
    // Verify the token and decode the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id;
    
    // If user ID is not found in the token, return an error
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    console.log(`Authenticated User ID: ${userId}`);
    
    // Fetch user once and store in req.user
    const user = await User.findById(userId);
    
    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Attach the user object to the request for further use
    req.user = user;
    next();
    
  } catch (error) {
    // Handle token verification errors
    return res.status(401).json({ 
      success: false, 
      message: "Token expired or invalid, please login again",
      error: error.message 
    });
  }
});

/**
 * Middleware to check if the authenticated user has admin role.
 * If the user is not an admin, a 403 Forbidden response is sent.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const isAdmin = asyncHandler((req, res, next) => {
  // Check if the user's role is not admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      success: false, 
      message: "Unauthorized access. Only admins are allowed." 
    });
  }
  next();
});

/**
 * Middleware to check if the authenticated user has guide role.
 * If the user is not a guide, a 403 Forbidden response is sent.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const isGuide = asyncHandler((req, res, next) => {
  // Check if the user's role is not guide
  if (req.user.role !== "guide") {
    return res.status(403).json({ 
      success: false, 
      message: "Unauthorized access. Only guides are allowed." 
    });
  }
  next();
});

module.exports = { authMiddleware, isAdmin, isGuide };