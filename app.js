const express = require('express');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server,{cors:{origin:"*"}})
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const register = require('./routes/register');
const home = require('./routes/home');
const {addMessage,getMessage} = require('./mongoose/func');
const { func } = require('joi');

const url = "mongodb+srv://natiyeshimongo:natiyeshimongo@cluster0.aliussy.mongodb.net/chat?retryWrites=true&w=majority"

async function connect(){
    try{
        await mongoose.connect(url)
        console.log("connected successfuly");
    }catch(e){
        console.log("error happens");
    }
}

connect()

function checkAuth(req,res,done){
    if(req.session.authenticated){ 
       return res.redirect("/home")
    }
    done()  
}

function checkUser(req,res,done){
    if(req.session.authenticated){
       return done()
    }
    res.redirect("/register")
}

app.set("view engine","ejs")
app.use(express.urlencoded({extended:false}))
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:"wowjavapdjfks",
    store:MongoStore.create({
        mongoUrl:"mongodb://localhost:27017/messanger",
        // ttl:5**1000
        
    }),
    cookie:{maxAge:1000*60*60*24},
}))

app.use("/register",checkAuth,register)    
app.use("/home",checkUser,home)

app.get("/",checkAuth,(req,res)=>{
    res.redirect("/register")
})

app.get("/logout",checkUser,(req,res)=>{
    req.session.destroy()
    res.redirect("/register")
})
app.get("/getMessages/:name/:toUser",checkUser,async (req,res)=>{
    let {name,toUser} = req.params
    try{
        const messageOfUser = await getMessage(name,toUser)
        console.log(messageOfUser);
        res.send(JSON.stringify(messageOfUser))
    }catch(e){
        console.log("error happen ",e);
        res.status(404).send()
    }
})

server.listen(3000,()=>{
    console.log("running on port 3000");
})

let socketUsers = []
let socketIds = []
io.on("connection",async (socket)=>{
    try{
        // socket.on("sendMessage",async (data)=>{
        //     console.log("send message");
        //     let {name,toUser} = data
        //     try{
        //         // const messageOfUser = await getMessage(name,toUser)
        //         // let toUserId = socketIds[name]
        //         // console.log(messageOfUser);
        //         socket.broadcast.to(toUserId).emit("getMessage",{
        //             message:"messageOfUser",
        //         })
        //     }catch(e){
        //         console.log("error happen ",e);
        //     }
        // })
        socket.on("message",async (data)=>{
            let {toUser,message,name} = data
            try{
               await addMessage(name,message,toUser)
            } catch(e){
                console.log("error happen ",e);
            }
            let toUserId = socketIds[toUser]
            socket.broadcast.to(toUserId).emit("message",{
                message:data.message,
                name:data.name
            })
            socket.emit("finished")
        })
        socket.on("addUser",(data)=>{
            socketIds[data.name] = socket.id 
            socket.user = data.name
            socketUsers.push(data.name)
            io.emit("updateUsers",socketUsers)
        })
        io.emit("updateUsers",socketUsers)
        socket.on("disconnect",()=>{
            socketUsers.splice(socketUsers.indexOf(socket.user),1)
            io.emit("updateUsers",socketUsers)
        })
    }catch(e){
        console.log(e);  
    } 
})
