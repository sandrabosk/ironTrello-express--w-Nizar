const passport = require('passport');
const express = require('express');
const bcrypt = require('bcrypt');


const UserModel = require('../models/user-model');


const router = express.Router();


router.post('/api/signup', (req, res, next) => {
    const theFullName = req.body.signupFullName;
    const theEmail = req.body.signupEmail;
    const thePassword = req.body.signupPassword;

    if (!theEmail || !thePassword) {
      res.status(400).json({ message: 'Please provide an email & password' });
      return;
    }

    UserModel.findOne(
      { email: theEmail },
      (err, userFromDb) => {
          if (err) {
            res.status(500).json({ message: 'Email check went to 💩.' });
            return;
          }

          if (userFromDb) {
            res.status(400).json({ message: 'Email is taken, friend.' });
            return;
          }

          const salt = bcrypt.genSaltSync(10);
          const scrambledPassword = bcrypt.hashSync(thePassword, salt);

          const theUser = new UserModel({
            fullName: theFullName,
            email: theEmail,
            encryptedPassword: scrambledPassword
          });

          theUser.save((err) => {
              if (err) {
                res.status(500).json({ message: 'User save went to 💩.' });
                return;
              }

              // Log in the user automatically after signup
              req.login(theUser, (err) => {
                  if (err) {
                    res.status(500).json({ message: 'Login went to 💩.' });
                    return;
                  }

                  res.status(200).json(theUser);
              });
          });
      }
    );
});


router.post('/api/login', (req, res, next) => {
    const myFunction = passport.authenticate('local', (err, theUser, failureDetails) => {
        if (err) {
          res.status(500).json({ message: 'Something went wrong. 💩' });
          return;
        }

        if (!theUser) {
          // "failureDetails" contains the error messages
          // from our logic in "LocalStrategy" { message: 'Email invalid, fool.' }.
          res.status(401).json(failureDetails);
          return;
        }

        req.login(theUser, (err) => {
            if (err) {
              res.status(500).json({ message: 'Passport login went to 💩.' });
              return;
            }

            res.status(200).json(theUser);
        });
    });

    myFunction(req, res, next);
});


router.post('/api/logout', (req, res, next) => {
    req.logout();
    res.status(200).json({ message: 'Success 🐉' });
});


router.get('/api/checklogin', (req, res, next) => {
    if (req.isAuthenticated()) {
      res.status(200).json(req.user);
      return;
    }

    res.status(403).json({ message: 'Unauthorized' });
});


module.exports = router;
