const express = require('express');

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

const app = express();

// Busqueda general
app.get('/todo/:busqueda', (req, res) => {
  const busqueda = req.params.busqueda;
  const regex = new RegExp(busqueda, 'i');

  Promise.all([buscarHospitales(regex), buscarMedicos(regex), buscarUsuarios(regex)])
    .then((respuesta) => {
      res.status(200).json({
        ok: true,
        hospitales: respuesta[0],
        medicos: respuesta[1],
        usuarios: respuesta[2],
      });
    });
});

// Busqueda por coleccion
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
  const tabla = req.params.tabla;
  const busqueda = req.params.busqueda;
  const regex = new RegExp(busqueda, 'i');
  let promesa;

  switch (tabla) {
    case 'usuarios':
      promesa = buscarUsuarios(regex);
      break;
    case 'medicos':
      promesa = buscarMedicos(regex);
      break;
    case 'hospitales':
      promesa = buscarHospitales(regex);
      break;
    default:
      res.status(400).json({
        ok: false,
        mensaje: 'Solo puedes buscar usuarios, medicos y hospitales',
        errors: { mensaje: 'Tipo de tabla/coleccion no valido' },
      });
  }

  promesa.then((respuesta) => {
    res.status(200).json({
      ok: true,
      [tabla]: respuesta,
    });
  });
});

// Funciones de busqueda
function buscarHospitales(regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate('usuario', 'nombre correo')
      .exec((err, hospitales) => {
        if (err) {
          reject('Error al cargar hospitales', err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate('usuario', 'nombre correo')
      .populate('hospital', 'nombre')
      .exec((err, medicos) => {
        if (err) {
          reject('Error al cargar medicos', err);
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarUsuarios(regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({ nombre: regex }, 'nombre correo role')
      .exec((err, usuarios) => {
        if (err) {
          reject('Error al cargar usuarios', err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

function buscarColeccion(tabla, regex) {

  if (tabla == 'usuario') {
    return new Promise((resolve, reject) => {
      Usuario.find({ nombre: regex }, 'nombre correo role')
        .exec((err, usuarios) => {
          if (err) {
            reject('Error al cargar usuarios', err);
          } else {
            resolve(usuarios);
          }
        });
    });
  } else if (tabla == 'medico') {
    return new Promise((resolve, reject) => {
      Medico.find({ nombre: regex })
        .populate('usuario', 'nombre correo')
        .populate('hospital', 'nombre')
        .exec((err, medicos) => {
          if (err) {
            reject('Error al cargar medicos', err);
          } else {
            resolve(medicos);
          }
        });
    });
  } else if (tabla == 'hospital') {
    return new Promise((resolve, reject) => {
      Hospital.find({ nombre: regex })
        .populate('usuario', 'nombre correo')
        .exec((err, hospitales) => {
          if (err) {
            reject('Error al cargar hospitales', err);
          } else {
            resolve(hospitales);
          }
        });
    });
  }
}

module.exports = app;
