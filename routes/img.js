const express = require('express');
const fs = require('fs');

const app = express();

app.get('/:coleccion/:img', (req, res) => {
  const coleccion = req.params.coleccion;
  const img = req.params.img;
  let path = `./uploads/${coleccion}/${img}`;

  fs.exists(path, (existe) => {
    if (!existe) {
      path = './assets/no-img.jpg';
    }
    res.status(200).sendfile(path);
  });
});

module.exports = app;
