const jwt = require('jsonwebtoken');

// Middleware para verificar el token

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: 'Token no proporcionado o inválido.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, 'Admin');
        req.user = decoded; // Decodificar el token y asignarlo al request
        next();
    } catch (err) {
        res.status(401).json({ mensaje: 'Token no válido.' });
    }
};


// Middleware para verificar el rol
function verificarRol(rolesPermitidos) {
    return (req, res, next) => {
        const { rol } = req.user; // Asumiendo que el rol está incluido en el token
        if (!rolesPermitidos.includes(rol)) {
            return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta ruta' });
        }
        next();
    };
}

module.exports = { verificarToken, verificarRol };
