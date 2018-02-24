var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Medico = require('../models/medico');

//Obtener medicos
app.get('/', (req, res) => {
    Medico.find({ }, (err, medicos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en DB',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            medicos
        });
    });
});

//Crear medicos
app.post('/', mdAuth.verificarToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospitalid
    });

    medico.save((err, medico) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico
        });
    });
});

//Actualizar medicos
app.put('/:id', mdAuth.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id} no existe`,
                errors: {
                    mensaje: 'No existe un medico con ese id'
                }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospitalid;

        medico.save((err, medico) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico
            });
        });
    });
});

//Borrar medicos
app.delete('/:id', mdAuth.verificarToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if(!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico
        })
    });
});

module.exports = app;
