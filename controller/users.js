const User = require("../models/user");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerificationEmail.js");

module.exports.rendersignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to wanderlust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have logged out!");
    res.redirect("/");
  });
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({
      email,
      username,
      isEmailVerified: false,
    });

    const registeredUser = await User.register(newUser, password);

    // Generate a secure verification token
    const token = crypto.randomBytes(32).toString("hex");

    // Store only the hashed token in the database
    registeredUser.emailVerificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    registeredUser.emailVerificationExpires = new Date(
      Date.now() + 15 * 60 * 1000,
    );

    await registeredUser.save();

    const verificationUrl = `${process.env.BASE_URL}/verify-email/${token}`;

    try {
      await sendVerificationEmail(email, verificationUrl);
    } catch (emailError) {
      console.error("Verification email failed:", emailError.message);

      // Remove the account if the verification email could not be sent
      await User.deleteOne({ _id: registeredUser._id });

      req.flash(
        "error",
        "Verification email could not be sent. Please check your email settings and try again.",
      );
      return res.redirect("/signup");
    }

    req.flash(
      "success",
      "Signup successful! Please check your email to verify your account.",
    );

    return res.redirect("/login");
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup");
  }
};

// Verify user's email address
module.exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      req.flash(
        "error",
        "Verification link is invalid or has expired. Please sign up again.",
      );
      return res.redirect("/signup");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    req.flash("success", "Email verified successfully! You can now log in.");

    return res.redirect("/login");
  } catch (err) {
    next(err);
  }
};

module.exports.renderAccount = (req, res) => {
  res.render("users/account.ejs");
};
