 los ueconst express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware para forzar el uso del dominio correcto
app.use((req, res, next) => {
    // Si la petición viene de una IP o dominio incorrecto, redirigir al dominio correcto
    if (req.hostname !== 'audacity.alancanto.net' && req.hostname !== 'www.audacity.alancanto.net') {
        return res.redirect(301, `https://audacity.alancanto.net${req.originalUrl}`);
    }
    next();
});

const PORT = process.env.PORT || 3000;

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
        
        // Enviar saldos actuales al usuario que se conecta
        socket.emit('balances_update', balances);
        console.log(`📊 Enviando saldos actuales a ${userData.username}:`, balances);
    });

    // Manejar actualización de saldos
    socket.on('update_balance', (data) => {
        const { counter, amount, operation } = data;
        const userData = connectedUsers.get(socket.id);
        const userName = userData ? userData.username : 'Usuario desconocido';
        
        console.log(`Usuario ${userName} realizó operación: ${operation} en ${counter} por ${amount}`);
        
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

        // Enviar actualización a TODOS los clientes conectados
        console.log('🔄 Enviando actualización a todos los clientes...');
        io.emit('balances_update', balances);
        
        // Notificar a todos sobre la operación realizada
        io.emit('operation_notification', {
            user: userName,
            operation: operation,
            counter: counter,
            amount: amount,
            timestamp: new Date().toLocaleTimeString()
        });
        
        console.log('✅ Saldos actualizados y enviados a todos los clientes:', balances);
        console.log(`👥 Clientes conectados: ${io.engine.clientsCount}`);
        
        // Verificar que el objeto balances se esté actualizando correctamente
        console.log('📊 Estado actual de balances:', JSON.stringify(balances, null, 2));
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

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor AUDACITY ejecutándose en puerto ${PORT}`);
    console.log(`Accede a: http://localhost:${PORT}`);
});

module.exports = { app, server, io };
