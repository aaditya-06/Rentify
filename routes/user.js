const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utility/wrapAsync.js");
const User = require("../models/user.js");

// GET - Signup form
router.get("/signup", (req, res) => {
  res.render("./user/signup.ejs");
});

// POST - Signup logic with auto-login
router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);

      // Auto-login after registration
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Rentify!");
        res.redirect("/");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  })
);

// GET - Login form
router.get("/login", (req, res) => {
  res.render("./user/login.ejs");
});

// POST - Login logic
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/");
  })
);

// GET - Logout route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/");
  });
});

module.exports = router;
