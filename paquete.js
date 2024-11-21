require('dotenv').config();
const db = require('./db'); // Conexión a la base de datos
const nodemailer = require('nodemailer'); // Envío de correos electrónicos

// const twilio = require('twilio'); // Envío de mensajes de WhatsApp
// const accountSid = process.env.TWILIO_SID; // Obtener Account SID
// const authToken = process.env.TWILIO_AUTH_TOKEN; 
// const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// Configuración de nodemailer para enviar correos electrónicos
const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
        port:465,
        secure: true,
        auth: {
            user: 'cargojetservices0@gmail.com', // Cambia por tu correo
            pass: 'tnbn vexz mxps hhwm'  // Cambia por tu contraseña                     
        }
});// Configuración de Twilio para enviar mensajes de WhatsApp
const Paquete = {
    // Obtener todos los paquetes
    findAll: async () => {
        try {
            const query = `SELECT * FROM paquetes`;  // Asegúrate de que el nombre de la tabla es correcto
            const [results] = await db.query(query);
            return results;
        } catch (error) {
            console.error("Error al obtener los paquetes:", error);
            throw error;
        }
    },

    // Encontrar paquetes por ID de usuario
    findByUserId: async (userId) => {
        try {
            const query = `SELECT * FROM paquetes WHERE user_id = ?`;
            const [results] = await db.query(query, [userId]);
            return results;
        } catch (error) {
            console.error("Error al encontrar el paquete:", error);
            throw error;
        }
    },

    // Método para actualizar el estado de un paquete y enviar una notificación por correo electrónico
    updateEstado: async (userId, nuevoEstado, usuarioEmail) => {
        try {
            // Verificar si el paquete ya existe
            const checkQuery = `SELECT * FROM paquetes WHERE user_id = ?`;
            const [existingPaquete] = await db.query(checkQuery, [userId]);

            if (existingPaquete && existingPaquete.length > 0) {
                // Si el paquete existe, actualiza el estado
                const updateQuery = `UPDATE paquetes SET estado = ? WHERE user_id = ?`;
                await db.query(updateQuery, [nuevoEstado, userId]);
            } else {
                // Si no existe, inserta un nuevo paquete con el estado
                const insertQuery = `INSERT INTO paquetes (user_id, estado) VALUES (?, ?)`;
                await db.query(insertQuery, [userId, nuevoEstado]);
            }

            // Configuración y envío de la notificación por correo electrónico
            if (transporter && usuarioEmail) {
            const mailOptions = {
                from: 'cargojetservices0@gmail.com',
                to: usuarioEmail,
                subject: 'Actualización del Estado de su Paquete',
                html: ` <!DOCTYPE html> <html lang="es"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Actualización de Estado</title> <style> body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; } .container { background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); } h1 { color: #333; } p { color: #666; } .info { margin-bottom: 20px; } .logo { text-align: center; margin-top: 20px; } </style> </head> <body> <div class="container"> <h1>Actualización del Estado de su Paquete</h1> <p>El estado de su paquete ha sido actualizado a: <strong>${nuevoEstado}</strong></p> <div class="info"> <p>¡Gracias por usar nuestros servicios!</p> <p>Si tienes alguna pregunta, no dudes en contactarnos.</p> </div> <p>Saludos,<br>El equipo de Cargojet Services</p> <div class="logo"> <img src="./images/logo.png" alt="Logo de Cargojet Services" width="200"> </div> </div> </body> </html> `
};
            // Enviar el correo electrónico usando transporter
            const info = await transporter.sendMail(mailOptions);
            console.log("Correo electrónico enviado:", info.response);
            return info;

        }else {
            console.error("Transporte de correo no configurado o correo del usuario no proporcionado.");
        }
    }catch (error) {
            console.error("Error al actualizar el estado del paquete o enviar el correo:", error);
            throw error;
        }
    }};

module.exports = Paquete;

