#!/bin/bash

# ========================================
# INSTALACIÓN RÁPIDA AUDACITY CONTADOR
# ========================================
# Script para instalar desde GitHub en un solo comando

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  INSTALACIÓN RÁPIDA AUDACITY   ${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header

# Verificar argumentos
if [ $# -eq 0 ]; then
    print_error "Uso: $0 <usuario@servidor>"
    print_error "Ejemplo: $0 usuario@mi-servidor.com"
    exit 1
fi

SERVER=$1
REPO_URL="https://github.com/WadeWatts9/audacity_contador.git"

print_message "Iniciando instalación en: $SERVER"
print_message "Repositorio: $REPO_URL"

# Crear script temporal
TEMP_SCRIPT="/tmp/install-audacity-remote.sh"

print_message "Creando script de instalación remota..."

# Generar script para ejecutar en el servidor remoto
cat > $TEMP_SCRIPT << 'EOF'
#!/bin/bash
set -e

# Variables
REPO_URL="https://github.com/WadeWatts9/audacity_contador.git"
APP_NAME="audacity-contador"
APP_DIR="/home/$(whoami)/$APP_NAME"
WEB_DIR="/public_html/audacity"
NODE_VERSION="18"
PORT="3000"

echo "🚀 Instalando AUDACITY Contador..."

# 1. Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias
echo "🔧 Instalando dependencias..."
sudo apt install -y curl wget git build-essential software-properties-common

# 3. Instalar Node.js
echo "📦 Instalando Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Instalar PM2
echo "⚙️ Instalando PM2..."
sudo npm install -g pm2

# 5. Crear directorio y clonar
echo "📁 Clonando repositorio..."
mkdir -p $APP_DIR
cd $APP_DIR
git clone $REPO_URL .

# 6. Instalar dependencias
echo "📦 Instalando dependencias de Node.js..."
npm install

# 7. Crear directorio de logs
mkdir -p logs

# 8. Configurar permisos
sudo chown -R $(whoami):$(whoami) $APP_DIR
chmod +x $APP_DIR/*.sh 2>/dev/null || true

# 9. Configurar directorio web
sudo mkdir -p $WEB_DIR
sudo cp -r $APP_DIR/* $WEB_DIR/
sudo chown -R www-data:www-data $WEB_DIR
sudo chmod -R 755 $WEB_DIR

# 10. Configurar .htaccess
sudo tee $WEB_DIR/.htaccess > /dev/null << 'HTACCESS'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^(.*)$ ws://localhost:3000/$1 [P,L]
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
HTACCESS

# 11. Iniciar con PM2
echo "🚀 Iniciando aplicación..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 12. Configurar firewall
if command -v ufw &> /dev/null; then
    sudo ufw allow $PORT
    sudo ufw allow 80
    sudo ufw allow 443
fi

# 13. Verificar instalación
sleep 5
if pm2 list | grep -q "audacity-contador"; then
    echo "✅ Aplicación instalada y ejecutándose correctamente"
    echo "🌐 Accede a: http://$(hostname -I | awk '{print $1}'):$PORT"
    echo "🌐 Web: http://$(hostname -I | awk '{print $1}')/audacity"
else
    echo "❌ Error en la instalación"
    exit 1
fi

echo "🎉 ¡Instalación completada!"
EOF

# Hacer el script ejecutable
chmod +x $TEMP_SCRIPT

# Copiar script al servidor
print_message "Copiando script al servidor..."
scp $TEMP_SCRIPT $SERVER:/tmp/

# Ejecutar script en el servidor
print_message "Ejecutando instalación en el servidor..."
ssh $SERVER "bash /tmp/install-audacity-remote.sh"

# Limpiar archivo temporal
rm $TEMP_SCRIPT

print_message "🎉 ¡Instalación completada!"
print_message "La aplicación está ejecutándose en el servidor $SERVER"
