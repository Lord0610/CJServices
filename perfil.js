const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asegúrate de que la ruta es correcta
const Paquete = require('../models/paquete'); // Asegúrate de que la ruta es correcta
const router = express.Router();


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



router.get('/perfil', verificarToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener información del usuario
        const user = await User.findById(userId, 'nombre apellido email telefono');
        if (!user) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Estructura de casillero
        const datosCasillero = {
            nombre: `${user.nombre || 'Sin nombre'} ${user.apellido || ''}/CJS`,
            direccion: "1345 Nw 98th Ct, Unit 2c",
            ciudad: "Doral",
            estado: "FL",
            codigoPostal: "33172-3049",
            pais: "Estados Unidos",
            telefono: "(786)330-2816"
        };

        // Estructura de datos de carga marítima con datos estáticos
        const datosOcean = {
            nombre: `${user.nombre || 'Sin nombre'} ${user.apellido || ''}/CJS Ocean`,
            direccion: "1345 Nw 98th Ct, Unit 2",
            direccion2: "OCEAN",
            ciudad: "Miami",
            estado: "FL",
            codigoPostal: "33172-3049",
            pais: "Estados Unidos",
            telefono: "+1(786)3602816"
        };

        // Enviar perfil completo
        res.json({
            nombre: user.nombre || 'Sin nombre',
            apellido: user.apellido || 'Sin apellido',
            email: user.email || 'No proporcionado',
            telefono: user.telefono || 'No proporcionado',
            datosCasillero,
            datosOcean
        });
    } catch (error) {
        console.error("Error al obtener el perfil:", error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.put('/perfil', verificarToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { nombre, apellido, email, telefono } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { nombre, apellido, email, telefono },
            { new: true } // Retorna el documento actualizado
        );

        if (!updatedUser) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json({ mensaje: 'Información actualizada exitosamente' });
    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});



router.get('/estado-paquete', verificarToken, (req, res) => {
    const userId = req.user.id;
    Paquete.findByUserId(userId, (err, result) => {
        if (err) return res.status(500).json({ mensaje: 'Error al obtener el estado del paquete' });
        res.json(result[0] || { estado: 'Sin paquete' });
    });
});



module.exports = router;

