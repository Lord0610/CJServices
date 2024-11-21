// models/db.js
require('dotenv').config(); // Cargar las variables de entorno

const mysql = require('mysql2/promise');



const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Dr@gonball06',
    database: 'cjservices'
});



module.exports = db;