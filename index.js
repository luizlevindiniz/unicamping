if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//setting up consts
const express = require(`express`);
const app = express();
const mongoose = require(`mongoose`);
const path = require(`path`);
const methodOverride = require(`method-override`);
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const AppError = require("./utilities/expressError");
const campgroudRoute = require("./routes/campgroudRoute");
const reviewsRoute = require("./routes/reviewsRoute");
const usersRoute = require("./routes/usersRoute");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require(`passport`);
const localPassportStrategy = require(`passport-local`);
const googlePassportStrategy = require(`passport-google-oauth2`);
const User = require(`./models/user`);
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require(`helmet`);
const DB_URL = process.env["DB_URL"];
const MongoDbStore = require("connect-mongo");
const PORT = process.env["PORT"] || 3000;
const SECRET = process.env[`SECRET`] || `secret`;

//setting views folder and ejs
app.set(`view engine`, `ejs`);
app.set(`views`, path.join(__dirname, `views`));
app.engine(`ejs`, ejsMate);
//setting public static directory
app.use(express.static(path.join(__dirname, `public`)));
//setting method override
app.use(methodOverride("_method"));
//setting request parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//setting up morgan (optional)
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(cookieParser());

//mongo atlas store config
const store = MongoDbStore.create({
  mongoUrl: DB_URL,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: SECRET,
  },
});

store.on("error", function (err) {
  next(new AppError(404, `MongoAtlas store error ${err}`));
});

//session config
const sessionConfig = {
  store: store,
  name: "session",
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24, //ms-s-h-d
    maxAge: Date.now() + 1000 * 60 * 60 * 24,
    httpOnly: true,
    /*   secure:true  - enable for https only*/
  },
};
app.use(session(sessionConfig));

//setting up flash
app.use(flash());

//setting up passport w/ passport, passport-local and p-l-mongoose
app.use(passport.initialize());
app.use(passport.session()); //session should be used before passport.session
passport.use(new localPassportStrategy(User.authenticate()));
passport.use(
  new googlePassportStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOne({ googleId: profile.id });
      if (!user) {
        const googleUser = new User({
          email: profile.email,
          username: profile.displayName,
          googleId: profile.id,
        });
        await googleUser.save();
        return done(null, googleUser);
      }
      return done(null, user);
    }
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//saving variables in locals to use in ejs templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.info = req.flash("info");
  res.locals.error = req.flash("error");
  next();
});

//noSQL injection prevention
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

//helmet > sets http response headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

//initializing MongoDB
async function main() {
  mongoose.connect(DB_URL);
  console.log(`Mongo Online!`);
}
main().catch((err) => console.log(`Mongo Error!`, err));

//ROUTES
app.get(`/`, (req, res) => {
  res.render(`./homepage.ejs`);
});

//GOOGLE LOGIN

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/campgrounds",
    failureFlash: true,
    successFlash: "Successfully logged in!",
  })
);

///CAMPGROUNDS ROUTES
app.use("/campgrounds", campgroudRoute);

///REVIEWS ROUTES
app.use("/campgrounds/:id/reviews", reviewsRoute);

//USERS ROUTES
app.use(`/users`, usersRoute);

///ERROR HANDLING
app.all(`*`, (req, res, next) => {
  next(new AppError(404, `Page not Found!`));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = `Something went wrong!` } = err;
  res.status(statusCode).render("errorpages/error.ejs", {
    page: `Error! ${statusCode}`,
    statusCode: statusCode,
    message: message,
  });
});

//initializing express
app.listen(PORT, (err) => {
  if (err) {
    console.log(`Listen Error!`, err);
  } else {
    console.log(`Listening on PORT ${PORT}`);
  }
});

module.exports = app;
