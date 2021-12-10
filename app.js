const express = require('express');
const path = require('path');
// Import handlebars
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDb = require('./config/db');
const userRoutes = require('./routes/User');
const passport = require('passport');
const flash = require('connect-flash');
const { changeToUpper } = require('./helpers/hbs');
const dotenv = require('dotenv');

// Getting passport files inside app.js
require('./config/passport');
dotenv.config({ path: './config/keys.env' });

const app = express();

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Express session after the database is connected
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        dbName: 'passport',
        collectionName: 'userAuth'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));


// Using Flash
app.use(flash());

// Initializing passport
app.use(passport.initialize());
app.use(passport.session());


// Middleware to check session and if the user has been serialized
app.use((req, res, next) => {
    res.locals.user = req.user;
    // console.log(req);
    console.log(req.session);
    console.log(req.user);
    next();
})

// Creating local variables that will be available to the template engines
app.use((req, res, next) => {
    // When using passport, connect-flash is useful for giving failure and success messages since we are creating the error/success message through passports done() function in its 3rd parameter
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error = req.flash('error');
    res.locals.logout_message = req.flash('logout_message');
    next();
})

// Connect Db
connectDb();

// Establish Routes
app.use('/', userRoutes);


// Connect handlebars as template engine
// partialsDir specifies where our partial is stored
app.engine('.hbs', exphbs({ helpers: { changeToUpper }, defaultLayout: 'main', extname: '.hbs', partialsDir: path.join(__dirname, 'views/partials') }));

// Set template engine
app.set('view engine', '.hbs');


// Public Folder for CSS Styling
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Listening to PORT: ${PORT}...`);
})