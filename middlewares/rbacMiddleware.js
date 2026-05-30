module.exports = function (roles) {
    return (req, res, next) => {
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).send("No autorizado");
        }
        next();
    };
};