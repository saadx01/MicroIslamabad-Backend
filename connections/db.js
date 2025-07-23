import {connect} from 'mongoose';

export const connectToDatabase = async () => {
    connect(`${process.env.MONGODB_URI}`,{
        dbName: 'microIslamabad-finalProject',
    }).then((conn)=>{
        console.log(`Database connected successfully: ${conn.connection.host}`);
    }).catch((err)=>{
        console.error(`Database connection failed: ${err.message}`);
    });
}