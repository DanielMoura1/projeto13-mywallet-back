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
app.post('/criar',async (req, res) => {
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
     
});
app.post('/login',async (req, res) => {
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
})
app.get('/tela1',async (req, res) => {
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
  
  
})
app.post('/somar',async (req, res) => {
  
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

})
app.post('/menos',async (req, res) => {
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
    await perfil2.updateOne(
   { token: conta.token },
   {
    $push: { msg: {  data:dayjs().format("HH:mm:ss"),nome:conta.desc,valor:conta.valor,cor:'red'} }
   }
  )
  const perfil = await db.collection("conta").findOne({token:conta.token})
  if(conta.valor>perfil.total){
    return res.status(422).send('deu ruim -_-');
  }

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

})
app.get('/sair',async (req, res) => {
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
})
app.listen(process.env.porta,() =>{
    console.log(chalk.bold.green('O servidor está em pé na porta :'+process.env.porta))
})
