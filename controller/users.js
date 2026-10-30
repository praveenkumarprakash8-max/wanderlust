const User = require("../models/user");
const crypto = require("crypto");

const sendVerificationEmail = require("../utils/sendVerificationEmail.js");
const sendPasswordResetEmail = require("../utils/sendPasswordResetEmail.js");

// BASE_URL from .env
const getBaseUrl = () => {
  const baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    throw new Error("BASE_URL is missing in .env");
  }

  return baseUrl.replace(/\/+$/, "");
};

// SIGNUP AND LOGIN PAGES
module.exports.rendersignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to wanderlust!");
  res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "You have logged out!");
    return res.redirect("/");
  });
};

// SIGNUP
module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      req.flash("error", "Please fill in all required fields.");
      return res.redirect("/signup");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const newUser = new User({
      username: username.trim(),
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

    const verificationUrl = `${getBaseUrl()}/verify-email/${token}`;

    try {
      await sendVerificationEmail(registeredUser.email, verificationUrl);
    } catch (emailError) {
      console.error("Verification email failed:", emailError.message);

      req.flash(
        "error",
        "Account created, but verification email failed. Please resend it.",
      );

      return res.redirect("/verify-email");
    }

    req.flash(
      "success",
      "Signup successful! Please check your email to verify your account.",
    );

    return res.redirect("/verify-email");
  } catch (err) {
    console.error("Signup error:", err.message);

    req.flash(
      "error",
      "Unable to create account. Check whether the username is already registered.",
    );

    return res.redirect("/signup");
  }
};

// EMAIL VERIFICATION PAGE
module.exports.renderVerifyEmail = (req, res) => {
  res.render("users/verify-email.ejs");
};

// RESEND VERIFICATION EMAIL
module.exports.resendVerificationEmail = async (req, res) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

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

      const verificationUrl = `${getBaseUrl()}/verify-email/${token}`;

      try {
        await sendVerificationEmail(user.email, verificationUrl);
      } catch (emailError) {
        console.error("Resend verification failed:", emailError.message);
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

// VERIFY EMAIL
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
        "Verification link is invalid or has expired. Please request a new email.",
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
    return next(err);
  }
};

// FORGOT PASSWORD PAGE
module.exports.renderForgotPassword = (req, res) => {
  res.render("users/forgot-password.ejs");
};

// SEND PASSWORD RESET EMAIL
module.exports.forgotPassword = async (req, res) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  const genericMessage =
    "If an eligible account exists for that email, a password-reset link will be sent.";

  if (!email) {
    req.flash("error", "Please enter your email address.");
    return res.redirect("/forgot-password");
  }

  try {
    const user = await User.findOne({
      email,
      isEmailVerified: true,
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");

      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

      await user.save();

      const resetUrl = `${getBaseUrl()}/reset-password/${token}`;

      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (emailError) {
        console.error("Password-reset email failed:", emailError.message);

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();
      }
    }

    req.flash("success", genericMessage);
    return res.redirect("/forgot-password");
  } catch (err) {
    console.error("Forgot password error:", err.message);

    req.flash(
      "error",
      "Unable to process your request right now. Please try again.",
    );

    return res.redirect("/forgot-password");
  }
};

// DISPLAY RESET PASSWORD PAGE
module.exports.renderResetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      req.flash("error", "This reset link is invalid or has expired.");
      return res.redirect("/forgot-password");
    }

    return res.render("users/reset-password.ejs", {
      token: req.params.token,
    });
  } catch (err) {
    return next(err);
  }
};

// RESET PASSWORD
module.exports.resetPassword = async (req, res, next) => {
  try {
    console.log("[RESET] Request received");

    const { password, confirmPassword } = req.body;
    const token = req.params.token;

    if (
      typeof password !== "string" ||
      typeof confirmPassword !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      req.flash("error", "Password must be between 8 and 128 characters.");

      return res.redirect(`/reset-password/${encodeURIComponent(token)}`);
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");

      return res.redirect(`/reset-password/${encodeURIComponent(token)}`);
    }

    console.log("[RESET] Validating token");

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    console.log("[RESET] Token lookup finished");

    if (!user) {
      req.flash("error", "This reset link is invalid or has expired.");

      return res.redirect("/forgot-password");
    }

    console.log("[RESET] Before setPassword");

    const oldHash = user.hash;
    const oldSalt = user.salt;

    await user.setPassword(password);

    console.log("[RESET] setPassword completed");
    console.log("[RESET] Hash changed:", oldHash !== user.hash);
    console.log("[RESET] Salt changed:", oldSalt !== user.salt);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    console.log("[RESET] User saved successfully");

    // DATABASE PERSISTENCE CHECK
    const savedUser = await User.findById(user._id).select("+hash +salt");

    console.log("[RESET CHECK] User found after save:", Boolean(savedUser));

    console.log(
      "[RESET CHECK] Hash persisted:",
      Boolean(savedUser?.hash) && savedUser.hash === user.hash,
    );

    console.log(
      "[RESET CHECK] Salt persisted:",
      Boolean(savedUser?.salt) && savedUser.salt === user.salt,
    );

    console.log(
      "[RESET CHECK] Username persisted:",
      savedUser?.username === user.username,
    );

    req.flash(
      "success",
      "Password reset successful. Please log in with your new password.",
    );

    return res.redirect("/login");
  } catch (err) {
    console.error("[RESET] Password reset error:", err.message);
    return next(err);
  }
};

// ACCOUNT PAGE
module.exports.renderAccount = (req, res) => {
  res.render("users/account.ejs");
};
