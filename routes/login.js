var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req,res) => {
    var body = req.body;

    Usuario.findOne({correo: body.correo}, (err, usuario) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if(!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - correo',
                errors: {mensaje: 'Correo incorrecto'}
            });
        }

        if(!bcrypt.compareSync(body.contraseña, usuario.contraseña)) {
            res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - contraseña',
                errors: {mensaje: 'Contraseña incorrecta'}
            });
        }

        //Crear JWT
        usuario.contraseña = '';
        var token = jwt.sign({usuario}, SEED, {expiresIn: 14400});

        res.status(200).json({
            ok: true,
            usuario,
            id: usuario._id,
            token
        });
    });
});

module.exports = app;
