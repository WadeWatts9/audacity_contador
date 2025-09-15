const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');
const path = require('path');

const app = express();

// Middleware para forzar el uso del dominio correcto
app.use((req, res, next) => {
    if (req.hostname !== 'audacity.alancanto.net' && req.hostname !== 'www.audacity.alancanto.net') {
        return res.redirect(301, `https://audacity.alancanto.net${req.originalUrl}`);
    }
    next();
});

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta principal - Redirigir a la versión de tiempo real
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-realtime.html'));
});

// Almacenar saldos en memoria (en producción usar base de datos)
let balances = {
    bank: 0,
    gallo: 10000,
    leon: 10000,
    perro: 10000,
    mano: 10000,
    estrella: 10000
};

// Almacenar usuarios conectados
const connectedUsers = new Map();

// Configurar HTTPS
let httpsServer = null;
try {
    const options = {
        key: fs.readFileSync('/etc/ssl/audacity/audacity.key'),
        cert: fs.readFileSync('/etc/ssl/audacity/audacity.crt')
    };
    httpsServer = https.createServer(options, app);
    console.log('✅ HTTPS configurado correctamente');
} catch (error) {
    console.log('⚠️  No se encontraron certificados SSL, usando HTTP');
}

// Configurar HTTP
const httpServer = http.createServer(app);

// Configurar Socket.IO
const io = socketIo(httpsServer || httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Manejar conexiones WebSocket
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Enviar saldos actuales al usuario que se conecta
    socket.emit('balances_update', balances);

    // Manejar login
    socket.on('user_login', (userData) => {
        connectedUsers.set(socket.id, userData);
        socket.broadcast.emit('user_connected', userData);
        console.log(`Usuario ${userData.username} conectado`);
    });

    // Manejar actualización de saldos
    socket.on('update_balance', (data) => {
        const { counter, amount, operation } = data;
        
        if (operation === 'add') {
            balances[counter] += amount;
        } else if (operation === 'subtract') {
            balances[counter] = Math.max(0, balances[counter] - amount);
        } else if (operation === 'set') {
            balances[counter] = amount;
        } else if (operation === 'transfer') {
            balances[data.fromCounter] -= amount;
            balances[data.toCounter] += amount;
        } else if (operation === 'swap') {
            const temp = balances[data.fromCounter];
            balances[data.fromCounter] = balances[data.toCounter];
            balances[data.toCounter] = temp;
        } else if (operation === 'reset') {
            balances = {
                bank: 0,
                gallo: 10000,
                leon: 10000,
                perro: 10000,
                mano: 10000,
                estrella: 10000
            };
        }

        // Enviar actualización a todos los clientes
        io.emit('balances_update', balances);
        console.log('Saldos actualizados:', balances);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        const userData = connectedUsers.get(socket.id);
        if (userData) {
            socket.broadcast.emit('user_disconnected', userData);
            connectedUsers.delete(socket.id);
            console.log(`Usuario ${userData.username} desconectado`);
        }
    });
});

// Iniciar servidores
httpServer.listen(PORT, () => {
    console.log(`Servidor HTTP ejecutándose en puerto ${PORT}`);
    console.log(`Accede a: http://audacity.alancanto.net`);
});

if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`Servidor HTTPS ejecutándose en puerto ${HTTPS_PORT}`);
        console.log(`Accede a: https://audacity.alancanto.net`);
    });
}

module.exports = { app, server: httpsServer || httpServer, io };
