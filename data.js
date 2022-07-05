import 'dotenv/config'
import { MongoClient,ObjectId } from "mongodb";

 let db;
const mongoClient = new MongoClient(process.env.mongo_conect);


try {
    await mongoClient.connect();
    db = mongoClient.db(process.env.MONGO_DB);
    console.log('Banco de dados conectado com sucesso...');
  } catch (error) {
    console.error('Aconteceu um problema ao conectar o banco de dados...');
  }


export default db;