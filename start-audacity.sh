#!/bin/bash

# Script de inicio para AUDACITY
# Ubicación: /var/www/audacity/start-audacity.sh

# Configuración
APP_DIR="/var/www/audacity"
APP_NAME="audacity-contador"
LOG_FILE="/var/www/audacity/logs/audacity.log"
PID_FILE="/var/www/audacity/logs/audacity.pid"

# Función para logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Función para iniciar la aplicación
start_app() {
    log "Iniciando $APP_NAME..."
    
    cd $APP_DIR
    
    # Verificar si ya está ejecutándose
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            log "La aplicación ya está ejecutándose (PID: $PID)"
            return 1
        else
            rm -f $PID_FILE
        fi
    fi
    
    # Iniciar la aplicación
    nohup node app.js > $LOG_FILE 2>&1 &
    echo $! > $PID_FILE
    
    log "Aplicación iniciada con PID: $(cat $PID_FILE)"
    return 0
}

# Función para detener la aplicación
stop_app() {
    log "Deteniendo $APP_NAME..."
    
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID
            rm -f $PID_FILE
            log "Aplicación detenida"
        else
            log "La aplicación no estaba ejecutándose"
            rm -f $PID_FILE
        fi
    else
        log "No se encontró archivo PID"
    fi
}

# Función para reiniciar la aplicación
restart_app() {
    log "Reiniciando $APP_NAME..."
    stop_app
    sleep 2
    start_app
}

# Función para verificar estado
status_app() {
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            echo "Aplicación ejecutándose (PID: $PID)"
            return 0
        else
            echo "Aplicación no ejecutándose"
            return 1
        fi
    else
        echo "Aplicación no ejecutándose"
        return 1
    fi
}

# Manejar argumentos
case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    status)
        status_app
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac

exit $?
