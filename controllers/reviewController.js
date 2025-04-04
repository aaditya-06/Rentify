const Listing = require("../models/listings.js");
const Review = require("../models/review.js");
const ExpressError = require("../utility/expressError.js");
const { reviewSchema } = require("../schema.js");

// Middleware: Validate review data using Joi
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return next(new ExpressError(error.details[0].message, 400));
  }
  next();
};

// Create Review: Adds a new review to a listing
const createReview = async (req, res, next) => {
  const listing = await Listing.findById(req.params.listingId);
  const review = new Review(req.body.review);

  if (!listing) {
    return next(new ExpressError("Listing not found", 404));
  }

  const newReview = new Review(req.body.review);
  
  review.user = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  req.flash("success", "Review added successfully!");
  return res.redirect(`/listings/${req.params.listingId}`);
};

// Delete Review: Removes a review from a listing
const deleteReview = async (req, res, next) => {
  const { listingId, reviewId } = req.params;

  await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted!");
  return res.redirect(`/listings/${listingId}`);
};

module.exports = {
  validateReview,
  createReview,
  deleteReview,
};
