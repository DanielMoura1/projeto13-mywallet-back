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
const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient(process.env.mongo_conect);
let db;
const conexao = mongoClient.connect();
conexao.then(()=>{
    db = mongoClient.db("projeto13-mywallet");
    console.log('Banco de dados conectado')

})

export async function postCriar(req,res) {
    const conta = req.body;
    const userSchema = joi.object({
        nome: joi.string().required(),
        email: joi.string().email().required(),
        senha: joi.string().required(),
        senha2: joi.ref('senha')
      });
   
    const validar = userSchema.validate(conta)
    
      if(validar.error){
        return res.status(422).send('deu ruim -_-');
      }
     
      try{
        const perfil = await db.collection("conta").findOne({email:conta.email})
        if(perfil){
          console.log('já tem esse e-mail')
          return res.sendStatus(409)
        }
        await db.collection('conta').insertOne({
          nome: conta.nome,
          email: conta.email,
          senha: bcrypt.hashSync(conta.senha,10),
          total:0,
          msg:[],
          token:null

        });
        res.sendStatus(201)
      } catch(e){
        console.log('deu ruim no  banco')
        return res.status(420).send('voce nao existe')
      }
};
