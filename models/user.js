const { compare } = require('bcryptjs');
const mongoose = require('mongoose'); // Import mongoose
const { Schema } = mongoose; // Destructure Schema from mongoose
const ROLES = require('../config/constants');
const { isEmail } = require('validator');

/**
 * UserSchema defines the structure of the user data in the database.
 * This schema handles different types of users, including tourists, guides, and admins.
 * The guide data are embedded in the user schema and will only be populated if the user is a guide.
 */

const UserSchema = new Schema({
    username: { type: String, unique: true, index: true },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: [isEmail, 'Invalid email address']
    },
    role: { type: String, enum: [ROLES.TOURIST, ROLES.GUIDE, ROLES.ADMIN], index: true },
    verified: { type: Boolean, default: false },  // Email verification status
    password_hash: { type: String },
    reset_code: { type: String },
    reset_code_expiry: { type: Date },
    refresh_token: { type: String },
    refresh_token_expiry: { type: Date },
    status: { type: String, enum: ['active', 'blocked', 'inactive'], default: 'active'},

    /** User profile data */
    profile: {
        full_name: { type: String, default: null },
        bio: { type: String, default: null },
        profile_picture: { type: String, default: null },
    },

    /** Tourist guide data */
    guide_data: {
      company_name: { type: String },
      nationality: { type: String },
      languages: [{ type: String }],
        certifications: [
            {
                file_name: { type: String },
                file_url: { type: String },
                uploaded_at: { type: Date },
                status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
            }
        ],
        areas_of_expertise: [{ type: String }],
        availability: {
            days: [{ type: String }],
            times: { type: String },
        },
        social_media: {
            facebook: { type: String },
            tiktok: { type: String },
            twitter: { type: String },
            instagram: { type: String },
            linkedin: { type: String },
        },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        verified: { type: Boolean, default: false },  // Verified guide status
        verified_by: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    },

    followers: [{ type: Schema.Types.ObjectId, ref: "User" }], // List of user IDs following this user
    following: [{ type: Schema.Types.ObjectId, ref: "User" }], // List of user IDs this user is following

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },

    preferences: {
        species: [{ type: Schema.Types.ObjectId, ref: 'Species' }],
        activities: [{ type: String }],
    },

    history: [{ type: Schema.Types.ObjectId, ref: 'Sighting' }],
});

// Add text index for username and full name
UserSchema.index({
    username: "text",
    "profile.full_name": "text"
}, {
    weights: {
        username: 3,
        "profile.full_name": 1
    }
});

// Create the User model
const User = mongoose.model('User', UserSchema);

// Export the User model
module.exports = User;
