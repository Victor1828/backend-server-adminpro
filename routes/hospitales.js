const express = require('express');
const mdAuth = require('../middlewares/auth');

const app = express();

const Hospital = require('../models/hospital');

// Obtener hospitales
app.get('/', (req, res) => {
  let offset = req.query.offset || 0;
  offset = Number(offset);

  Hospital.find({})
    .skip(offset)
    .limit(5)
    .populate('usuario', 'nombre correo')
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error en DB',
        });
      }

      Hospital.count({}, (err, total) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error en DB',
          });
        }
        res.status(200).json({
          ok: true,
          hospitales,
          total,
        });
      });
    });
});

// Crear hospitales
app.post('/', mdAuth.verificarToken, (req, res) => {
  const body = req.body;

  const hospital = new Hospital({
    nombre: body.nombre,
    img: body.img,
    usuario: req.usuario._id,
  });

  hospital.save((err, hospital) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear hospital',
        errors: err,
      });
    }
    res.status(201).json({
      ok: true,
      hospital,
    });
  });
});

// Actualizar hospitales
app.put('/:id', mdAuth.verificarToken, (req, res) => {
  const id = req.params.id;
  const body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar hospital',
        errors: err,
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: `El hospital con el id ${id} no existe`,
        errors: { mensaje: 'No existe un hospital con ese ID' },
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospital) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar hospital',
          errors: err,
        });
      }
      res.status(200).json({
        ok: true,
        hospital,
      });
    });
  });
});

// Borrar hospital
app.delete('/:id', mdAuth.verificarToken, (req, res) => {
  const id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar hospital',
        errors: err,
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un hospital con ese ID',
        errors: err,
      });
    }

    res.status(200).json({
      ok: true,
      hospital,
    });
  });
});

module.exports = app;
