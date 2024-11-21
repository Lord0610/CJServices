// models/Pedido.js
const db = require('./db');

const Pedido = {
    findByUserId: (userId, callback) => {
        const query = `SELECT * FROM pedidos WHERE user_id = ? ORDER BY fecha DESC`;
        db.query(query, [userId], callback);
    }
};

module.exports = Pedido;
