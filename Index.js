const express = require("express");
const app = express();
const port = 8080;

const mongoose = require("mongoose");
const Listing = require("./models/listings.js");

app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://localhost/Rentify")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/testlisting", async (req, res) => {
  let samplelisting = new Listing({
    title: "Sample Listing",
    description: "This is a sample listing.",
    price: 20000,
    location: "New Jersey",
    images: [
      "https://4kwallpapers.com/images/wallpapers/rose-blackpink-3840x2160-21596.jpg",
      "https://4kwallpapers.com/images/wallpapers/rose-blackpink-3840x2160-21629.jpg",
    ],
    country: "United Kinngdom",
  });

  await samplelisting.save();
  console.log("Working");
  res.send("Test listing working");
});

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
