const db = require('../database');
const bcrypt = require('bcrypt');

exports.login = (req, res) => {
    const { username, password } = req.body;

    const user = db.prepare(`
        SELECT users.*, roles.name as role
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE username = ?
    `).get(username);

    if (!user) return res.send("Usuario no encontrado");

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.send("Contraseña incorrecta");

    req.session.user = user;
    res.redirect('/dashboard');
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};