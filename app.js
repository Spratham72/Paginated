const express=require('express');
const mongoose=require('mongoose');
const nodemailer=require('nodemailer');
const app=express();
app.use(express.json());
const connect=()=>{
    return mongoose.connect('mongodb://127.0.0.1:27017/pagenation')
}

const transporter=nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: "11ede0def0f68e",
      pass: "a3fb03dfc779e2",
    },
  });
  
const userSchema=new mongoose.Schema({
    "first_name":{type:String, required:true},
    "last_name":{type:String, required:true},
    "email":{type:String, required:true}
})
const User=mongoose.model("User",userSchema);
const adminSchema=new mongoose.Schema({
    "first_name":{type:String, required:true},
    "last_name":{type:String, required:true},
    "email":{type:String, required:true}
})
const Admin=mongoose.model("Admin",adminSchema);
app.post('/admin',async(req,res)=>{
    try {
        const item=await Admin.create(req.body);
        res.send(item)
    } catch (error) {
        res.status(500).json(error)
    }
})
app.get('/admin',async(req,res)=>{
    try {
        const item=await Admin.find().lean().exec();
        res.send(item)
    } catch (error) {
        res.status(500).json(error)
    }
})

app.post('/user', async(req, res)=>{
    try {
        const item=await User.create(req.body);
        const admin=await Admin.find().lean().exec();
        let a=[];
        admin.forEach(Element=>{
            a.push(Element.email)
        })
        console.log(a)
        const message = {
            from: "pratham@gmail.com",
            to: req.body.email,
            subject: `Welcome to ABC system ${req.body.first_name} ${req.body.last_name}`,
            text: `Hi ${req.body.first_name} Please confirm your email address`,
          };
         
          const adminMessage = {
            from: "pratham@gmail.com",
            to: a,
            subject: `${req.body.first_name} ${req.body.last_name} has registered with us`,
            text: `Please Welcome ${req.body.first_name} ${req.body.last_name}`,
          };

          transporter.sendMail(message)
          transporter.sendMail(adminMessage)

        res.send(item);
    } catch (error) {
        res.status(500).json(error)
    }
})

app.get('/user',async(req,res)=>{
    try {
        const page=+req.query.page||1;
        const size=+req.query.size||10;
        const offset=(page-1)*size;
        const item=await User.find().skip(offset).limit(size).lean().exec();
        const totalPages=Math.ceil((await User.find().countDocuments().lean().exec())/size);
        console.log(totalPages)
       
        res.status(200).send({item,totalPages});
    } catch (error) {
        res.status(500).json(error)
    }
})

app.listen(1234,async()=>{
    await connect();
    console.log("server is runing in port 1234")
})
