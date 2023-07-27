const mongoose = require("mongoose");
const Review = require("./reviews");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: {
    type: String,
  },
  filename: {
    type: String,
  },
});

imageSchema.virtual("thumbnailSizeImage").get(function () {
  return this.url.replace("/upload", "/upload/c_thumb,h_200,w_300");
});

const campgroundSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    images: [imageSchema],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: `Review`,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: `User`,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { toJSON: { virtuals: true } }
);

campgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this.id}">${this.title}</a></strong>`;
});

//delete all reviews once a campground is deleted
campgroundSchema.post("findOneAndDelete", async (deletedCampground) => {
  if (deletedCampground) {
    const { reviews } = deletedCampground;
    await Review.deleteMany({
      _id: { $in: reviews.map((review) => review.id) },
    });
  }
});

module.exports = mongoose.model(`Campground`, campgroundSchema);
