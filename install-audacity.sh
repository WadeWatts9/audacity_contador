#!/bin/bash

# ========================================
# SCRIPT DE INSTALACIÓN AUDACITY CONTADOR
# ========================================
# Desarrollado para Alan Canto
# Repositorio: https://github.com/WadeWatts9/audacity_contador

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
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
    echo -e "${BLUE}  INSTALADOR AUDACITY CONTADOR  ${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar si se está ejecutando como root
if [[ $EUID -eq 0 ]]; then
   print_error "No ejecutes este script como root. Usa un usuario normal con permisos sudo."
   exit 1
fi

print_header

# Variables de configuración
REPO_URL="https://github.com/WadeWatts9/audacity_contador.git"
APP_NAME="audacity-contador"
APP_DIR="/home/$(whoami)/$APP_NAME"
WEB_DIR="/public_html/audacity"
NODE_VERSION="18"
PORT="3000"

print_message "Iniciando instalación de AUDACITY Contador..."
print_message "Repositorio: $REPO_URL"
print_message "Directorio de aplicación: $APP_DIR"
print_message "Directorio web: $WEB_DIR"

# 1. Actualizar sistema
print_message "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias del sistema
print_message "Instalando dependencias del sistema..."
sudo apt install -y curl wget git build-essential software-properties-common

# 3. Instalar Node.js
print_message "Instalando Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación de Node.js
NODE_VER=$(node --version)
NPM_VER=$(npm --version)
print_message "Node.js instalado: $NODE_VER"
print_message "NPM instalado: $NPM_VER"

# 4. Instalar PM2 globalmente
print_message "Instalando PM2 para gestión de procesos..."
sudo npm install -g pm2

# 5. Crear directorio de aplicación
print_message "Creando directorio de aplicación..."
mkdir -p $APP_DIR
cd $APP_DIR

# 6. Clonar repositorio
print_message "Clonando repositorio desde GitHub..."
if [ -d ".git" ]; then
    print_warning "El directorio ya contiene un repositorio Git. Actualizando..."
    git pull origin main
else
    git clone $REPO_URL .
fi

# 7. Instalar dependencias de Node.js
print_message "Instalando dependencias de Node.js..."
npm install

# 8. Crear directorio de logs
print_message "Creando directorio de logs..."
mkdir -p logs

# 9. Configurar permisos
print_message "Configurando permisos..."
sudo chown -R $(whoami):$(whoami) $APP_DIR
chmod +x $APP_DIR/*.sh 2>/dev/null || true
chmod 644 $APP_DIR/*.js $APP_DIR/*.json $APP_DIR/*.html $APP_DIR/*.css 2>/dev/null || true

# 10. Crear directorio web y copiar archivos
print_message "Configurando directorio web..."
sudo mkdir -p $WEB_DIR
sudo cp -r $APP_DIR/* $WEB_DIR/
sudo chown -R www-data:www-data $WEB_DIR
sudo chmod -R 755 $WEB_DIR

# 11. Configurar archivo .htaccess
print_message "Configurando .htaccess..."
sudo tee $WEB_DIR/.htaccess > /dev/null << 'EOF'
RewriteEngine On

# Redirigir todas las peticiones a la aplicación Node.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Configuración para WebSockets
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^(.*)$ ws://localhost:3000/$1 [P,L]

# Headers para CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Configuración de caché para archivos estáticos
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header set Cache-Control "public, max-age=2592000"
</FilesMatch>

# Configuración de seguridad
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
EOF

# 12. Configurar PM2
print_message "Configurando PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 13. Configurar firewall (si está disponible)
print_message "Configurando firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow $PORT
    sudo ufw allow 80
    sudo ufw allow 443
    print_message "Firewall configurado"
else
    print_warning "UFW no está disponible. Configura el firewall manualmente si es necesario."
fi

# 14. Crear script de monitoreo
print_message "Creando script de monitoreo..."
sudo tee /usr/local/bin/monitor-audacity > /dev/null << 'EOF'
#!/bin/bash
echo "=== ESTADO DE AUDACITY CONTADOR ==="
echo "Fecha: $(date)"
echo ""

echo "=== PM2 STATUS ==="
pm2 status

echo ""
echo "=== LOGS RECIENTES ==="
pm2 logs audacity-contador --lines 10

echo ""
echo "=== USO DE RECURSOS ==="
pm2 monit --no-interaction
EOF

sudo chmod +x /usr/local/bin/monitor-audacity

# 15. Crear script de reinicio
print_message "Creando script de reinicio..."
sudo tee /usr/local/bin/restart-audacity > /dev/null << 'EOF'
#!/bin/bash
echo "Reiniciando AUDACITY Contador..."
pm2 restart audacity-contador
echo "Aplicación reiniciada correctamente"
EOF

sudo chmod +x /usr/local/bin/restart-audacity

# 16. Verificar instalación
print_message "Verificando instalación..."
sleep 5

# Verificar que PM2 esté ejecutando la aplicación
if pm2 list | grep -q "audacity-contador"; then
    print_message "✅ Aplicación ejecutándose correctamente"
else
    print_error "❌ Error: La aplicación no está ejecutándose"
    exit 1
fi

# Verificar que el puerto esté abierto
if netstat -tuln | grep -q ":$PORT "; then
    print_message "✅ Puerto $PORT está abierto"
else
    print_warning "⚠️  Puerto $PORT no está visible. Verifica la configuración."
fi

# 17. Mostrar información final
print_header
print_message "🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE!"
echo ""
print_message "📋 INFORMACIÓN DE LA INSTALACIÓN:"
echo "   • Aplicación: $APP_NAME"
echo "   • Directorio: $APP_DIR"
echo "   • Directorio web: $WEB_DIR"
echo "   • Puerto: $PORT"
echo "   • Node.js: $NODE_VER"
echo "   • NPM: $NPM_VER"
echo ""
print_message "🌐 URLs DE ACCESO:"
echo "   • Principal: http://$(hostname -I | awk '{print $1}'):$PORT"
echo "   • Web: http://$(hostname -I | awk '{print $1}')/audacity"
echo ""
print_message "👥 USUARIOS DEL SISTEMA:"
echo "   • Admin: alan / 20243"
echo "   • Gallo: contador_gallo / galloazul"
echo "   • León: contador_leon / reyleon"
echo "   • Perro: contador_perro / dalmata"
echo "   • Mano: contador_mano / guante"
echo "   • Estrella: contador_estrella / brillante"
echo ""
print_message "🔧 COMANDOS ÚTILES:"
echo "   • Ver estado: pm2 status"
echo "   • Ver logs: pm2 logs audacity-contador"
echo "   • Reiniciar: pm2 restart audacity-contador"
echo "   • Monitorear: monitor-audacity"
echo "   • Reiniciar: restart-audacity"
echo ""
print_message "📁 ARCHIVOS IMPORTANTES:"
echo "   • Configuración: $APP_DIR/ecosystem.config.js"
echo "   • Logs: $APP_DIR/logs/"
echo "   • Web: $WEB_DIR/"
echo ""
print_warning "⚠️  IMPORTANTE:"
echo "   • Configura tu dominio en el panel de Hostinger"
echo "   • Verifica que OpenLiteSpeed esté configurado correctamente"
echo "   • Revisa los logs si hay problemas: pm2 logs audacity-contador"
echo ""
print_message "✅ La aplicación está lista para usar!"
