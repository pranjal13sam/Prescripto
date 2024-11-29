/*Here basically we are building logic for the available doctors if the doctor is not 
available then the appointment should be booked */

import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const changeAvailability=async(req,res)=>{
    try{    

        //getting the doctor id first
        const {docId}=req.body

        const docData=await doctorModel.findById(docId)
        //here we are changing the availablity if available is true it will become false and if it is false then it will become true
        await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})

        res.json({success:true,message:"Availability Changed!"})


    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const doctorList=async(req,res)=>{
    try{
        const doctors=await doctorModel.find({}).select(['-password','-email'])

        res.json({success:true,doctors})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}




//Api for doctor login:
const loginDoctor=async(req,res)=>{

    try{

        //authentication:
        const {email,password}=req.body
        const doctor=await doctorModel.findOne({email})

        if(!doctor){
            return res.json({success:false,message:'Invalid Credentials!'})
        }


        const isMatch= await bcrypt.compare(password,doctor.password)

        if(isMatch){

            const token=jwt.sign({id:doctor._id,},process.env.JWT_SECRET)
            res.json({success:true,token})
        }

        else{
            res.json({success:false,message:'Invalid Credentials!'})
        }
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

export {changeAvailability,doctorList,loginDoctor} 