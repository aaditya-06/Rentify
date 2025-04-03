const express = require("express");
const router = express.Router({ mergeParams: true }); // Enables access to listingId

// Middleware to check if listing exists before allowing delete or update
const wrapAsync = require("../utility/wrapAsync.js");
const ExpressError = require("../utility/expressError.js");

// Review Route - Get All Reviews
const { reviewSchema } = require("../schema.js");

const Listing = require("../models/listings.js"); // Import Listing model
const Review = require("../models/review.js");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.details[0].message, 400); // Show specific error message
  }
  next();
};

// Review Route - Post Review
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.listingId);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }

    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review added successfully!");
    res.redirect(`/listings/${req.params.listingId}`);
  })
);

// Review Delete Route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { listingId, reviewId } = req.params;

    await Listing.findByIdAndUpdate(listingId, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${listingId}`);
  })
);

module.exports = router;
