const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')

const routes = require('./src/routes')

const app = express()

require('dotenv').config()

const mongoose = require('mongoose')

mongoose.connect(process.env.DB_URI_PRODUCTION,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    auth:{
        user : process.env.DB_USER,
        password : process.env.DB_PWD

    }
},function(err){
    if(err){
        console.log("Erro na Conexão")
        console.log(err)
    }else{
        console.log("MongoDb Conectado com Sucesso")
    }
})

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(routes)

app.listen(8080, function(){
    console.log("Servidor iniciado com sucesso.")
})