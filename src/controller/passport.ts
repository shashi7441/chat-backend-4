const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth2').Strategy;
import dotenv from 'dotenv';
dotenv.config();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      passReqToCallback: true,
    },
    function (profile: any, done: any) {
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user: any, done: any) {
  done(null, user);
});

passport.deserializeUser(function (user: any, done: any) {
  done(null, user);
});
