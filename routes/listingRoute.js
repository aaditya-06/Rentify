const express = require("express");
const router = express.Router();
const Listing = require("../models/listings.js"); //  Import Listing model
const wrapAsync = require("../utility/wrapAsync.js"); //  Import wrapAsync
const { listingSchema } = require("../schema.js"); //  Import listingSchema for validation
const ExpressError = require("../utility/expressError.js"); // Import ExpressError

const validateListings = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.details[0].message, 400); // Show specific error message
  }
  next();
};

// New Route - Show the form to create a new listing
router.get(
  "/new",
  wrapAsync(async (req, res) => {
    res.render("listings/new");
  })
);

// Create Route - Create a new listing
router.post(
  "/",
  validateListings,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/");
  })
);

// Show Route - Show a specific listing by ID
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log("Fetching listing with ID:", id); // Debugging
    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
      console.log("Listing not found!");
      return res.status(404).send("Listing not found");
    }

    // Format price for display
    const priceFormatted = listing.price.toLocaleString("en-IN");

    res.render("listings/show", { listing, priceFormatted });
  })
);

// Edit Route - Show the form to edit a specific listing by ID
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
  })
);

// Update Route - Update a specific listing by ID
router.put(
  "/:id",
  validateListings,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route - Delete a specific listing by ID
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/");
  })
);

module.exports = router;
