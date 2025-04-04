const express = require("express");
const router = express.Router();
const wrapAsync = require("../utility/wrapAsync.js");
const { storage } = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage });
const Listing = require("../models/listings.js");
const { isLoggedIn } = require("../middleware");
const { isOwner } = require("../middleware");

// Import controller functions
const {
  validateListings,
  renderNewListingForm,
  createListing,
  showListing,
  renderEditListingForm,
  updateListing,
  deleteListing,
} = require("../controllers/listingController.js");

// New Route - Show the form to create a new listing
router.get("/new", wrapAsync(renderNewListingForm));

// Create Route - Create a new listing
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListings,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await newListing.save();
    req.flash("success", "Listing created");
    res.redirect(`/`);
  })
);

// Show Route - Show a specific listing by ID
router.get("/:id", wrapAsync(showListing));

// Edit Route - Show the form to edit a listing by ID
router.get("/:id/edit", wrapAsync(renderEditListingForm));

// Update Route - Update a specific listing by ID
router.put("/:id", validateListings, wrapAsync(updateListing));

// Delete Route - Delete a specific listing by ID
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(deleteListing));

module.exports = router;
