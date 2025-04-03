const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const wrapAsync = require("./utility/wrapAsync.js");
const ExpressError = require("./utility/expressError.js");

const Listing = require("./models/listings.js")
;
const listingRoutes = require("./routes/listingRoute.js");
const reviews = require("./routes/reviews.js");
const User = require("./routes/user.js");


const passport = require("passport");
const localStrategy = require("passport-local");
const user = require("./models/user.js");

const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/Public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionOption = {
  secret: "secretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // force cross terror protection
  },
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user; // `req.user` is provided by Passport.js when a user is logged in
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// app.get("/demo", async (req, res) => {
//   let fake = new user({
//     email: "demo@gmail.com",
//     username: "demo",
//   });

//   let register = await user.register(fake, "password");
//   res.send(register);
// });

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
    const allListings = await Listing.find({}).sort({ createdAt: -1 }); // Sort by newest first;
    res.render("listings/index", { allListings });
  })
);

//  Use listingRoutes correctly
app.use("/listings", listingRoutes);
app.use("/listings/:listingId/reviews", reviews);
app.use("/", User);

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
