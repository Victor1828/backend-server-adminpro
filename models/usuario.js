const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const rolesValidos = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: 'Rol {VALUE} no es permitido',
};

const usuarioSchema = new Schema({
  nombre: { type: String, required: [true, 'El nombre es necesario'] },
  correo: { type: String, unique: true, required: [true, 'El correo es necesario'] },
  contraseña: { type: String, required: [true, 'La contraseña es necesaria'] },
  img: { type: String, required: false },
  role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
  google: { type: Boolean, required: true, default: false },
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Usuario', usuarioSchema);
