const express = require("express");
const router = express.Router({ mergeParams: true });
///routes have separated params, thats why merge true
const wrapAsync = require("../utilities/wrapAsync");
const validateReview = require(`../validation/validateReview`);
const isLoggedIn = require("../auth_middleware/isloggedin");
const isReviewAuthor = require(`../auth_middleware/isReviewAuthor`);
const reviews = require(`../controllers/reviews`);

//create review in campground
router.post(`/`, isLoggedIn, validateReview, wrapAsync(reviews.createReview));

//delete one review in a campground
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviews.deleteReview)
);

module.exports = router;
