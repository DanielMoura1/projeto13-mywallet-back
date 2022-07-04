import 'dotenv/config'
import express, { text,json} from 'express';
import cors from 'cors';
import axios from 'axios'; 
import chalk from 'chalk';
import joi from 'joi';
import { MongoClient,ObjectId } from "mongodb";
import dayjs from"dayjs";
import bcrypt from "bcrypt";
import { v4 as uuid } from 'uuid';
import { postCriar,teste } from './cadastro.js';
import { postLogin} from './login.js';
import { getTela1,postSomar,postMenos,getSair} from './paginaPrincipal.js';
const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient(process.env.mongo_conect);
let db;
const conexao = mongoClient.connect();


conexao.then(()=>{
    db = mongoClient.db(process.env.mongo_data);
    console.log('Banco de dados conectado')

})
app.get('/teste',teste)

app.post('/criar',postCriar)
app.post('/login',postLogin)

app.get('/tela1',getTela1)
app.get('/sair',getSair)

app.post('/somar',postSomar)
app.post('/menos',postMenos)


const PORT =process.env.PORT || 5000;
app.listen(PORT ,() =>{
    console.log(chalk.bold.green('O servidor está em pé na porta :'+process.env.porta))
})
