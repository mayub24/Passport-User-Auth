const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    }
    else {
        next();
    }
}

const deniedAccess = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    }
    else {
        next();
    }
}

module.exports =
{
    checkUserAccess: checkAuth,
    noAccess: deniedAccess
}