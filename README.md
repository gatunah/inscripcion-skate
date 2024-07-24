# Skate Park - Gestión de inscripciones y acceso de usuario

## Características

- **JWT Authentication:** Tokens JWT para gestionar el acceso seguro a recursos restringidos.
- **Panel de Administración:** Solo accesible para usuarios con privilegios de administrador.
- **CRUD de Skaters:** Añadir, actualizar y eliminar perfiles de skaters.
- **Visualización de Datos:** Mostrar perfiles y datos de skaters.

## Tecnologías utilizadas
- **Node.js:** Entorno de ejecución de JavaScript del lado del servidor.
- **Express:** Framework web para Node.js.
- **PostgreSQL:** Sistema de base de datos, para almacenar la información.
- **Handlebars:** Motor de plantillas para renderizar HTML.
- **Axios:** Cliente HTTP basado en promesas para el navegador y Node.js.
- **Bootstrap:** Biblioteca de componentes front-end para diseño responsivo, se complementa con CSS.

## Instalación

1. Clona este repositorio en tu máquina local.
2. Instala las dependencias utilizando npm install.
3. Configura la BD (ve al siguiente punto).

## Base de datos

1. Ejecuta el Script del archivo txt "bd" en la Shell de Psql (Debes tener instalado Postgres).
2. La Base de datos es llamada "skatepark", la cual será borrada en caso de existencia y creada junto a su tabla "skaters".
3. En el proyecto modificar parámetros de conexión a la BD según sea tú caso.

## Consideraciones
1. Es una aplicación en desarrollo que requiere de mejoras.
2. Para cumplir con lo requerido, se ha asignado a un administrador por medio de la propiedad "especialidad", se ha realizado de esta forma solo por fines prácticos.
3. La Base de datos cuenta con varios datos semilla para poder realizar pruebas.

## Ejecución
1. En el terminal del proyecto, ejecutar "node server".
2. Realiza pruebas ingresando con los siguientes datos de usuario, de igual manera puedes crear tu propio usuario en el link de Registro.
- **Usuario Standard:** **email:** 'danny@example.com', **password:** '111'
- **Usuario Administrador:** **email:** 'admin@example.com', **password:** '555'
