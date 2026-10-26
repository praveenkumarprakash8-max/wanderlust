const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controller/users.js");

router
  .route("/signup")
  .get(userController.rendersignupForm)
  .post(wrapAsync(userController.signup));

// Email verification route
router.get("/verify-email/:token", wrapAsync(userController.verifyEmail));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(saveRedirectUrl, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        req.flash("error", info?.message || "Invalid username or password.");
        return res.redirect("/login");
      }

      if (!user.isEmailVerified) {
        req.flash("error", "Please verify your email before logging in.");
        return res.redirect("/login");
      }

      req.logIn(user, (err) => {
        console.log("LOGIN ROUTE HIT");
        console.log("USER FOUND:", !!user);
        console.log("EMAIL VERIFIED:", user?.isEmailVerified);

        if (err) {
          return next(err);
        }

        return userController.login(req, res, next);
      });
    })(req, res, next);
  });

// Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google callback
router.get(
  "/auth/google/callback",
  saveRedirectUrl,
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login,
);

router.get("/account", isLoggedIn, userController.renderAccount);

router.get("/logout", userController.logout);

module.exports = router;
