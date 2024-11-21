// server.js

const PORT = process.env.PORT || 5501;

require('dotenv').config();
const db = require('./models/db'); 
const express = require('express');
const bodyParser = require('body-parser');
const registroRoutes = require('./routes/registro');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const contactoRoutes = require('./routes/contacto');
const perfilRoutes = require('./routes/perfil');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const registroRoute = require('./routes/registro'); // Ruta al archivo de registro
const { verificarToken } = require('./models/middlewares'); // Asegúrate de que la ruta es correcta
const User = require('./models/User'); // Asegúrate de que la ruta sea correcta
const Paquete = require('./models/paquete'); // Importar el modelo de paquete si está en otro archivo
const protectedRoute = require('./routes/protectedRoute'); // Verifica que la ruta sea correcta
const cors = require('cors');
const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public/')));
app.use(express.json()); // Middleware para procesar JSON
app.use(express.urlencoded({ extended:true }));
app.use(cors());
// Configuración de CORS para permitir solicitudes de localhost:5501
app.use(cors({
    origin: 'http://localhost:5501', // Cambia el origen a la URL desde la cual haces la solicitud
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Incluye todos los encabezados necesarios
}));


// Usa la ruta protegida


// Rutas
app.use('/api', authRoutes);
app.use('/api', protectedRoute);
app.use('/api', registroRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/protected', protectedRoute);
// Página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Iniciar el servidor

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    
});

function generarToken(usuario) {
    const token = jwt.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, 'Admin', { expiresIn: '1h' });
    return token;
};

// module.exports = router;

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar al usuario por su email
        const user = await User.findByEmail(email); // Asegúrate de que User.findByEmail esté implementado correctamente
        if (!user) {
            console.log("Usuario no encontrado.");
            return res.status(400).json({ exito: false, mensaje: 'Correo o contraseña incorrectos' });
        }

        // Comprobar que la contraseña sea correcta
      // Validar que el usuario esté verificado
      if (!user.is_verified) {
        return res.status(403).json({ exito: false, mensaje: 'Por favor, verifica tu cuenta antes de iniciar sesión.' });
    }

    // Validar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ exito: false, mensaje: 'Correo o contraseña incorrectos' });
    }
        // Generar el token JWT
        const token = generarToken({ id: user.id, rol: user.rol }, process.env.JWT_SECRET || 'Admin', { expiresIn: '24h' });

        // Devolver respuesta con el token y el rol
        res.json({ exito: true, mensaje: 'Inicio de sesión exitoso', token, rol: user.rol });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }});
//---------------------------------------------------------
//Configurar el backend para obtener datos de los clientes
app.get('/api/usuarios', verificarToken, async (req, res) => {
    // Verificar si el usuario es administrador
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    try {
        const { search } = req.query;

        // Base de la consulta SQL
        let query = `
            SELECT 
                u.id, 
                u.nombre, 
                u.apellido, 
                u.email, 
                u.telefono, 
                u.direccion, 
                u.fecha_nacimiento AS fechaNacimiento, 
                COALESCE(p.estado, 'Sin paquete') AS estado_paquete
            FROM usuarios u
            LEFT JOIN paquetes p ON p.user_id = u.id
            WHERE u.rol = 'cliente'
        `;

        const params = [];

        // Agregar filtros de búsqueda si existen
        if (search) {
            const [nombre, apellido] = search.split(" ");

            if (nombre) {
                query += ` AND u.nombre LIKE ?`;
                params.push(`%${nombre}%`);
            }
            if (apellido) {
                query += ` AND u.apellido LIKE ?`;
                params.push(`%${apellido}%`);
            }
        }

        // Ejecutar la consulta
        const [usuarios] = await db.query(query, params);

        if (!usuarios || usuarios.length === 0) {
            return res.json([]); // Retornar lista vacía si no hay usuarios
        }

        // Responder con los datos obtenidos
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
});



//---------------------------------------------------------------
//Obtener la información del perfil:

// Importa la ruta protegida
app.get('/api/perfil', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.user.id; // Asume que `verificarToken` agrega `req.user`.
        const usuario = await User.findById(usuarioId); // Método para obtener el usuario.

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
 // Definir valores de datosCasillero y datosOcean directamente en el código
 const datosCasillero = {
    nombre: `${usuario.nombre} ${usuario.apellido}/CJS`,
    direccion: "1345 Nw 98th Ct, Unit 2c",
    ciudad: "Doral",
    estado: "FL",
    codigoPostal: "33172-3049",
    pais: "Estados Unidos",
    telefono: "(786)330-2816"
};

const datosOcean = {
    nombre: `${usuario.nombre} ${usuario.apellido}/CJS Ocean`,
    direccion: "1345 Nw 98th Ct, Unit 2",
    direccion2: "OCEAN",
    ciudad: "Miami",
    estado: "FL",
    codigoPostal: "33172-3049",
    pais: "Estados Unidos",
    telefono: "+1(786)3602816"
};

        res.json({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            datosCasillero,
            datosOcean
        });
    } catch (error) {
        console.error('Error en /api/perfil:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});
// Resto de tu configuración del servidor...

//Obtener el estado del paquete:
app.get('/api/estado-paquete', verificarToken, async (req, res) => {
    try {
        const userId = req.user.id; // Obtener el ID del usuario autenticado

        // Buscar el paquete correspondiente al usuario
        const paquetes = await Paquete.findByUserId(userId);

        if (paquetes.length > 0) {
            // Si hay paquetes, devolver el estado del primer paquete (o puedes ajustar para múltiples paquetes)
          // Si hay paquetes, devolver el estado del primer paquete
          res.json({ estado: paquetes[0].estado });
        } else {
            res.json({ estado: 'No hay paquetes asociados' });
        }
    } catch (error) {
        console.error('Error al obtener el estado del paquete:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});
// PUT para actualizar el estado del paquete en el adminsitrador 
app.put('/api/usuarios/:userId/paquete', verificarToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { nuevoEstado } = req.body;

        // Verificar que el usuario autenticado tenga permisos
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'Acceso denegado' });
        }

        if (!nuevoEstado) {
            return res.status(400).json({ mensaje: 'El campo "nuevoEstado" es obligatorio' });
        }
        // Obtener el email del usuario
        const [usuario] = await db.query(`SELECT email FROM usuarios WHERE id = ?`, [userId]);
        if (!usuario || usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Actualizar el estado del paquete y enviar la notificación
        const resultado = await Paquete.updateEstado(userId, nuevoEstado, usuario[0].email);
        if (resultado.affectedRows === 0) {
            return res.status(500).json({ mensaje: 'Error al actualizar el estado del paquete.' });
        }
        res.json({ mensaje: 'Estado del paquete actualizado correctamente', resultado });
    } catch (error) {
        console.error('Error al actualizar el estado del paquete:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});
