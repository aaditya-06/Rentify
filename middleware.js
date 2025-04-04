// middleware/index.js
const Listing = require("./models/listings");
const ExpressError = require("./utility/expressError");

// Middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

// Middleware to check if current user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
