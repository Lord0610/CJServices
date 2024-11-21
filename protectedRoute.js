// routes/protectedRoute.js
const express = require('express');
const { verificarToken } = require('../models/middlewares'); // Asegúrate de importar correctamente

const router = express.Router();

// Ruta protegida de ejemplo
router.get('/', verificarToken, (req, res) => {
    res.json({ mensaje: 'Acceso a la ruta protegida exitoso' });
});

// Exporta el router
module.exports = router;
