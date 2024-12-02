/*Here basically we are building logic for the available doctors if the doctor is not 
available then the appointment should be booked */

import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"

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

//Api to get doctor appointments for doctor panel

const appointmentsDoctor=async(req,res)=>{
    try{

        const {docId} =req.body
        const appointments=await appointmentModel.find({docId })


        res.json({success:true,appointments})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//api to mark appointment completed for doctor panel:

const appointmentComplete=async(req,res)=>{
    try{
        const {docId,appointmentId}=req.body

        const appointmentData=await appointmentModel.findById(appointmentId)

        if(appointmentData&& appointmentData.docId===docId){
            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})

            return res.json({success:true,message:'Appointment Completed!'})
        }
        else{
            return res.json({success:false,message:"Mark Failed!"})
        }
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//api to cancel appointment for doctor panel:

const appointmentCancel=async(req,res)=>{
    try{
        const {docId,appointmentId}=req.body

        const appointmentData=await appointmentModel.findById(appointmentId)

        if(appointmentData&& appointmentData.docId===docId){
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

            return res.json({success:true,message:'Appointment Cancelled!'})
        }
        else{
            return res.json({success:false,message:"Cancellation Failed!"})
        }
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


//Api to get dashboard data for doctor panel:

const doctorDashboard=async(req,res)=>{
    try{
        const {docId} =req.body
        const appointments=await appointmentModel.find({docId})

        let earnings=0;

        appointments.map((item)=>{
            if(item.isCompleted|| item.payment){
                earnings+=item.amount
            }
        })

        let patients=[]
        //here we are checking that if the patient is already availabe in the patient array then we are not adding that patient if not then we are using .includes method to check and add
        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData={
            earnings,
            appointments:appointments.length,
            patients:patients.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }

        res.json({success:true,dashData})
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//api to get doctor profile for doctor panel:

const doctorProfile=async(req,res)=>{
    try{
        const {docId} =req.body;

        const profileData=await doctorModel.findById(docId).select('-password')

        res.json({success:true,profileData})
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//api to update the doctor profile data from doctor panel:

const updateDoctorProfile=async(req,res)=>{
    try{
        const {docId,fees,address,available}=req.body

        await doctorModel.findByIdAndUpdate(docId,{fees,address,available})

        res.json({success:true,message:'Profile Updated!'})

    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}
export {changeAvailability,doctorList,loginDoctor,appointmentsDoctor,appointmentComplete,appointmentCancel,doctorDashboard,updateDoctorProfile,doctorProfile} 