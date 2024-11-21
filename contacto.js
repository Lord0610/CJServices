require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const router  = express.Router();


// Middleware para analizar el cuerpo de la solicitud



router.post('/', async (req, res) => {
    const { nombre, email, mensaje } = req.body;

    // Configuración de transporte para nodemailer
    
    const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'cargojetservices0@gmail.com', // Cambia por tu correo
        pass: 'tnbnvexzmxpshhwm'  // Cambia por tu contraseña                     
    }, });
    // Configuración del mensaje de correo
    const mailOptions = {
        from: email,
        to: 'cargojetservices0@gmail.com', // Cambia esto a donde quieres recibir el correo
        subject: `Nuevo mensaje de contacto de ${nombre} (${email})`,
        text: mensaje,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ mensaje: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        res.status(500).json({ mensaje: 'Hubo un error al enviar el mensaje.' });
    }
});


module.exports = router; 
// Escucha el servidor en un puerto específico
  /* const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
}); */ 
 