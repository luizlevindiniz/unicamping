function wrapAsync(asyncFunction) {
  return function (req, res, next) {
    asyncFunction(req, res, next).catch((err) => next(err));
  };
}

module.exports = wrapAsync;
