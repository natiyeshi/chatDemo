const mongoose = require('mongoose');

var mongooseSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:3,
    },
    message:[]
})

var sessionSchema = new mongoose.Schema({
    session:String
})


var mongooseSchema =  mongoose.model("files",mongooseSchema)
var sessionSchema =  mongoose.model("sessions",sessionSchema)
module.exports = {mongooseSchema,sessionSchema}
