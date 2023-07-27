const AppError = require("../utilities/expressError");
const { reviewJoiSchema } = require(`./joiSchemas`);

//server side validation
const validateReview = (req, res, next) => {
  const validationResult = reviewJoiSchema.validate(req.body);
  const { error } = validationResult;
  if (error) {
    const message = error.details.map((err) => err.message).join(`,`);
    throw new AppError(400, message);
  } else {
    next();
  }
};

module.exports = validateReview;
