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
import { postLogin} from './login.js';
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
export async function getTela1(req,res) {

    try{
      const {user}=req.headers;
      if(user ==null){
        return res.status(420).send('voce nao existe')
      }
      const perfil = await db.collection("conta").findOne({token:user});
      const conteudo ={
        nome:perfil.nome,
        msg:perfil.msg,
        total:perfil.total
       
      }
     
      res.send(conteudo)
    }catch(e){
      console.log('get tela erro')
    }
    
    
  }
  export async function postSomar(req,res) {

  
    const conta = req.body;
    const userSchema = joi.object({
      valor: joi.number().required(),
      desc: joi.string().required(),
      token:joi.string().required()
    });
  
    const validar = userSchema.validate(conta)
      if(validar.error){
        return res.status(422).send('deu ruim -_-');
      }
    try{
      if(conta.valor<0){
        return res.status(422).send('deu ruim -_-');
      }
        const perfil2 = await db.collection("conta");
        await perfil2.updateOne(
      { token: conta.token },
      {
        $push: { msg: {  data:dayjs().format("HH:mm:ss"),nome:conta.desc,valor:conta.valor,cor:'green'} }
      }
      )
      const perfil = await db.collection("conta").findOne({token:conta.token})
     
      const num =conta.valor+perfil.total
      await perfil2.updateOne(
        { token: conta.token},
        { $set:
          {
              total: num
        }
      })
      
      res.sendStatus(201)
    }catch(e){
      console.log('post tela erro')
    }
  
  }
  export async function postMenos(req,res) {
 
    const conta = req.body;
    const userSchema = joi.object({
      valor: joi.number().required(),
      desc: joi.string().required(),
      token:joi.string().required()
    });
  
    const validar = userSchema.validate(conta)
      if(validar.error){
        return res.status(422).send('deu ruim -_-');
      }
  
    try{
      const perfil2 = await db.collection("conta");
      const perfil = await db.collection("conta").findOne({token:conta.token})
      if(conta.valor>perfil.total || conta.valor<0){
        return res.status(422).send('deu ruim -_-');
      }
      await perfil2.updateOne(
     { token: conta.token },
     {
      $push: { msg: {  data:dayjs().format("HH:mm:ss"),nome:conta.desc,valor:conta.valor,cor:'red'} }
     }
    )
    
   
  
    const num =perfil.total-conta.valor
    await perfil2.updateOne(
      { token: conta.token},
      { $set:
         {
            total: num
      }
    })
  
    res.sendStatus(201)
    }catch(e){
      console.log('post tela erro')
    }
  
  }
  export async function getSair(req,res) {

    const {user}=req.headers;
    try{
     
      if(user==null){
        return res.status(420).send('voce nao existe')
      }
      const perfil = await db.collection("conta").findOne({token:user})
      const perfil2 = await db.collection("conta");
      perfil2.updateOne(
      { _id: perfil._id},
      { $set:
        {
          token:null
        }
      }
    )
    res.sendStatus(201)
    }catch(e){
      res.status(420).send('voce nao existe')
    }
  }