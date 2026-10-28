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
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "You have logged out!");
    res.redirect("/");
  });
};

// Signup and send verification email
module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const newUser = new User({
      username,
      email: normalizedEmail,
      isEmailVerified: false,
    });

    const registeredUser = await User.register(newUser, password);

    const token = crypto.randomBytes(32).toString("hex");

    registeredUser.emailVerificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    registeredUser.emailVerificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await registeredUser.save();

    const verificationUrl = `${process.env.BASE_URL}/verify-email/${token}`;

    try {
      await sendVerificationEmail(registeredUser.email, verificationUrl);
    } catch (emailError) {
      console.error("Verification email failed:", emailError.message);

      // Keep the unverified account so the user can request another email.
      req.flash(
        "error",
        "Your account was created, but the verification email could not be sent. Please try resending the email.",
      );

      return res.redirect("/verify-email");
    }

    req.flash(
      "success",
      "Signup successful! Please check your email to verify your account.",
    );

    return res.redirect("/verify-email");
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/signup");
  }
};

// Show the verification instructions page
module.exports.renderVerifyEmail = (req, res) => {
  res.render("users/verify-email.ejs");
};

// Resend verification email
module.exports.resendVerificationEmail = async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();

  // Use a generic message to avoid revealing account status.
  const genericMessage =
    "If an unverified account exists for that email, a verification link will be sent.";

  try {
    if (!email) {
      req.flash("error", "Please enter your email address.");
      return res.redirect("/verify-email");
    }

    const user = await User.findOne({ email });

    if (user && !user.isEmailVerified) {
      const token = crypto.randomBytes(32).toString("hex");

      user.emailVerificationToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      user.emailVerificationExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );

      await user.save();

      const verificationUrl = `${process.env.BASE_URL}/verify-email/${token}`;

      try {
        await sendVerificationEmail(user.email, verificationUrl);
      } catch (emailError) {
        console.error("Resend verification email failed:", emailError.message);
      }
    }

    req.flash("success", genericMessage);
    return res.redirect("/verify-email");
  } catch (err) {
    console.error("Resend verification error:", err.message);
    req.flash("success", genericMessage);
    return res.redirect("/verify-email");
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
        "Verification link is invalid or has expired. Please request a new verification email.",
      );
      return res.redirect("/verify-email");
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
