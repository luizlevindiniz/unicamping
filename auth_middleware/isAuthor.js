const AppError = require(`../utilities/expressError`);
const Campground = require(`../models/campground`);

const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campgroundData = await Campground.findById(id).populate(`author`);
  if (!campgroundData.author.equals(req.user.id)) {
    next(new AppError(403, `Forbidden Request`));
  }
  next();
};

module.exports = isAuthor;
