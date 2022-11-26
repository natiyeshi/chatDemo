const express = require('express');
const router = express.Router()

const {mongooseSchema} = require('../mongoose/schema');
const joiSchema = require('../joi/schema');

router.get("/",(req,res)=>{
    res.render("name")
})

router.post("/user",addName)

async function addName(req,res){
    const {name} = req.body
    let validate = joiSchema.validate({name})
    if(validate.error) return res.send(validate.error.details[0].message)
    try{
        const users = await mongooseSchema.find({name:name})
        if(users.length < 1){
            const newUser = await mongooseSchema.create({name:name})
            req.session.authenticated = true
            req.session.name = name
            req.session.userId =  newUser._id
        }
        else {
            req.session.authenticated = true
            req.session.name = name
            req.session.userId =  users[0]._id
        }
        return res.redirect("home")
    }catch(e){
        console.log(e.message);
        return res.send("not ok")
    }
}
 
module.exports = router