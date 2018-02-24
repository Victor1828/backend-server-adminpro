var express = require('express');
var mdAuth = require('../middlewares/auth');

var app = express();

var Hospital = require('../models/hospital');

//Obtener hospitales
app.get('/', (req, res) => {
    Hospital.find({ }, (err, hospitales) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en DB'
            });
        }
        res.status(200).json({
            ok: true,
            hospitales
        });
    });
});

//Crear hospitales
app.post('/', mdAuth.verificarToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital
        });
    });
});

//Actualizar hospitales
app.put('/:id', mdAuth.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: {
                    mensaje: 'No existe un hospital con ese ID'
                }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital
            });
        });
    });
});

//Borrar hospital
app.delete('/:id', mdAuth.verificarToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if(!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital
        });
    });
});

module.exports = app;
