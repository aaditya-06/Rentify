const Listing = require("../models/listings.js");
const ExpressError = require("../utility/expressError.js");
const { listingSchema } = require("../schema.js");

// Middleware: Validate listing data
const validateListings = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    // Return next() with error instead of throwing directly
    return next(new ExpressError(error.details[0].message, 400));
  }
  next();
};

// Show form to create a new listing
const renderNewListingForm = (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.render("listings/new");
};

// Create a new listing
const createListing = async (req, res, next) => {
  const newListing = new Listing(req.body.listing);

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }
  await newListing.save();

  req.flash("success", "Listing created");
  return res.redirect("/");
};

// Show a specific listing by ID
const showListing = async (req, res, next) => {
  const { id } = req.params;
  console.log("Fetching listing with ID:", id); // Debugging

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/");
  }

  // Format price for display
  const priceFormatted = listing.price.toLocaleString("en-IN");
  return res.render("listings/show", { listing, priceFormatted });
};

// Show the form to edit a listing
const renderEditListingForm = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/");
  }

  return res.render("listings/edit", { listing });
};

// Update a listing by ID
const updateListing = async (req, res, next) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  req.flash("success", "Listing updated successfully!");
  console.log("Flash Messages (After Update):", req.session.flash);
  return res.redirect(`/listings/${id}`);
};

// Delete a listing by ID
const deleteListing = async (req, res, next) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted");
  console.log("Flash Messages (After Delete):", req.session.flash);
  return res.redirect("/");
};

module.exports = {
  validateListings,
  renderNewListingForm,
  createListing,
  showListing,
  renderEditListingForm,
  updateListing,
  deleteListing,
};
