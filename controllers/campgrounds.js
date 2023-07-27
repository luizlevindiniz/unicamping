const Campground = require(`../models/campground`);
const converter = require("number-to-words");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgroundsData = await Campground.find({});
  res.render(`campgrounds/index.ejs`, {
    campgroundsData: campgroundsData,
    page: `All Campgrounds`,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render(`campgrounds/new.ejs`, { page: `Create Campground` });
};

module.exports.createCampground = async (req, res, next) => {
  const { campground } = req.body;
  const geoData = await geocoder
    .forwardGeocode({
      query: campground.location,
      limit: 1,
    })
    .send();
  const newCampground = new Campground({
    title: campground.title,
    price: campground.price,
    location: campground.location,
    description: campground.description,
    images: req.files.map((key) => ({ url: key.path, filename: key.filename })),
    author: req.user,
    geometry: geoData.body.features[0].geometry,
  });
  await newCampground.save();
  req.flash("success", "Campground Created!");
  res.redirect(302, `/campgrounds/${newCampground.id}`);
};

module.exports.showCampground = async (req, res, next) => {
  const { id } = req.params;
  const campgroundData = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: `author`,
      },
    })
    .populate(`author`);
  if (!campgroundData) {
    req.flash("error", "Campground Not Found!");
    res.redirect(302, "/campgrounds");
  }
  res.render(`campgrounds/show.ejs`, {
    campground: campgroundData,
    page: `Showing Campground`,
    converter: converter,
  });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campgroundData = await Campground.findById(id);
  res.render(`campgrounds/edit.ejs`, {
    campground: campgroundData,
    page: `Editing Campground`,
  });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const { campground, deleteImages } = req.body;
  const imgs = req.files.map((key) => ({
    url: key.path,
    filename: key.filename,
  }));
  const updatedCampground = await Campground.findByIdAndUpdate(id, {
    title: campground.title,
    price: campground.price,
    location: campground.location,
    description: campground.description,
  });
  await updatedCampground.images.push(...imgs);
  await updatedCampground.save();
  if (deleteImages) {
    await updatedCampground.updateOne({
      $pull: { images: { filename: { $in: deleteImages } } },
    });
  }
  req.flash("info", "Campground Updated!");
  res.redirect(302, `/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id).populate("reviews");
  req.flash("success", "Campground Deleted!");
  res.redirect(302, `/campgrounds`);
};
