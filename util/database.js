const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db; //only be used internally in this file

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://urvipatel922:nodejs@cluster0.1rfupjs.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0')
    .then(client => {
        console.log('Connected to MongoDB');
        _db = client.db() // connecting and storing the connection to the database
        callback();
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
};

const getDb = () => { 
    if(_db) {
        return _db; // return access to the databse if it exist
    }
    throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

