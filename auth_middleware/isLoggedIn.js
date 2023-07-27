const isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    //store users last page before login
    req.session.returnTo = req.originalUrl;
    req.flash(`error`, `Ops! You must sign in first.`);
    return res.redirect(302, `/users/login`);
  }
  next();
};

module.exports = isLoggedIn;
