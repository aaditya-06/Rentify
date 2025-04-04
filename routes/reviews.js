const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utility/wrapAsync.js");

const { validateReview, createReview, deleteReview } = require("../controllers/reviewController.js");

// POST Review - Add a new review to a listing
router.post("/", validateReview, wrapAsync(createReview));

// DELETE Review - Remove a review from a listing
router.delete("/:reviewId", wrapAsync(deleteReview));

module.exports = router;
