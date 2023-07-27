const AppError = require("../utilities/expressError");
const { campgroundJoiSchema } = require(`./joiSchemas`);

//server side validation
const validateCampground = (req, res, next) => {
  const validationResult = campgroundJoiSchema.validate(req.body);
  const { error } = validationResult;
  if (error) {
    const message = error.details.map((err) => err.message).join(`,`);
    throw new AppError(400, message);
  } else {
    next();
  }
};

module.exports = validateCampground;
