const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utility/wrapAsync.js");
const ExpressError = require("./utility/expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const passport = require("passport");
const localStrategy = require("passport-local");

const Listing = require("./models/listings.js");
const User = require("./models/user.js");
const Review = require("./models/review.js");
const listingRoutes = require("./routes/listingRoute.js");

const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/Public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

mongoose
  .connect("mongodb://127.0.0.1:27017/Rentify")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// Index Route - Show all listings
app.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.details[0].message, 400); // Show specific error message
  }
  next();
};

//  Use listingRoutes correctly
app.use("/listings", listingRoutes);

// Review Route - Post Review
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }

    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    //  Fix incorrect redirect parameter
    res.redirect(`/listings/${req.params.id}`);
  })
);

// Review Delete Route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error Handling Middleware in Express
app.use((err, req, res, next) => {
  // let { status = 505, message = "The page you're looking for doesn't exist or has been moved." } = err;
  res.render("error.ejs", { err });
  // res.status(status).send(message);
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
