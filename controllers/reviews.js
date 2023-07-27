const Review = require(`../models/reviews`);
const Campground = require(`../models/campground`);

module.exports.createReview = async (req, res, next) => {
  const { id } = req.params;
  const reviewedCampground = await Campground.findById(id).populate(`author`);
  const { review } = req.body;
  const newReview = new Review({
    rating: review.rating,
    body: review.body,
    author: req.user,
  });
  await newReview.save();
  reviewedCampground.reviews.push(newReview);
  await reviewedCampground.save();
  req.flash("success", "Review Created!");
  res.redirect(302, `/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res, next) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(
    id,
    { $pull: { reviews: reviewId } },
    { new: true }
  );
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(302, `/campgrounds/${id}`);
};
