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


module.exports = router;
