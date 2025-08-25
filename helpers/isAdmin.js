module.exports = {
    isAdmin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.roleAdmin == 1) {
            return next();
        }
        req.flash("error_msg", "Você precisa ser um administrador para acessar essa página.");
        res.redirect("/");
    }
};