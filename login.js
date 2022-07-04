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
import { postCriar } from './cadastro.js';

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

export async function postLogin(req,res) {

  const conta = req.body;
  
  const userSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required(),
  });

  const validar = userSchema.validate(conta)
    if(validar.error){
      return res.status(422).send('deu ruim -_-');
    }
try{
  const perfil = await db.collection("conta").findOne({email:conta.email})
  const senha= bcrypt.compareSync(conta.senha, perfil.senha)
  if(!senha){
    console.log('senha invalida')
    return res.status(420).send('voce nao existe')
  }
 const token =uuid()
  const perfil2 = await db.collection("conta");
  perfil2.updateOne(
    { _id: perfil._id},
    { $set:
      {
        token:token
      }
    }
 )

  res.send(token)
  
} catch(e){
  console.log('erro login')
  return res.status(420).send('voce nao existe')
}
}