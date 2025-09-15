#!/bin/bash

# ========================================
# SCRIPT PARA CORREGIR PROBLEMA DE URL
# ========================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  CORRECCIÓN DE PROBLEMA DE URL  ${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header

# Variables
DOMAIN="audacity.alancanto.net"
WEB_DIR="/public_html/audacity"

print_message "Corrigiendo problema de URL en dispositivos de escritorio..."

# 1. Verificar que el archivo .htaccess existe
if [ ! -f "$WEB_DIR/.htaccess" ]; then
    print_error "No se encontró el archivo .htaccess en $WEB_DIR"
    exit 1
fi

print_message "✅ Archivo .htaccess encontrado"

# 2. Crear backup del .htaccess actual
print_message "Creando backup del .htaccess actual..."
cp "$WEB_DIR/.htaccess" "$WEB_DIR/.htaccess.backup.$(date +%Y%m%d_%H%M%S)"

# 3. Verificar configuración de Apache
print_message "Verificando configuración de Apache..."

# Verificar si mod_rewrite está habilitado
if ! apache2ctl -M | grep -q rewrite; then
    print_warning "mod_rewrite no está habilitado. Habilitando..."
    a2enmod rewrite
    systemctl restart apache2
fi

# Verificar si mod_headers está habilitado
if ! apache2ctl -M | grep -q headers; then
    print_warning "mod_headers no está habilitado. Habilitando..."
    a2enmod headers
    systemctl restart apache2
fi

# Verificar si mod_proxy está habilitado
if ! apache2ctl -M | grep -q proxy; then
    print_warning "mod_proxy no está habilitado. Habilitando..."
    a2enmod proxy
    a2enmod proxy_http
    a2enmod proxy_wstunnel
    systemctl restart apache2
fi

print_message "✅ Módulos de Apache verificados"

# 4. Crear configuración de virtual host si no existe
VHOST_FILE="/etc/apache2/sites-available/$DOMAIN.conf"
if [ ! -f "$VHOST_FILE" ]; then
    print_message "Creando configuración de virtual host..."
    
    sudo tee "$VHOST_FILE" > /dev/null << EOF
# Configuración de Virtual Host para AUDACITY
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    DocumentRoot $WEB_DIR
    
    # Redirigir HTTP a HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    DocumentRoot $WEB_DIR
    
    # Headers de seguridad
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    # Configuración de proxy para Node.js
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Configuración para WebSockets
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^(.*)$ ws://localhost:3000/$1 [P,L]
    
    # Forzar el uso del dominio correcto
    RewriteCond %{HTTP_HOST} !^$DOMAIN$ [NC]
    RewriteCond %{HTTP_HOST} !^www\.$DOMAIN$ [NC]
    RewriteRule ^(.*)$ https://$DOMAIN/\$1 [R=301,L]
</VirtualHost>
EOF

    # Habilitar el sitio
    a2ensite "$DOMAIN.conf"
    print_message "✅ Configuración de virtual host creada"
else
    print_message "✅ Configuración de virtual host ya existe"
fi

# 5. Reiniciar Apache
print_message "Reiniciando Apache..."
systemctl restart apache2

# 6. Verificar que Apache esté funcionando
if systemctl is-active --quiet apache2; then
    print_message "✅ Apache está ejecutándose correctamente"
else
    print_error "❌ Apache no está ejecutándose. Verifica la configuración."
    exit 1
fi

# 7. Verificar configuración de DNS
print_message "Verificando configuración de DNS..."
if nslookup "$DOMAIN" > /dev/null 2>&1; then
    print_message "✅ DNS configurado correctamente"
else
    print_warning "⚠️  Verifica la configuración de DNS para $DOMAIN"
fi

# 8. Probar la redirección
print_message "Probando redirección..."
if curl -I "http://$DOMAIN" 2>/dev/null | grep -q "301\|302"; then
    print_message "✅ Redirección HTTP a HTTPS funcionando"
else
    print_warning "⚠️  Verifica la redirección HTTP a HTTPS"
fi

print_message "🎉 Corrección de problema de URL completada!"
print_message "La URL $DOMAIN ahora debería mantenerse en la barra de direcciones"
print_message "en todos los dispositivos, incluyendo PCs de escritorio."

print_message ""
print_message "Para verificar que funciona:"
print_message "1. Accede a http://$DOMAIN (debería redirigir a HTTPS)"
print_message "2. Verifica que la URL se mantenga como https://$DOMAIN"
print_message "3. Prueba en diferentes navegadores y dispositivos"
