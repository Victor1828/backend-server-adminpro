const express = require('express');
const mdAuth = require('../middlewares/auth');

const app = express();

const Medico = require('../models/medico');

// Obtener medicos
app.get('/', (req, res) => {
  let offset = req.query.offset || 0;
  offset = Number(offset);

  Medico.find({ })
    .skip(offset)
    .limit(5)
    .populate('usuario', 'nombre correo')
    .populate('hospital')
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error en DB',
          errors: err,
        });
      }

      Medico.count({ }, (err, total) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error en DB',
          });
        }
        res.status(200).json({
          ok: true,
          medicos,
          total,
        });
      });
    });
});

// Crear medicos
app.post('/', mdAuth.verificarToken, (req, res) => {
  const body = req.body;

  const medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospitalid,
  });

  medico.save((err, medico) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear medico',
        errors: err,
      });
    }
    res.status(201).json({
      ok: true,
      medico,
    });
  });
});

// Actualizar medicos
app.put('/:id', mdAuth.verificarToken, (req, res) => {
  const id = req.params.id;
  const body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar medico',
        errors: err,
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: `El medico con el id ${id} no existe`,
        errors: { mensaje: 'No existe un medico con ese id' },
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
          errors: err,
        });
      }
      res.status(200).json({
        ok: true,
        medico,
      });
    });
  });
});

// Borrar medicos
app.delete('/:id', mdAuth.verificarToken, (req, res) => {
  const id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar medico',
        errors: err,
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un medico con ese ID',
        errors: err,
      });
    }

    res.status(200).json({
      ok: true,
      medico,
    });
  });
});

module.exports = app;
