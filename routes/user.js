const express = require("express");
const router = express.Router();

const passport = require("passport");
const User = require("../models/user.js");

const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controller/users.js");

// SIGNUP
router
  .route("/signup")
  .get(userController.rendersignupForm)
  .post(wrapAsync(userController.signup));

// EMAIL VERIFICATION
router.get("/verify-email", userController.renderVerifyEmail);

router.get("/verify-email/:token", wrapAsync(userController.verifyEmail));

router.post(
  "/resend-verification",
  wrapAsync(userController.resendVerificationEmail),
);

// FORGOT PASSWORD
router.get("/forgot-password", userController.renderForgotPassword);

router.post("/forgot-password", wrapAsync(userController.forgotPassword));

// RESET PASSWORD
router.get(
  "/reset-password/:token",
  wrapAsync(userController.renderResetPassword),
);

router.post("/reset-password/:token", wrapAsync(userController.resetPassword));

// LOGIN WITH USERNAME OR EMAIL
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(saveRedirectUrl, async (req, res, next) => {
    try {
      const identifier =
        typeof req.body.username === "string" ? req.body.username.trim() : "";

      if (!identifier) {
        req.flash("error", "Enter your username or email.");
        return res.redirect("/login");
      }

      if (identifier.includes("@")) {
        const user = await User.findOne({
          email: identifier.toLowerCase(),
        });

        if (user) {
          req.body.username = user.username;
        } else {
          req.body.username = identifier;
        }
      } else {
        req.body.username = identifier;
      }

      passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

        if (!user) {
          req.flash(
            "error",
            info?.message || "Invalid username/email or password.",
          );

          return res.redirect("/login");
        }

        if (!user.isEmailVerified) {
          req.flash("error", "Please verify your email before logging in.");

          return res.redirect("/verify-email");
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) return next(loginErr);

          return userController.login(req, res, next);
        });
      })(req, res, next);
    } catch (err) {
      return next(err);
    }
  });

// GOOGLE OAUTH
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/auth/google/callback",
  saveRedirectUrl,
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login,
);

// ACCOUNT AND LOGOUT
router.get("/account", isLoggedIn, userController.renderAccount);

router.get("/logout", userController.logout);

module.exports = router;
