import validator from "validator"
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"

//there are basically two types of login one is admin login and one is doctor login

//Api for adding doctor:

const addDoctor=async(req,res)=>{
    try{
        const { name,email,password,speciality,degree,experience,about,fees,address}=req.body
        //this is api and it will be pass through a form data so inorder to pass through a form data we need to
        //to add a middleware
        const imageFile=req.file

        //console.log({ name,email,password,speciality,degree,experience,about,fees,address},imageFile);
        
        //to save the data into database:

        //checking for all data to add doctor:
        if(!name||!email||!password||!speciality||!degree||!experience||!fees||!about||!address){
            return res.json({
                success:false,message:"Missing Details"
            })
        }

        //validating email format 
        if(!validator.isEmail(email)){
            return res.json({
                success:false,message:"please enter a valid email"
            })
        }

        //validating password:
        if(password.length<8){
            return res.json({
                success:false,message:"please enter a strong password!"
            })
        }

        //hashing doctor password:
        //this is for encrypting the password 
        const salt =await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt)


        //uploading the image file to cloudinary:
        const imageUpload= await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
        const imageUrl=imageUpload.secure_url

        //save this data into the database:

        const doctorData={
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            fees,
            about,
            //since address is an object but here we need address as a string so we are converting into a string
            address:JSON.parse(address),
            date:Date.now()

        }

        const newDoctor=new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success:true,message:"Doctor added!"})
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}


//Api for admin login:

const loginAdmin=async(req,res)=>{
    try{

        const {email,password}=req.body
        if(email===process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token=jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({
                success:true,
                token
            })
        }else{
            res.json({
                success:false,
                message:"Invalid Credentials!"
            })
        }
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

    //api to get all doctors list for the admin panel

    const allDoctors=async(req,res)=>{
        try{
            //here we don't need to add password in the response to we are excluding the password property
            const doctors=await doctorModel.find({}).select('-password')
            res.json({success:true,doctors})
        }
    catch(error){
        console.log(error)
    }
}

//Api to get all appointments list:

const appointmentsAdmin=async(req,res)=>{
    try{
        //this below line will provide all the appointments from all the doctors:
        const appointments=await appointmentModel.find({})
        res.json({success:true,appointments})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}   

//api for appointment cancellation:

const appointmentCancel = async (req, res) => {

    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        //releasing doctors booked slot after cancellation:

        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        //this line is basically for removing the slot from the doc array:
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appoinment canelled Successfully!' })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//to display the data in the dashboard:

//api to get dashboard data for admin panel:

const adminDashboard=async(req,res)=>{
    try{

        const doctors=await doctorModel.find({})
        const users=await userModel.find({})
        const appointments=await appointmentModel.find({})

        const dashData={
            doctors:doctors.length,
            appointments:appointments.length,
            patients:users.length,
            latestAppointments:appointments.reverse().slice(0,5),

        }

        res.json({success:true,dashData})

    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export {allDoctors,addDoctor,loginAdmin,appointmentsAdmin,appointmentCancel,adminDashboard}