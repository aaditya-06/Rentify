const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/Public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

mongoose
  .connect("mongodb://127.0.0.1:27017/Rentify", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// Index Route - Show all listings
app.get("/", async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).send("Internal Server Error");
  }
});

// New Route - Show the form to create a new listing
app.get("/listings/new", async (req, res) => {
  res.render("listings/new");
});

// Create Route - Create a new listing
app.post("/listings", async (req, res) => {
  // let { title, description, price, location, country, image } = req.body;
  // let listing = req.body.listing;
  // console.log("listing");

  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/");
});

// Edit Route - Show the form to edit a specific listing by ID
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
});

// Update Route - Update a specific listing by ID
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

// Delete Route - Delete a specific listing by ID
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/");
})

// Show Route - Show a specific listing by ID
app.get("/listings/:id", async (req, res) => {
  try {
    let { id } = req.params;
    console.log("Fetching listing with ID:", id); // Debugging
    const listing = await Listing.findById(id);

    if (!listing) {
      console.log("Listing not found!");
      return res.status(404).send("Listing not found");
    }

    res.render("listings/show", { listing });
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
