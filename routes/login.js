const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const SEED = require('../config/config').SEED;
const GOOGLE_CLIENT = require('../config/config').GOOGLE_CLIENT;
const GOOGLE_SECRET_KEY = require('../config/config').GOOGLE_SECRET_KEY;
const client = new OAuth2Client(GOOGLE_CLIENT);

const app = express();

const Usuario = require('../models/usuario');

// Login general
app.post('/', (req,res) => {
  const body = req.body;

  Usuario.findOne({ correo: body.correo }, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - correo',
        errors: { mensaje: 'Correo incorrecto' },
      });
    }

    if (!bcrypt.compareSync(body.contraseña, usuario.contraseña)) {
      res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - contraseña',
        errors: { mensaje: 'Contraseña incorrecta' },
      });
    }

    // Crear JWT
    usuario.contraseña = '';
    const token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 });

    res.status(200).json({
      ok: true,
      usuario,
      id: usuario._id,
      token,
    });
  });
});

// Login con google
app.post('/google', (req, res) => {
  const tokenGoogle = req.body.token;

  verify(tokenGoogle, res).catch((err) => {
    res.status(400).json({
      ok: false,
      mensaje: 'Token invalido',
      errors: err,
    });
  });
});

// Funciones
async function verify(tokenGoogle, res) {
  const ticket = await client.verifyIdToken({
    idToken: tokenGoogle,
    audience: GOOGLE_CLIENT, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    // [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];

  Usuario.findOne({ correo: payload.email }, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (usuario) {
      if (!usuario.google) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No puedes autenticarte con Google',
          errors: { mensaje: 'No puedes autenticarte con Google' },
        });
      }
      usuario.contraseña = '';
      const token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 });

      res.status(200).json({
        ok: true,
        usuario,
        id: usuario._id,
        token,
      });
      // Si el usuario no existe
    } else {
      const usuario = new Usuario({
        nombre: payload.name,
        correo: payload.email,
        contraseña: '...',
        img: payload.picture,
        google: true,
      });

      usuario.save((err, usuario) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear usuario',
            errors: err,
          });
        }
        usuario.contraseña = '';
        const token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 });

        res.status(200).json({
          ok: true,
          usuario,
          id: usuario._id,
          token,
        });
      });
    }
  });
}

module.exports = app;
