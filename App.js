const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const wrapAsync = require("./utility/wrapAsync.js");
const ExpressError = require("./utility/expressError.js");

const Listing = require("./models/listings.js");
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

// Set up the MongoDB connection for sessions
// const dbUrl = "mongodb://127.0.0.1:27017/Rentify";

const dbUrl = process.env.ATLASDB;
const secret = process.env.SECRET;

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Configure session store with connect-mongo
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600, // time period in seconds
  crypto: {
    secret: secret,
  },
});

store.on("error", (req, res) => {
  console.log("error in MongoStore", err);
});

const sessionOption = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true,
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
  res.locals.currentUser = req.user; // Passport provides req.user after login
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Index Route - Show all listings
app.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).sort({ createdAt: -1 });
    res.render("listings/index", { allListings });
  })
);

app.use("/listings", listingRoutes);
app.use("/listings/:listingId/reviews", reviews);
app.use("/", User);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error Handling Middleware in Express
app.use((err, req, res, next) => {
  res.render("error.ejs", { err });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
