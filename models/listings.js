const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: {
      type: String,
      default:
        "https://4kwallpapers.com/images/wallpapers/tulips-field-3840x2160-21582.jpg",
      set: (v) =>
        v === ""
          ? "https://4kwallpapers.com/images/wallpapers/tulips-field-3840x2160-21582.jpg"
          : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true },
);

listingSchema.pre("findOneAndDelete", async function (next) {
  const listing = await this.model.findOne(this.getQuery());
  if (listing && listing.reviews.length > 0) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
  next();
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
