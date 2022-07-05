import 'dotenv/config'
import { MongoClient,ObjectId } from "mongodb";

 let db;
const mongoClient = new MongoClient(process.env.mongo_conect);



try{
    await  mongoClient.connect();
   
     db = mongoClient.db(process.env.mongo_data);
    console.log('Banco de dados conectado')
    
    
}catch(e){
    console.error('Aconteceu um problema ao conectar o banco de dados...');
}

export default db;