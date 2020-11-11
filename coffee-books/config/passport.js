const bcrypt = require("bcrypt")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/User")

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password"
    },
    async (username, password, done) => {
      const user = await User.findOne({ username })
      if (!user) {
        return done(null, false, { message: "Incorrect username" })
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: "Incorrect password" })
      }

      done(null, user) // envia el usuario a serializeUser
    }
  )
)

//Auth with Google
passport.use(
  new GoogleStrategy(
    {
      clientID: '466881894260-pa0ltg0eaic0tttcvcvr262srgpr7bnj.apps.googleusercontent.com',//process.env.GOOGLE_ID,
      clientSecret: 'pqPzDuADTG3I9ltFPTiiv17N',//process.env.GOOGLE_SECRET,
      callbackURL: "/auth/google/callback"
    },
    async (_, __, profile, done) => {
      const user = await User.findOne({ googleID: profile.id })

      if (user) {
        return done(null, user)
      }

      const newUser = await User.create({
        googleID: profile.id,
        email: profile.emails[0].value
      })

      done(null, newUser)
    }
  )
)
//Auth with Facebook


passport.serializeUser((user, cb) => {
  cb(null, user._id)
})

passport.deserializeUser(async (id, cb) => {
  const user = await User.findById(id)
  user.password = null
  cb(null, user) // Guarda lo que le enviamos como segundo argumento en la sesion como req.user
})

module.exports = passport
