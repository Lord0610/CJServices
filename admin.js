const express = require('express');
const db = require('../models/db'); 
const { verificarToken, verificarRol } = require('../models/verificarToken.js'); // Asegúrate de que esta ruta sea correcta
const router = express.Router();

// Obtener la información de todos los clientes (sin paginación ni filtro)
router.get('/usuarios/all', verificarToken, verificarRol(['admin']), async (req, res) => {
    try{
    const query = `
        SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, 
               COALESCE(p.estado, 'Sin paquete') AS estado_paquete
        FROM usuarios u
        LEFT JOIN paquetes p ON u.id = p.user_id`;

        const [result] = await db.query(query);

        console.log('Resultado de la consulta:', result); // Verificar qué datos se devuelven
        res.json(result);
    } catch (err) {
        console.error('Error al obtener la información de los clientes:', err);
        res.status(500).json({ mensaje: 'Error al obtener la información de los clientes' });
    }
});

// Paginación y Filtrado en el Administrador
router.get('/usuarios', verificarToken, verificarRol(['admin']), async (req, res) => {
    try{
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
        SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, 
               COALESCE(p.estado, 'Sin paquete') AS estado_paquete
        FROM usuarios u
        LEFT JOIN paquetes p ON u.id = p.user_id
        WHERE u.nombre LIKE ? OR u.email LIKE ?
        LIMIT ? OFFSET ?`;

        const [result] = await db.query(query, [
            `%${search}%`,
            `%${search}%`,
            parseInt(limit),
            parseInt(offset),
        ]);

        console.log('Resultado de la consulta paginada:', result); // Verificar qué datos se devuelven
        res.json(result);
    } catch (err) {
        console.error('Error al obtener los clientes:', err);
        res.status(500).json({ mensaje: 'Error al obtener los clientes' });
    }
    });


module.exports = router;
