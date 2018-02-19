//Require
var express = require('express');
var mongoose = require('mongoose');

//Inicializacion
var app = express();

//Conexion db
mongoose.connect('mongodb://localhost/hospitalDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online'));

//Rutas
app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
    res.send('Hello World!');
});


//Escuchar peticiones
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});