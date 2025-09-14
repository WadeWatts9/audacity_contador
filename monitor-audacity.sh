#!/bin/bash

# Script de monitoreo para AUDACITY
# Ubicación: /var/www/audacity/monitor-audacity.sh

APP_NAME="audacity-contador"
LOG_FILE="/var/www/audacity/logs/audacity.log"
PID_FILE="/var/www/audacity/logs/audacity.pid"

# Función para verificar si la aplicación está ejecutándose
check_app() {
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Función para reiniciar la aplicación
restart_app() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Reiniciando $APP_NAME..." >> $LOG_FILE
    /var/www/audacity/start-audacity.sh restart
}

# Verificar estado
if ! check_app; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $APP_NAME no está ejecutándose, reiniciando..." >> $LOG_FILE
    restart_app
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $APP_NAME ejecutándose correctamente" >> $LOG_FILE
fi
