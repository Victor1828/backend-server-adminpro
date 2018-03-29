const express = require('express');
const bcrypt = require('bcryptjs');
const mdAuth = require('../middlewares/auth');

const app = express();

const Usuario = require('../models/usuario');

// Obtener usuarios
app.get('/', (req, res) => {
  let offset = req.query.offset || 0;
  offset = Number(offset);

  Usuario.find({ }, 'nombre correo img role')
    .limit(5)
    .skip(offset)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error en DB',
        });
      }

      Usuario.count({ }, (err, total) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error en DB',
          });
        }
        res.status(200).json({
          ok: true,
          usuarios,
          total,
        });
      });
    });
});

// Verificar token
// app.use('/', (req, res, next) => {
//   var token = req.query.token;
//
//   jwt.verify(token, SEED, (err, decoded) => {
//     if(err) {
//         return res.status(401).json({
//             ok: false,
//             mensaje: 'Token no valido',
//             errors: err
//         });
//     }
//     next();
//   });
// });

// Crear usuarios
app.post('/', (req, res) => {
  const body = req.body;
  const salt = bcrypt.genSaltSync(10);

  const usuario = new Usuario({
    nombre: body.nombre,
    correo: body.correo,
    contraseña: bcrypt.hashSync(body.contraseña, salt),
    img: body.img,
    role: body.role,
  });

  usuario.save((err, usuario) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear usuario',
        errors: err,
      });
    }
    res.status(201).json({
      ok: true,
      usuario,
    });
  });
});

// Actualizar usuarios
app.put('/:id', mdAuth.verificarToken, (req, res) => {
  const id = req.params.id;
  const body = req.body;

  Usuario.findById(id, 'nombre correo img role')
    .exec((err, usuario) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al buscar usuario',
          errors: err,
        });
      }

      if (!usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: `El usuario con el id ${id} no existe`,
          errors: { mensaje: 'No existe un usuario con ese ID' },
        });
      }

      usuario.nombre = body.nombre;
      usuario.correo = body.correo;
      usuario.role = body.role;

      usuario.save((err, usuario) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar usuario',
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          usuario,
        });
      });
    });
});

// Borrar usuario
app.delete('/:id', mdAuth.verificarToken, (req, res) => {
  const id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario',
        errors: err,
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un usuario con ese ID',
        errors: err,
      });
    }

    res.status(200).json({
      ok: true,
      usuario,
    });
  });
});

module.exports = app;
