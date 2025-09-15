#!/bin/bash

# ========================================
# SCRIPT PARA CORREGIR WEBSOCKETS
# ========================================

echo "🔧 Corrigiendo configuración de WebSockets para tiempo real..."

# 1. Verificar estado de PM2
echo "📊 Verificando estado de la aplicación..."
pm2 status

# 2. Verificar logs de la aplicación
echo "📋 Revisando logs de la aplicación..."
pm2 logs audacity-contador --lines 20

# 3. Verificar que el puerto 3000 esté abierto
echo "🔌 Verificando puerto 3000..."
netstat -tuln | grep :3000

# 4. Probar conexión WebSocket local
echo "🧪 Probando conexión WebSocket..."
curl -I http://localhost:3000

# 5. Verificar configuración de CORS en app.js
echo "🔍 Verificando configuración de CORS..."
grep -A 10 "cors" /root/audacity-contador/app.js

# 6. Reiniciar la aplicación
echo "🔄 Reiniciando aplicación..."
pm2 restart audacity-contador

# 7. Verificar que esté funcionando
echo "✅ Verificando que la aplicación esté funcionando..."
sleep 5
pm2 status

echo "🎉 Proceso completado!"
echo "🌐 Prueba la aplicación en: http://82.25.66.210/"
echo "👥 Abre múltiples pestañas para probar el tiempo real"
