# 🚀 Guía de Despliegue en Hostinger - AUDACITY

## 📋 Archivos Necesarios para Hostinger

### Archivos Principales:
- ✅ `app.js` - Servidor Node.js principal
- ✅ `package.json` - Dependencias del proyecto
- ✅ `index-realtime.html` - Página principal
- ✅ `script-realtime.js` - Lógica del cliente
- ✅ `styles.css` - Estilos del sistema
- ✅ `.htaccess` - Configuración de Apache

### Archivos Adicionales:
- ✅ `server.js` - Servidor de desarrollo (opcional)
- ✅ `index.html` - Versión simple (opcional)
- ✅ `script.js` - Versión simple (opcional)

## 🔧 Configuración en Hostinger

### 1. Acceder al Panel de Control (hPanel)
1. Inicia sesión en tu cuenta de Hostinger
2. Ve a "Hosting" → "Gestionar"
3. Busca tu dominio `alancanto.net`

### 2. Habilitar Node.js
1. En el panel de control, busca "Node.js"
2. Activa Node.js para tu dominio
3. Selecciona la versión más reciente (18.x o superior)

### 3. Configurar la Aplicación
1. Ve a "Node.js" → "Aplicaciones"
2. Crea una nueva aplicación:
   - **Nombre**: `audacity-contador`
   - **Directorio**: `/public_html/audacity`
   - **Archivo de inicio**: `app.js`
   - **Puerto**: `3000` (o el que asigne Hostinger)

### 4. Subir Archivos
1. Usa el **File Manager** de Hostinger
2. Navega a `/public_html/audacity/`
3. Sube todos los archivos necesarios

### 5. Instalar Dependencias
1. En el panel de Node.js, ve a "Terminal"
2. Ejecuta: `npm install`
3. Verifica que se instalen: `express` y `socket.io`

### 6. Iniciar la Aplicación
1. En el panel de Node.js, inicia la aplicación
2. Verifica que esté ejecutándose en el puerto asignado

## 🌐 Acceso al Sistema

### URL Principal:
- **Producción**: `https://audacity.alancanto.net`
- **Directo**: `https://alancanto.net/audacity`

### Usuarios del Sistema:
- **Admin**: `alan` / `20243`
- **Contador Gallo**: `contador_gallo` / `galloazul`
- **Contador León**: `contador_leon` / `reyleon`
- **Contador Perro**: `contador_perro` / `dalmata`
- **Contador Mano**: `contador_mano` / `guante`
- **Contador Estrella**: `contador_estrella` / `brillante`

## 🔍 Verificación del Despliegue

### 1. Verificar Funcionamiento:
- ✅ La página carga correctamente
- ✅ El login funciona con todos los usuarios
- ✅ Los saldos se actualizan en tiempo real
- ✅ El dashboard muestra las operaciones
- ✅ Múltiples usuarios pueden conectarse simultáneamente

### 2. Verificar Tiempo Real:
- ✅ Abrir múltiples pestañas/navegadores
- ✅ Hacer operaciones en una pestaña
- ✅ Ver cambios instantáneos en otras pestañas

## 🛠️ Solución de Problemas

### Si la aplicación no inicia:
1. Verificar que Node.js esté habilitado
2. Verificar que `package.json` esté correcto
3. Verificar que `app.js` sea el archivo de inicio
4. Revisar los logs en el panel de Hostinger

### Si no hay tiempo real:
1. Verificar que WebSockets estén habilitados
2. Verificar que el puerto esté correcto
3. Verificar que no haya errores en la consola del navegador

### Si hay errores de permisos:
1. Verificar permisos de archivos (644 para archivos, 755 para directorios)
2. Verificar que `.htaccess` esté configurado correctamente

## 📞 Soporte

Si tienes problemas con el despliegue:
1. Revisa los logs en el panel de Hostinger
2. Verifica la consola del navegador para errores
3. Contacta al soporte de Hostinger si es necesario

## 🎯 Resultado Final

Una vez desplegado correctamente, tendrás:
- ✅ Sistema funcionando en `https://audacity.alancanto.net`
- ✅ Tiempo real completo entre usuarios
- ✅ Dashboard con historial de operaciones
- ✅ Soporte para hasta 6 usuarios simultáneos
- ✅ Interfaz moderna y responsive
