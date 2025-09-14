# AUDACITY - Sistema de Contadores

Sistema web para el juego de contadores AUDACITY con funcionalidades en tiempo real.

## Características

- **6 Usuarios**: 1 administrador y 5 contadores
- **5 Contadores**: Gallo Azul, Rey León, Dálmata, Guante, Brillante
- **Operaciones en Tiempo Real**: Actualizaciones instantáneas para todos los usuarios
- **Funciones Administrativas**: Reiniciar, establecer montos, intercambiar saldos
- **Interfaz Responsiva**: Compatible con dispositivos móviles y desktop

## Usuarios del Sistema

### Administrador
- **Usuario**: alan
- **Contraseña**: 20243
- **Permisos**: Control total sobre todos los contadores

### Contadores
1. **Gallo Azul**
   - Usuario: contador_gallo
   - Contraseña: galloazul

2. **Rey León**
   - Usuario: contador_leon
   - Contraseña: reyleon

3. **Dálmata**
   - Usuario: contador_perro
   - Contraseña: dalmata

4. **Guante**
   - Usuario: contador_mano
   - Contraseña: guante

5. **Brillante**
   - Usuario: contador_estrella
   - Contraseña: brillante

## Credenciales de Acceso

| Contador | Usuario | Contraseña |
|----------|---------|------------|
| Gallo Azul | contador_gallo | galloazul |
| Rey León | contador_leon | reyleon |
| Dálmata | contador_perro | dalmata |
| Guante | contador_mano | guante |
| Brillante | contador_estrella | brillante |

## Instalación

### Versión Simple (Solo Frontend)
1. Sube todos los archivos a tu hosting de Hostinger
2. Accede a `index.html` desde tu dominio

### Versión con Tiempo Real (Recomendada)
1. Instala Node.js en tu servidor
2. Sube todos los archivos al servidor
3. Ejecuta en el servidor:
   ```bash
   npm install
   npm start
   ```
4. Accede a `index-realtime.html` desde tu dominio

## Funcionalidades

### Para Contadores
- Sumar/Restar montos fijos ($1,000 y $5,000)
- Transferir porcentajes (25% y 50%) a otros contadores
- Ver saldos actualizados en tiempo real

### Para Administrador
- Todas las funciones de contadores
- Reiniciar todos los saldos a $TDL 10,000
- Establecer montos específicos para cada contador
- Intercambiar saldos entre contadores
- Control total del sistema

## Estructura de Archivos

```
audacity_contador/
├── index.html              # Versión simple (sin tiempo real)
├── index-realtime.html     # Versión con tiempo real
├── styles.css              # Estilos del sistema
├── script.js               # JavaScript para versión simple
├── script-realtime.js      # JavaScript para versión con tiempo real
├── server.js               # Servidor Node.js con WebSockets
├── package.json            # Dependencias de Node.js
├── .htaccess              # Configuración para Hostinger
└── README.md              # Este archivo
```

## Configuración para Hostinger

1. **Subir archivos**: Sube todos los archivos a la carpeta `public_html` de tu hosting
2. **Configurar Node.js**: Si usas la versión con tiempo real, configura Node.js en el panel de Hostinger
3. **Dominio**: Accede a tu dominio para usar el sistema

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Tiempo Real**: Socket.IO
- **Hosting**: Compatible con Hostinger

## Soporte

El sistema soporta hasta 6 usuarios simultáneos con actualizaciones en tiempo real.

## Licencia

MIT License - Desarrollado para Alan Canto
