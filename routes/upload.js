const express = require('express');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

const app = express();

// Default options
app.use(fileUpload());

app.put('/:coleccion/:id', (req, res) => {
  const coleccion = req.params.coleccion;
  const id = req.params.id;
  const coleccionesValidas = ['usuarios', 'medicos', 'hospitales'];

  if (coleccionesValidas.indexOf(coleccion) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Coleccion inexistente',
      errors: { mensaje: 'Debe ser usuarios, medicos u hospitales' },
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No se selecciono un archivo',
      errors: { mensaje: 'Debes subir un archivo' },
    });
  }

  // Obteniendo archivo
  const archivo = req.files.imagen;
  const archivoSplit = archivo.name.split('.');
  const extension = archivoSplit[archivoSplit.length - 1];
  const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extension no valida',
      errors: { mensaje: `Debes subir un archivo: ${extensionesValidas.join(', ')}` },
    });
  }

  // Renombrando archivo
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

  // Moviendo archivo del temporal a un path
  const path = `./uploads/${coleccion}/${nombreArchivo}`;
  archivo.mv(path, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover el archivo',
        errors: err,
      });
    }
    subirColeccion(coleccion, id, nombreArchivo, res);
  });
});

// Funciones
function subirColeccion(coleccion, id, nombreArchivo, res) {
  if (coleccion == 'usuarios') {
    Usuario.findById(id, (err, usuario) => {
      if (!usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: `El usuario con el id ${id} no existe`,
          errors: { mensaje: 'No existe un usuario con ese ID' },
        });
      }

      // Si existe, elimina la imagen anterior
      const pathAntiguo = `./uploads/${coleccion}/${usuario.img}`;
      if (fs.existsSync(pathAntiguo)) {
        fs.unlink(pathAntiguo);
      }

      // Nueva imagen
      usuario.img = nombreArchivo;

      usuario.save((err, actualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar usuario',
            errors: err,
          });
        }
        actualizado.contraseña = "";
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de usuario actualizada',
          usuario: actualizado,
        });
      });
    });
  }

  if (coleccion == 'medicos') {
    Medico.findById(id, (err, medico) => {
      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: `El medico con el id ${id} no existe`,
          errors: { mensaje: 'No existe un medico con ese ID' },
        });
      }

      // Si existe, elimina la imagen anterior
      const pathAntiguo = `./uploads/${coleccion}/${medico.img}`;
      if (fs.existsSync(pathAntiguo)) {
        fs.unlink(pathAntiguo);
      }

      // Nueva imagen
      medico.img = nombreArchivo;

      medico.save((err, actualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar medico',
            errors: err,
          });
        }
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de medico actualizada',
          medico: actualizado,
        });
      });
    });
  }

  if (coleccion == 'hospitales') {
    Hospital.findById(id, (err, hospital) => {
      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: `El hospital con el id ${id} no existe`,
          errors: { mensaje: 'No existe un hospital con ese ID' },
        });
      }

      // Si existe, elimina la imagen anterior
      const pathAntiguo = `./uploads/${coleccion}/${hospital.img}`;
      if (fs.existsSync(pathAntiguo)) {
        fs.unlink(pathAntiguo);
      }

      // Nueva Imagen
      hospital.img = nombreArchivo;

      hospital.save((err, actualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar hospital',
            errors: err,
          });
        }
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de hospital actualizada',
          hospital: actualizado,
        });
      });
    });
  }
}

module.exports = app;
