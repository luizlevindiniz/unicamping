const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilities/wrapAsync");
const validateCampground = require(`../validation/validateCampground`);
const isLoggedIn = require("../auth_middleware/isLoggedIn");
const isAuthor = require(`../auth_middleware/isAuthor`);
const campgrounds = require(`../controllers/campgrounds`);
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

///CAMPGROUND ROUTES

//campgrounds index route and create campground
router
  .route(`/`)
  .get(wrapAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    wrapAsync(campgrounds.createCampground)
  );

//render new campground form
router.get(`/new`, isLoggedIn, campgrounds.renderNewForm);

//campgrounds update route
router.get(
  `/:id/edit`,
  isLoggedIn,
  isAuthor,
  wrapAsync(campgrounds.renderEditForm)
);

//campgrounds show, update & delete routes
router
  .route(`/:id`)
  .get(wrapAsync(campgrounds.showCampground))
  .patch(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    wrapAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground));

module.exports = router;
