const express = require('express');
const router = express.Router();
const userDb = require('../models/UserModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { checkUserAccess, noAccess } = require('../middleware/auth');

// HOME ROUTE
// checkUserAccess is saying that if there is a user logged in, go to dashboard, if not, continue with whats inside this route meaning go to home page
router.get('/', checkUserAccess, (req, res) => {
    res.render('./home');
})

// GET REGISTER
router.get('/register', checkUserAccess, (req, res) => {
    res.render('./register');
})


// GET LOGIN
router.get('/login', checkUserAccess, (req, res) => {
    res.render('./login');

})



// GET DASHBOARD, CHECK USER AUTH (isAuth using passport)
router.get('/dashboard', noAccess, (req, res) => {
    res.render('./dashboard');
})

// POST LOGIN
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/dashboard', failureFlash: true }));


// POST REGISTER
router.post('/register', async (req, res) => {
    const { username, email, password, cpass } = req.body;

    const errors = [];

    if (!username) {
        errors.push({ msg: 'Please enter a username' });
    }

    if (!email) {
        errors.push({ msg: 'Please enter an email' });
    }

    if (!password) {
        errors.push({ msg: 'Please enter a password' });
    }

    if (cpass != password) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 8) {
        errors.push({ msg: 'Password must be greater than 8 characters' });
    }


    if (errors.length > 0) {
        // res.json({ errors });
        console.log(errors);
        res.render('./register', {
            errors,
            username,
            email,
            password,
            cpass
        })
    }
    else {

        try {


            // check if user already exists using email
            const singleUser = await userDb.findOne({ email });

            if (singleUser) {
                // if user exists, return same page with another error
                errors.push({ msg: 'Email already exists.' });
                console.log(errors);
                res.render('./register', {
                    errors,
                    username,
                    email,
                    password,
                    cpass
                })
            }
            else {
                // else if user does not exist then create new user with hashed pass
                const newUser = new userDb({ username, email, password });

                let salt = await bcrypt.genSalt(10);
                let hash = await bcrypt.hash(newUser.password, salt);
                newUser.password = hash;

                let user = await newUser.save();

                if (user) {
                    req.flash('success_msg', 'You are now registered and can log in!');
                    res.redirect('/login');
                    console.log(user);
                }

            }

        } catch (err) {
            res.json(err);
            console.log(err);
        }

    }

})


router.get('/logout', (req, res) => {
    req.logout();
    req.flash('logout_message', 'You have successfully logged out.')
    res.redirect('/login');
})






module.exports = router;