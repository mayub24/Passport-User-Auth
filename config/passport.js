const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userModel = require('../models/UserModel');
const bcrypt = require('bcrypt');

// Passport local mainly works with logging in and checking if user is authorized. 
// It also allows us to check if user is authorized when visiting a certain route. If not, it will redirect to homepage but if authenticated, user can visit the page

const customFields = {
    usernameField: 'email',
    passwordField: 'password'
};

const verifyCallback = async (email, password, done) => {


    try {
        // When the user logs in, we check if there is a user
        const checkUser = await userModel.findOne({ email });

        // if no user, return done with false
        if (!checkUser) {
            // message property works alongside connect-flash to show success/failur messages
            return done(null, false, { message: 'Email is not registered' });
        }

        // if user, continue and check equality of passwords
        const checkPass = await bcrypt.compare(password, checkUser.password);

        if (checkPass) // if passwords are equal
        {
            console.log(`If checkpass is true: ${checkPass}`);
            return done(null, checkUser); // return done with user created
        }
        else {
            console.log(`if its false: ${checkPass}`);
            return done(null, false, { message: 'Password is incorrect' }); // no user, so return done with false
        }

    } catch (err) {
        console.log(err);
        done(err);
    }

}

// Calling the localStrategy function on the verifyCallback
const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);


// Now serializing and deserializing the user

// SERIALIZE USER
passport.serializeUser((user, done) => {
    // adding user.id to the req session
    done(null, user.id);
})


// DESERIALIZE USER
passport.deserializeUser(async (userId, done) => {
    try {
        const getUser = await userModel.findById(userId).lean();

        done(null, getUser); // gets the user with that id (whos logged in) and inserts it in the req.session body

    } catch (error) {
        done(error);
    }
})
