# 🚀 Instalación de AUDACITY Contador vía SSH

## 📋 Scripts de Instalación Disponibles

### 1. **Instalación Completa** (`install-audacity.sh`)
Script completo para instalar la aplicación paso a paso.

### 2. **Instalación Rápida** (`quick-install.sh`)
Instalación automatizada desde GitHub en un solo comando.

### 3. **Configuración OpenLiteSpeed** (`configure-openlitespeed.sh`)
Configura el proxy de OpenLiteSpeed para la aplicación.

## 🔧 Instalación Rápida (Recomendada)

### **Paso 1: Preparar el Script**
```bash
# Descargar el script de instalación rápida
wget https://raw.githubusercontent.com/WadeWatts9/audacity_contador/main/quick-install.sh
chmod +x quick-install.sh
```

### **Paso 2: Ejecutar Instalación**
```bash
# Instalar en tu servidor (reemplaza con tu usuario y servidor)
./quick-install.sh usuario@tu-servidor.com
```

**Ejemplo:**
```bash
./quick-install.sh alan@alancanto.net
```

## 🛠️ Instalación Manual Paso a Paso

### **Paso 1: Conectar por SSH**
```bash
ssh usuario@tu-servidor.com
```

### **Paso 2: Descargar y Ejecutar Script**
```bash
# Descargar el script
wget https://raw.githubusercontent.com/WadeWatts9/audacity_contador/main/install-audacity.sh
chmod +x install-audacity.sh

# Ejecutar instalación
./install-audacity.sh
```

### **Paso 3: Configurar OpenLiteSpeed (Opcional)**
```bash
# Descargar script de configuración
wget https://raw.githubusercontent.com/WadeWatts9/audacity_contador/main/configure-openlitespeed.sh
chmod +x configure-openlitespeed.sh

# Ejecutar configuración
./configure-openlitespeed.sh
```

## 📁 Estructura de Archivos Después de la Instalación

```
/home/usuario/audacity-contador/     # Aplicación principal
├── app.js                          # Servidor Node.js
├── package.json                    # Dependencias
├── ecosystem.config.js             # Configuración PM2
├── index-realtime.html             # Página principal
├── script-realtime.js              # Lógica del cliente
├── styles.css                      # Estilos
├── logs/                           # Directorio de logs
└── ...

/public_html/audacity/              # Directorio web
├── (mismos archivos)
└── .htaccess                       # Configuración Apache/OpenLiteSpeed
```

## 🌐 URLs de Acceso

Después de la instalación, podrás acceder a:

- **Directo**: `http://tu-servidor.com:3000`
- **Web**: `http://tu-servidor.com/audacity`
- **Con dominio**: `http://alancanto.net/audacity`

## 👥 Usuarios del Sistema

| Contador   | Usuario            | Contraseña |
|------------|--------------------|------------|
| Admin      | alan               | 20243      |
| Gallo Azul | contador_gallo     | galloazul  |
| Rey León   | contador_leon      | reyleon    |
| Dálmata    | contador_perro     | dalmata    |
| Guante     | contador_mano      | guante     |
| Brillante  | contador_estrella  | brillante  |

## 🔧 Comandos de Gestión

### **Ver Estado de la Aplicación**
```bash
pm2 status
```

### **Ver Logs**
```bash
pm2 logs audacity-contador
```

### **Reiniciar Aplicación**
```bash
pm2 restart audacity-contador
```

### **Detener Aplicación**
```bash
pm2 stop audacity-contador
```

### **Iniciar Aplicación**
```bash
pm2 start audacity-contador
```

### **Monitorear Recursos**
```bash
pm2 monit
```

## 🛠️ Solución de Problemas

### **Si la aplicación no inicia:**
```bash
# Verificar logs
pm2 logs audacity-contador

# Verificar puerto
netstat -tuln | grep 3000

# Reiniciar aplicación
pm2 restart audacity-contador
```

### **Si no hay tiempo real:**
1. Verificar que WebSockets estén habilitados
2. Revisar la consola del navegador
3. Verificar configuración de .htaccess

### **Si hay errores de permisos:**
```bash
# Corregir permisos
sudo chown -R www-data:www-data /public_html/audacity
sudo chmod -R 755 /public_html/audacity
```

## 📊 Monitoreo

### **Script de Monitoreo Personalizado**
```bash
# Ver estado completo
monitor-audacity

# Reiniciar aplicación
restart-audacity
```

### **Verificar Recursos del Sistema**
```bash
# Uso de CPU y memoria
htop

# Espacio en disco
df -h

# Procesos de Node.js
ps aux | grep node
```

## 🔄 Actualizaciones

### **Actualizar desde GitHub:**
```bash
cd /home/usuario/audacity-contador
git pull origin main
npm install
pm2 restart audacity-contador
```

### **Actualizar archivos web:**
```bash
sudo cp -r /home/usuario/audacity-contador/* /public_html/audacity/
sudo chown -R www-data:www-data /public_html/audacity
```

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs**: `pm2 logs audacity-contador`
2. **Verifica el estado**: `pm2 status`
3. **Revisa la consola del navegador** para errores JavaScript
4. **Verifica la configuración** de OpenLiteSpeed/Apache

## 📝 Notas Importantes

- La aplicación se ejecuta en el puerto 3000
- PM2 mantiene la aplicación ejecutándose automáticamente
- Los logs se guardan en `/home/usuario/audacity-contador/logs/`
- La configuración de proxy está en `/public_html/audacity/.htaccess`
- El sistema soporta hasta 6 usuarios simultáneos

## 🎯 Resultado Final

Una vez completada la instalación tendrás:

✅ **Sistema funcionando** en tu servidor
✅ **Tiempo real completo** entre usuarios
✅ **Gestión automática** con PM2
✅ **Logs centralizados** para monitoreo
✅ **Configuración optimizada** para producción
✅ **Scripts de mantenimiento** incluidos
