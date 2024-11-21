const express = require('express');
const cors = require('cors');
const db = require('../models/db');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const app = express();
app.use(cors());
app.use(express.json());


// Configuración de nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'cargojetservices0@gmail.com', // Cambia por tu correo
        pass: 'tnbn vexz mxps hhwm' // Cambia por tu contraseña
    }
});


// Método para buscar usuario por token de verificación 
const findByVerificationToken = async (token) => {
     try { 
        const query = `SELECT * FROM usuarios WHERE verification_token = ?`; 
        const [rows] = await db.query(query, [token]); 
        return rows.length > 0 ? rows[0] : null; 
    } catch (error) { 
        console.error("Error al buscar usuario por token:", error); 
        throw error;
     } 
    };
    
    
    // Método para verificar usuario 
    const verifyUser = async (token) => { 
        try { 
            const query = `UPDATE usuarios SET is_verified = true, verification_token = NULL WHERE verification_token = ?`; 
            const [result] = await db.query(query, [token]); 
            return result.affectedRows > 0; 
        } catch (error) { 
            console.error("Error al verificar usuario:", error); 
            throw error;
            }
            };


router.post('/registro', async (req, res) => {
    const { nombre, apellido, email, telefono, direccion, fechaNacimiento, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, mensaje: 'El usuario ya está registrado.' });
        }

        // Generar hash para la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generar token de verificación único
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Crear el usuario en la base de datos
        const user = await User.create({
            nombre,
            apellido,
            email,
            telefono,
            direccion,
            fechaNacimiento,
            password: hashedPassword,
            verificationToken,
            
            // Asegúrate de tener este campo en tu base de datos
        });

        
        // Enlace de verificación
        const verificationUrl = `http://localhost:5501/api/verificar?token=${verificationToken}`;

        // Configurar correo de verificación
        const mailOptions = {
            from: 'cargojetservices0@gmail.com',
            to: email,
            subject: 'Verifica tu cuenta - Cargojet Services',
            html: `
                <h1>Verifica tu cuenta</h1>
                <p>Gracias por registrarte en Cargojet Services. Haz clic en el siguiente enlace para activar tu cuenta:</p>
                <a href="${verificationUrl}">Verificar mi cuenta</a>
                <p>Si no solicitaste esta cuenta, ignora este correo.</p>
            `,
        };
        await transporter.sendMail(mailOptions);
        // Enviar correo de verificación
        // await transporter.sendMail(verificationMailOptions);

        res.status(201).json({
            success: true,
            mensaje: 'Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta.',
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
    }
});

// Ruta de verificación
router.get('/verificar', async (req, res) => {
    const { token } = req.query;

    try {
        // Buscar al usuario con el token de verificación
        const user = await findByVerificationToken(token);
        if (!user) {
            return res.status(404).json({ success: false, mensaje: 'Token de verificación no válido.' });
        }

        const isVerified = await verifyUser(token); 
        if (!isVerified) { 
            return res.status(500).json({ success: false, mensaje: 'No se pudo verificar el usuario.' });
            }
        // Marcar al usuario como verificado
     /*   user.isVerified = true;
        user.verificationToken = null; // Eliminar el token después de verificar
        await user.save();
  */
        /* const jwtToken = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            'Admin', // Usa una clave secreta segura
            { expiresIn: '1h' }
        ); */
        // Configurar correo de bienvenida
        const mailOptions = {
            from: 'cargojetservices0@gmail.com',
            to: user.email,
            subject: 'Bienvenido a Cargojet Services',
            html: ` <!DOCTYPE html> <html lang="es"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Email</title> <style> body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; } .container { background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); } h1 { color: #333; } p { color: #666; } .info { margin-bottom: 20px; } .logo { text-align: center; margin-top: 20px; } </style> </head> <body> <div class="container"> <h1>Hola ${user.nombre},</h1> <p>¡Gracias por registrarte en Cargojet Services! Aquí están tus datos de registro:</p> <div class="info"> <p><strong>Nombre:</strong> ${user.nombre} ${user.apellido}/CJS</p> <p><strong>Dirección:</strong> 1345 Nw 98th Ct, Unit 2c</p> <p><strong>Ciudad, estado y código postal:</strong> Doral, FL 33172-3049</p> <p><strong>País:</strong> Estados Unidos</p> <p><strong>Teléfono:</strong> (786)330-2816</p> </div> <p>Esta es tu información de carga marítima:</p> <div class="info"> <p><strong>Nombre:</strong> ${user.nombre} ${user.apellido}/CJS Ocean</p> <p><strong>Dirección:</strong> 1345 Nw 98th Ct, Unit 2</p> <p><strong>Dirección 2:</strong> OCEAN</p> <p><strong>Ciudad, estado y código postal:</strong> Miami, FL 33172-3049</p> <p><strong>País:</strong> Estados Unidos</p> <p><strong>Teléfono:</strong> +1(786)3602816</p> </div> <p>¡Esperamos poder ayudarte con nuestros servicios!</p> <p>Saludos,<br>El equipo de Cargojet Services</p> <div class="logo"> <img src="./images/logo.png" alt="Logo de Cargojet Services" width="200"> </div> </div> </body> </html> `
};

        // Enviar el correo de bienvenida
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            mensaje: 'Cuenta verificada exitosamente. ¡Bienvenido!',
           
        });
    } catch (error) {
        console.error('Error al verificar la cuenta:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;

// app.post('/api/registro', async (req, res) => {
//     try {const { nombre, apellido, email, telefono, direccion, fechaNacimiento, password } = req.body;

//     // Verificar si el usuario ya existe
//     const existingUser = await User.findByEmail({ email });
//     if (existingUser) return res.status(400).json({ mensaje: 'El usuario ya está registrado' });

//     // Encriptar la contraseña
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Crear un nuevo usuario con los datos proporcionados
//     const user = await User.create({ 
//         nombre, 
//         apellido, 
//         email, 
//         telefono, 
//         direccion, 
//         fechaNacimiento, 
//         password: hashedPassword 
//     });