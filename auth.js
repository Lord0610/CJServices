// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Asegúrate de tener esto para la verificación de JWT
const { verificarToken } = require('../models/middlewares');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const router = express.Router();

// Configuración del transporte de nodemailer
const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
        port:465,
        secure: true,
        auth: {
            user:'cargojetservices0@gmail.com', // Cambia por tu correo
            pass:'tnbn vexz mxps hhwm'  // Cambia por tu contraseña                     
        },
    });
  
// Solicitar recuperación de contraseña
router.post('/resetPassword', async (req, res) => {
    console.log('Solicitud recibida en /resetPassword');
    try {
        const email = req.body.email.trim().toLowerCase();

        // Verificar si el usuario existe
        if (!email) {
            return res.status(400).json({ mensaje: 'El email es requerido' });
        }

        const user = await User.findByEmail(email); // Cambiar llamada según cómo funcione tu modelo
        console.log('Resultado de findByEmail:', user);
        if (!user) {
            return res.status(404).json({ mensaje: 'Correo no encontrado' });
        }

        // Crear un token de restablecimiento de contraseña
        const token = jwt.sign({ id: user.id }, 'admin', { expiresIn: '1h' });
        const resetLink = `http://localhost:5501/cambiar-contraseña.html?token=${token}`;

        // Configurar el correo electrónico
        const mailOptions = {
            from: 'cargojetservices0@gmail.com',
            to: email,
            subject: 'Restablecimiento de Contraseña',
          html: ` <!DOCTYPE html> <html lang="es"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Restablecimiento de Contraseña</title> <style> body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; } .container { background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); } h1 { color: #333; } p { color: #666; } a.button { display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; } a.button:hover { background-color: #0056b3; } .logo { text-align: center; margin-top: 20px; } </style> </head> <body> <div class="container"> <h1>Restablecimiento de Contraseña</h1> <p>Hola,</p> <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p> <a href="${resetLink}" class="button">Restablecer Contraseña</a> <p>Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo.</p> <p>Saludos,<br>El equipo de Cargojet Services</p> <div class="logo"> <img src="./images/logo.png" alt="Logo de Cargojet Services" width="200"> </div> </div> </body> </html> `
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        res.json({ mensaje: 'Enlace de restablecimiento enviado a tu correo' });

    } catch (error) {
        console.error('Error en /resetPassword:', error);
        res.status(500).json({ mensaje: 'Error al procesar la solicitud' });
    }
});

// Restablecer la contraseña
 router.post('/changepassword', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        console.log('Token recibido:', token);
        console.log('Nueva contraseña recibida:', newPassword);

        // Validar que se reciban todos los datos
        if (!token || !newPassword) {
            return res.status(400).json({ mensaje: 'Token y nueva contraseña son requeridos' });
        }

        // Verificar token
        const decoded = jwt.verify(token, 'admin');
        console.log('Token decodificado:', decoded);
        const userId = decoded.id;

        // Cifrar la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        const result = await User.updatePassword(userId, hashedPassword); // Asegúrate de que `updatePassword` funcione correctamente
        if (!result.affectedRows) {
            return res.status(500).json({ mensaje: 'Error al actualizar la contraseña' });
        }
     res.json({exito: true, mensaje: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        console.error('Error en /changepassword:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({ mensaje: 'Token inválido o expirado' });
        }
        res.status(500).json({ mensaje: 'Error al procesar la solicitud' });
    }
}); 

// Verificación de permisos en las rutas
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        const userRole = req.user.rol;
        if (!rolesPermitidos.includes(userRole)) {
            return res.status(403).json({ mensaje: 'Acceso denegado' });
        }
        next();
    };
};


// Ejemplo de uso en una ruta de administración
router.get('/clientes', verificarToken, verificarRol(['administrador']), (req, res) => {
    // Lógica para obtener los clientes...
});

// Ruta protegida de ejemplo
router.get('/ruta-protegida', verificarToken, (req, res) => {
    res.json({ mensaje: 'Acceso a la ruta protegida exitoso' });
});
module.exports = router;
// Validaciones al registrar un usuario
router.post('/register', [
    check('email').isEmail().withMessage('Debe ser un correo válido'),
    check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    // Lógica para registrar al usuario...
});



module.exports = router;
