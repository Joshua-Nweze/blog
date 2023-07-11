import express from "express"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
import User from "./models/user.js"
import passport from "passport"
import flash from "express-flash"
import session from "express-session"
import dotenv from "dotenv"

if(process.env.NODE_ENV !== 'production'){
  dotenv.config()
}

import { initializePassport } from "./passport-config.js"
initializePassport(passport, async (email) => {
  try {
    const user = await User.find({ email });
    // const id = await User.find({ id })
    console.log(user)
    return user;
  } catch (error) {
    console.log('Error retrieving user by email');
  }
})

const app = express()

const uri = ""
mongoose.connect(uri)
    .then(result => app.listen(3000))
    .catch(err => console.log("Error: ", err))

// middleware
app.use(express.urlencoded({extended: false}))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use('/public', express.static('public'));
app.use(express.static('public'));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // resave session variable if nothing is changed
  saveUninitialized: false // save empty value in sesion
}))
app.use(passport.initialize())
app.use(passport.session())

// routes
app.get('/', (req, res) => {
    res.render('index.ejs', { name: "joah"})
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', (req, res) => {
    let message = req.query.message
    res.render('register.ejs', { message })
})

app.post('/register', async (req, res) => {
    const hashedPwd = await bcrypt.hash(req.body.password, 10)

    const user = new User({
        firstName: req.body.fName,
        lastName: req.body.lName,
        email: req.body.email,
        password: hashedPwd
    })

    // if (user.firstName.trim() == "" || user.firstName.trim() == "" || user.email.trim() == "" || user.password == "" || (req.body.password2) == "") {
    //   res.redirect('/register?message=Input fields must not be empty');
    // }

    // req.body.fName.trim() !== "" || req.body.lName.trim() !== "" || req.body.email.trim() !== "" || req.body.password == "" || req.body.password == req.body.password2

    // if(user.password !== req.body.password2){
    //   res.redirect('/register?message=Both passwords must match');
    // }

    User.find({email: user.email})
    .then(result => {
        if (result.length === 0) {
          user.save()
            .then(() => {
              console.log('Account created');
              res.redirect('/login');
            })
            .catch(err => {
              console.log("Error:", err);
              // res.redirect('/register');
            });
        } else {
          console.log('Email already exists');
          res.redirect('/register?message=Email already exist');
        }
      })
      .catch(err => {
        console.log("Error:", err);
        // res.redirect('/register');
      });
})

