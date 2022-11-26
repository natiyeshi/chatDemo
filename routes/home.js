const express = require('express');
const router = express.Router()

// const nameSchema = require('../mongoose/schema');
// const joiSchema = require('../joi/schema');

router.get("/",(req,res)=>{
    const name = req.session.name 
    res.render("home",{name})
})

module.exports = router