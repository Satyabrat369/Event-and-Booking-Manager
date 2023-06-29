const jwtoken = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    const authHeader = req.get('Authorization');
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]; // Authorization: Bearer tokenvalue
    if(!token || token===''){
        req.isAuth=false;
        return next();
    }
    let decryptedToken ;
    try{
        decryptedToken = jwtoken.verify(token, 'HashedSecretTokenVerifyingKey');
    }catch(err){
        req.isAuth = false;
        return next();
    }
    if(!decryptedToken){
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.userId = decryptedToken.userId;
    next();
}