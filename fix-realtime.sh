#!/bin/bash

# ========================================
# SCRIPT PARA CORREGIR TIEMPO REAL
# ========================================

echo "🔧 Corrigiendo configuración de tiempo real..."

# 1. Verificar estado actual
echo "📊 Verificando estado de la aplicación..."
pm2 status

# 2. Crear backup
echo "💾 Creando backup..."
cp /root/audacity-contador/app.js /root/audacity-contador/app.js.backup

# 3. Crear versión corregida
echo "🔨 Creando versión corregida..."
cat > /root/audacity-contador/app-fixed.js << 'EOF'
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-realtime.html'));
});

// Almacenar saldos en memoria
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

        // Enviar actualización a TODOS los clientes conectados
        io.emit('balances_update', balances);
        console.log('Saldos actualizados:', balances);
        console.log('Usuarios conectados:', connectedUsers.size);
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
EOF

# 4. Aplicar cambios
echo "🔄 Aplicando cambios..."
cp /root/audacity-contador/app-fixed.js /root/audacity-contador/app.js

# 5. Reiniciar aplicación
echo "🚀 Reiniciando aplicación..."
pm2 restart audacity-contador

# 6. Verificar funcionamiento
echo "✅ Verificando funcionamiento..."
sleep 5
pm2 status

# 7. Verificar puerto
echo "🔌 Verificando puerto..."
netstat -tuln | grep :3000

echo "🎉 Proceso completado!"
echo "🌐 Prueba la aplicación en: http://82.25.66.210/"
echo "👥 Abre múltiples pestañas para probar el tiempo real"

