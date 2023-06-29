const express = require('express');
const bodyParser = require('body-parser');

const graphQlHTTP = require('express-graphql').graphqlHTTP; 
require('dotenv').config();
const mongoose = require('mongoose');


const graphqlSchema = require('./graphql/schema/schema');
const graphqlResolvers = require('./graphql/resolvers/resolver');
const isAuth = require('./middle-layer/is-auth');


const App = express();

App.use(bodyParser.json());
App.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    if(req.method === 'OPTIONS'){
        return res.sendStatus(200);
    }
    next();
});
// const events= [];

App.use(isAuth);
App.use('/graphqlinterface', graphQlHTTP({
    schema: graphqlSchema, 
    rootValue: graphqlResolvers,
    graphiql: true
}));

// console.log(process.env.MONGO_USER);
// console.log(process.env.MONGO_PASSWORD);
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.a1y52xd.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority
`).then(() =>{
    App.listen(5000);
}).catch(err =>{
    console.log(err);
});


