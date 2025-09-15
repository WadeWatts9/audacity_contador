# 🔧 Solución para Problema de URL en PCs de Escritorio

## 📋 Problema Identificado

En dispositivos móviles, la URL `audacity.alancanto.net` se mantiene correctamente en la barra de direcciones, pero en PCs de escritorio aparece una IP en lugar del dominio.

## 🎯 Causa del Problema

El problema se debe a la configuración del proxy que no está forzando correctamente el uso del dominio en la barra de direcciones. Algunos navegadores de escritorio pueden mostrar la IP interna en lugar del dominio configurado.

## ✅ Solución Implementada

### 1. Archivos Modificados

#### `.htaccess` - Configuración de Apache
- ✅ Agregadas reglas de redirección para forzar el uso del dominio correcto
- ✅ Configuración para redirigir HTTP a HTTPS
- ✅ Exclusión de localhost y 127.0.0.1 para desarrollo local

#### `app.js` - Servidor Node.js
- ✅ Agregado middleware para verificar el hostname
- ✅ Redirección automática a `audacity.alancanto.net` si se accede desde IP

### 2. Archivos Nuevos Creados

#### `fix-url-redirect.sh` - Script de Corrección
- ✅ Script automatizado para aplicar todas las correcciones
- ✅ Verificación de módulos de Apache necesarios
- ✅ Configuración de virtual host
- ✅ Pruebas de funcionamiento

#### `audacity-vhost.conf` - Configuración de Virtual Host
- ✅ Configuración completa de Apache para el dominio
- ✅ Headers de seguridad
- ✅ Configuración de proxy para Node.js
- ✅ Soporte para WebSockets

#### `audacity-nginx.conf` - Configuración de Nginx (Alternativa)
- ✅ Configuración equivalente para Nginx
- ✅ SSL/TLS moderno
- ✅ Headers de seguridad
- ✅ Proxy para Node.js y WebSockets

## 🚀 Cómo Aplicar la Solución

### Opción 1: Script Automatizado (Recomendado)

```bash
# En el servidor, ejecutar:
sudo ./fix-url-redirect.sh
```

### Opción 2: Aplicación Manual

#### Para Apache:

1. **Habilitar módulos necesarios:**
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo systemctl restart apache2
```

2. **Aplicar configuración de virtual host:**
```bash
sudo cp audacity-vhost.conf /etc/apache2/sites-available/audacity.alancanto.net.conf
sudo a2ensite audacity.alancanto.net.conf
sudo systemctl reload apache2
```

3. **Verificar que el archivo .htaccess esté actualizado:**
```bash
# El archivo .htaccess ya está actualizado con las correcciones
```

#### Para Nginx:

1. **Aplicar configuración:**
```bash
sudo cp audacity-nginx.conf /etc/nginx/sites-available/audacity.alancanto.net
sudo ln -s /etc/nginx/sites-available/audacity.alancanto.net /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Verificación de la Solución

### 1. Pruebas de Redirección

```bash
# Probar redirección HTTP a HTTPS
curl -I http://audacity.alancanto.net

# Debería mostrar: HTTP/1.1 301 Moved Permanently
# Location: https://audacity.alancanto.net/
```

### 2. Pruebas de Dominio

```bash
# Probar acceso desde IP (debería redirigir)
curl -I http://TU_IP_SERVIDOR

# Debería mostrar redirección a audacity.alancanto.net
```

### 3. Pruebas en Navegador

1. **Abrir navegador en PC de escritorio**
2. **Acceder a `http://audacity.alancanto.net`**
3. **Verificar que:**
   - Se redirija automáticamente a `https://audacity.alancanto.net`
   - La URL se mantenga como `audacity.alancanto.net` en la barra de direcciones
   - No aparezca ninguna IP en la barra de direcciones

## 🛠️ Solución de Problemas

### Si la redirección no funciona:

1. **Verificar que mod_rewrite esté habilitado:**
```bash
apache2ctl -M | grep rewrite
```

2. **Verificar logs de Apache:**
```bash
sudo tail -f /var/log/apache2/error.log
```

3. **Verificar configuración de DNS:**
```bash
nslookup audacity.alancanto.net
```

### Si aparece error 500:

1. **Verificar sintaxis del .htaccess:**
```bash
sudo apache2ctl configtest
```

2. **Verificar permisos del archivo .htaccess:**
```bash
ls -la .htaccess
# Debería mostrar: -rw-r--r--
```

## 📊 Resultado Esperado

Después de aplicar la solución:

- ✅ **Dispositivos móviles**: URL se mantiene como `audacity.alancanto.net`
- ✅ **PCs de escritorio**: URL se mantiene como `audacity.alancanto.net` (ya no aparece IP)
- ✅ **Redirección automática**: HTTP → HTTPS
- ✅ **Funcionalidad completa**: WebSockets y tiempo real funcionando
- ✅ **Seguridad mejorada**: Headers de seguridad aplicados

## 🔄 Rollback (Si es necesario)

Si necesitas revertir los cambios:

```bash
# Restaurar .htaccess desde backup
cp .htaccess.backup.* .htaccess

# Deshabilitar virtual host
sudo a2dissite audacity.alancanto.net.conf
sudo systemctl reload apache2
```

## 📞 Soporte

Si tienes problemas con la implementación:

1. Revisa los logs del servidor web
2. Verifica la configuración de DNS
3. Asegúrate de que todos los módulos estén habilitados
4. Prueba la configuración con `apache2ctl configtest` o `nginx -t`

---

**Nota**: Esta solución asegura que la URL `audacity.alancanto.net` se mantenga en la barra de direcciones en todos los dispositivos, incluyendo PCs de escritorio, resolviendo el problema de que aparezca una IP en lugar del dominio.
