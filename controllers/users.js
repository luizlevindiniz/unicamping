const User = require(`../models/user`);

module.exports.renderRegisterForm = (req, res, next) => {
  res.render(`users/register.ejs`, { page: `Creating a New User` });
};

module.exports.createNewUser = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const newUser = new User({
      email: email,
      username: username,
    });
    const registerUser = await User.register(newUser, password);
    req.login(registerUser, function (err) {
      if (err) {
        return next(err);
      }
      req.flash(`success`, `Welcome to UniCamping, ${username}!`);
      res.redirect(302, `/campgrounds`);
    });
  } catch (err) {
    req.flash(`error`, err.message);
    res.redirect(302, `register`);
  }
};

module.exports.renderLoginForm = (req, res, next) => {
  res.render(`users/login.ejs`, { page: `Logging In` });
};

module.exports.login = (req, res, next) => {
  req.flash(`success`, `Welcome back!`);
  const redirectUrl = res.locals.returnTo || `/campgrounds`;
  res.redirect(302, redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("info", "See you!");
    return res.redirect(302, "/campgrounds");
  });
};
