// Requires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Inicialización
const app = express();

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Importación de rutas
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuarios');
const loginRoutes = require('./routes/login');
const hospitalRoutes = require('./routes/hospitales');
const medicoRoutes = require('./routes/medicos');
const busquedaRoutes = require('./routes/busquedas');
const uploadRoutes = require('./routes/upload');
const imgRoutes = require('./routes/img');

// Conexion db
mongoose.connect('mongodb://localhost/hospitalDB');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online'));

// Rutas
app.use('/', appRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imgRoutes);

// Escuchar peticiones
app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
