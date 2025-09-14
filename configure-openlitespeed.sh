#!/bin/bash

# ========================================
# CONFIGURACIÓN OPENLITESPEED PARA AUDACITY
# ========================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  CONFIGURACIÓN OPENLITESPEED  ${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header

# Variables
DOMAIN="alancanto.net"
APP_PORT="3000"
WEB_DIR="/public_html/audacity"

print_message "Configurando OpenLiteSpeed para AUDACITY..."

# 1. Crear configuración de proxy
print_message "Creando configuración de proxy..."

sudo tee /etc/lighttpd/conf-available/audacity-proxy.conf > /dev/null << EOF
# Configuración de proxy para AUDACITY
\$HTTP["host"] =~ "^(.*\.)?$DOMAIN\$" {
    \$HTTP["url"] =~ "^/audacity" {
        proxy.server = ( "" => ( ( "host" => "127.0.0.1", "port" => $APP_PORT ) ) )
        proxy.header = ( "upgrade" => ( "Connection" => "upgrade" ) )
    }
}
EOF

# 2. Habilitar configuración
print_message "Habilitando configuración de proxy..."
sudo lighty-enable-mod audacity-proxy

# 3. Reiniciar Lighttpd
print_message "Reiniciando Lighttpd..."
sudo systemctl restart lighttpd

# 4. Verificar configuración
print_message "Verificando configuración..."
if sudo systemctl is-active --quiet lighttpd; then
    print_message "✅ Lighttpd está ejecutándose correctamente"
else
    print_warning "⚠️  Lighttpd no está ejecutándose. Verifica la configuración."
fi

print_message "🎉 Configuración de OpenLiteSpeed completada!"
print_message "Accede a: http://$DOMAIN/audacity"
