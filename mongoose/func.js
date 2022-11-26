const { message } = require('../joi/schema');
const {sessionSchema,mongooseSchema} = require('./schema');

async function addMessage(name,msg,msgTo){
  try{
    let sendTime = Date.now()
    let ob = {msg,msgTo,sendTime}
    const file = await mongooseSchema.findOne({name})
    file.message.push(ob)
    await file.save()
  }catch(e){
    console.log(e);
  } 
}

async function getMessage(name,toUser = ""){
  try{
    const file1 = await mongooseSchema.findOne({name},{_id:0})
    const messages = []
    file1.message.forEach(element => {
      if(element.msgTo == toUser)
        messages.push(element)
    });
    const file2 = await mongooseSchema.findOne({name:toUser},{_id:0})
    file2.message.forEach(element => {
      if(element.msgTo == name)
        messages.push(element)
    });
    return messages
  }catch(e){
    console.log(e);
    return -1
  } 
}




module.exports = {addMessage,getMessage}