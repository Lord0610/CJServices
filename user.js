// models/User.js
const db = require('./db');

 // Asegúrate de que esté configurado con promesas

const User = {
    create: async (data) => {
        try {
            const query = `INSERT INTO usuarios (nombre, apellido, email, telefono, direccion, fecha_nacimiento, password, verification_token, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const [result] = await db.query(query, [
                data.nombre,
                data.apellido,
                data.email,
                data.telefono,
                data.direccion,
                data.fechaNacimiento,
                data.password,
                data.verificationToken, // Generado previamente
                 false, // isVerified se inicia como falso
                
            ]);
            return result;
        } catch (error) {
            console.error("Error en la creación de usuario:", error);
            throw error;
        }
    },

    findAll: async ({ excludeAdmins = false } = {}) => {
        try {
            const excludeClause = excludeAdmins ? "WHERE rol != 'admin'" : "";
            const query = `SELECT * FROM usuarios ${excludeClause}`;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error("Error en la consulta de todos los usuarios:", error);
            throw error;
        }
    },
    
    findByEmail: async (email) => {
        try {
            const query = `SELECT * FROM usuarios WHERE email = ?`;
            const [results] = await db.query(query, [email]);

            if (results.length === 0) {
                console.log("Usuario no encontrado para el correo:", email);
                return null;
            } else {
                console.log("Usuario encontrado:", results[0]);
                return results[0];
            }
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error;
        }
    },

// models/User.js

    findById: async (id) => {
        try {
            const query = `SELECT * FROM usuarios WHERE id = ?`;
            const [results] = await db.query(query, [id]);

            if (results.length === 0) {
                console.log("Usuario no encontrado para el ID:", id);
                return null;
            } else {
                console.log("Usuario encontrado:", results[0]);
                return results[0];
            }
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const query = `UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?`;
            const [result] = await db.query(query, [
                data.nombre,
                data.apellido,
                data.email,
                data.telefono,
                data.direccion,
                id
            ]);
            return result;
        } catch (error) {
            console.error("Error en la actualización de usuario:", error);
            throw error;
        }
    },

    
    updatePassword: async (id, password) => {
        try {
            const query = `UPDATE usuarios SET password = ? WHERE id = ?`;
            const [result] = await db.query(query, [password, id]);
            console.log(`Contraseña actualizada para el usuario con ID: ${id}`);
            return result;
        } catch (error) {
            console.error("Error al actualizar la contraseña:", error);
            throw error;
        }
    },
    // Verificar usuario al confirmar el token
 verifyUser: async (token) => {
    try {
        const query = `UPDATE usuarios SET is_verified = true, verification_token = NULL WHERE verification_token = ?`;
        const [result] = await db.query(query, [token]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error al verificar usuario:", error);
        throw error;
    }
},

// Buscar usuario por token de verificación
findByVerificationToken: async (token) => {
    try {
        const query = `SELECT * FROM usuarios WHERE verification_token = ?`;
        const [rows] = await db.query(query, [token]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("Error al buscar usuario por token:", error);
        throw error;
    }
},

};



// Función para buscar usuarios por nombre y apellido
User.findByNameAndSurname = async (nombre, apellido, { excludeAdmins = false } = {}) => {
    try {
        const excludeClause = excludeAdmins ? "AND rol != 'admin'" : "";
        const query = `
            SELECT * FROM usuarios 
            WHERE (nombre LIKE ? OR ? = '') 
            AND (apellido LIKE ? OR ? = '') 
            ${excludeClause}
        `;
        const [results] = await db.query(query, [`%${nombre}%`, nombre, `%${apellido}%`, apellido]);
        return results;
    } catch (error) {
        console.error("Error en la consulta de usuarios por nombre y apellido:", error);
        throw error;
    }
};
module.exports = User;



