const express = require(`express`);
const router = express.Router();
const users = require(`../controllers/users`);
const wrapAsync = require("../utilities/wrapAsync");
const passport = require("passport");
const isLoggedIn = require("../auth_middleware/isLoggedIn");
const storeReturnTo = require(`../auth_middleware/storeReturnTo`);

//render register form and create new user
router
  .route(`/register`)
  .get(users.renderRegisterForm)
  .post(wrapAsync(users.createNewUser));

//render login form and login
router
  .route(`/login`)
  .get(users.renderLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate(`local`, {
      failureFlash: true,
      failureRedirect: `/users/login`,
      session: true,
    }),
    users.login
  );

//logout
router.get("/logout", isLoggedIn, users.logout);

module.exports = router;
