const AppError = require(`../utilities/expressError`);
const Review = require(`../models/reviews`);

const isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;
  const reviewData = await Review.findById(reviewId).populate(`author`);
  if (!reviewData.author.equals(req.user.id)) {
    next(new AppError(403, `Forbidden Request`));
  }
  next();
};

module.exports = isReviewAuthor;
