var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();

var Usuario = require('../models/usuario');

//Obtener usuarios
app.get('/', (req, res) => {
    Usuario.find({ }, 'nombre correo img role')
    .exec((err, usuarios) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en DB'
            });
        }
        res.status(200).json({
            ok: true,
            usuarios
        });
    });
});

//Crear usuarios
app.post('/', (req, res) => {
    var body = req.body;
    var salt = bcrypt.genSaltSync(10);

    var usuario = new Usuario({
        nombre: body.nombre,
        correo: body.correo,
        contraseña: bcrypt.hashSync(body.contraseña, salt),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuario) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario
        });
    });
});

//Actualizar usuarios
app.put('/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, 'nombre correo img role')
    .exec((err, usuario) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if(!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe`,
                errors: {mensaje: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.correo = body.correo;
        usuario.role = body.role;

        usuario.save((err, usuario) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuario
            });
        });
    });
});

//Borrar usuario
app.delete('/:id', (req,res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuario) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuario
        });
    });
});

module.exports = app;