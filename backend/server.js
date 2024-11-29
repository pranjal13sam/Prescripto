import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

//app config

const app= express()
const port=process.env.PORT|| 4000
connectDB()
connectCloudinary()

//middlewares:
app.use(express.json())

//allowing frontend to connect with the backend
//cors stand for:CROSS ORIGIN RESOURCE SHARING
app.use(cors())

//api endpoint:
app.use('/api/admin',adminRouter)
//localhost:4000/api/admin

//for api/doctor
app.use('/api/doctor',doctorRouter)

//api for register user
app.use('/api/user',userRouter)

app.get('/',(req,res)=>{
    res.send("Api working fine")
})

app.listen(port,()=>console.log("Server Started on port ",port))