const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const expressError = require("../utils/expressError.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const reviewController = require("../controller/reviews.js");

//Reviews Post route
router.post(
  "/",
  validateReview,
  isLoggedIn,
  wrapAsync(reviewController.createReview),
);

// Review Delete Route
router.delete(
  "/:reviewId",
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview),
);

module.exports = router;
