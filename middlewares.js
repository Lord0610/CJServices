// models/middlewares.js
const jwt = require('jsonwebtoken');

// Middleware para verificar el token
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Verificar si se proporciona el token
    if (!token) {
        return res.status(403).json({ mensaje: 'Token no proporcionado' });
    }

    // Eliminar "Bearer " del token, si está presente
    const tokenSinBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Verificar el token
    jwt.verify(token, 'Admin', (err, decoded) => {
        if (err) {
            return res.status(401).json({ mensaje: 'Token inválido' });
        }

        req.user = decoded; // Asignar el usuario decodificado a req.user
        console.log("Usuario autenticado:", req.user);
        next();
    });
};

// Middleware para verificar el rol
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        const userRole = req.user.rol; // Asumimos que el rol está en req.user

        // Verificar si el rol del usuario está en los roles permitidos
        if (!rolesPermitidos.includes(userRole)) {
            return res.status(403).json({ mensaje: 'Acceso denegado' });
        }
        next();
    };
};

module.exports = { verificarToken, verificarRol };