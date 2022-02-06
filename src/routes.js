const express = require('express');
const UsuarioController = require('./controller/UsuarioController');

const routes = express.Router();

routes.get('/',function(req,res){
    res.json({message: "Bem vindo ao Backend MongoDb - PRODUCTION"})
})

routes.get('/usuario', UsuarioController.index)
routes.get('/usuario/:_id', UsuarioController.detail)
routes.post('/usuario', UsuarioController.store)
routes.delete('/usuario/:_id', UsuarioController.delete)
routes.put('/usuario', UsuarioController.update)

module.exports = routes;