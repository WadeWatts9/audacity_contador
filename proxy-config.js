// Configuración de proxy para OpenLiteSpeed
// Ubicación: /var/www/audacity/proxy-config.js

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Configuración del proxy
const proxyOptions = {
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true, // Habilitar WebSockets
    logLevel: 'debug'
};

// Aplicar proxy a todas las rutas
app.use('/', createProxyMiddleware(proxyOptions));

// Servir archivos estáticos directamente
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Proxy ejecutándose en puerto ${PORT}`);
});
