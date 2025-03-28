const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  location: String,
  image: {
    type: String,
    default:
      "https://4kwallpapers.com/images/wallpapers/tulips-field-3840x2160-21582.jpg",
    set: (v) =>
      v === ""
        ? "https://4kwallpapers.com/images/wallpapers/tulips-field-3840x2160-21582.jpg"
        : v,
  },
  country: String,
});

const listing = mongoose.model("listing", listingSchema);

module.exports = listing;
