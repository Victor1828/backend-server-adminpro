//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Inicialización
var app = express();

//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Importación de rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuarios');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospitales');
var medicoRoutes = require('./routes/medicos');

//Conexion db
mongoose.connect('mongodb://localhost/hospitalDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online'));

//Rutas
app.use('/', appRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);

//Escuchar peticiones
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
