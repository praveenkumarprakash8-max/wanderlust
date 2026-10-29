const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  emailVerificationToken: {
    type: String,
    default: undefined,
  },

  emailVerificationExpires: {
    type: Date,
    default: undefined,
  },

  // Password reset
  passwordResetToken: {
    type: String,
    default: undefined,
  },

  passwordResetExpires: {
    type: Date,
    default: undefined,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
