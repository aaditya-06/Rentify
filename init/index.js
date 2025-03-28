const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listings.js");


mongoose
  .connect("mongodb://localhost/Rentify")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

const initDB = async () => {
  await listing.deleteMany({});
  await listing.insertMany(initData.data);
  console.log("Database initialized with initial data");
};

initDB();
