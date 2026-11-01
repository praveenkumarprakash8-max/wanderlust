const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  let rating = Number(req.body.review.rating);

  if (
    !Number.isFinite(rating) ||
    rating < 0.5 ||
    rating > 5 ||
    !Number.isInteger(rating * 2)
  ) {
    req.flash("error", "Please select a valid rating.");
    return res.redirect(`/listings/${listing._id}`);
  }

  let newReview = new Review({
    ...req.body.review,
    rating,
    author: req.user._id,
  });

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "New Review Created!");

  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");

  res.redirect(`/listings/${id}`);
};
