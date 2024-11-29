import express from "express";
import {addDoctor,adminDashboard,allDoctors,appointmentCancel,appointmentsAdmin,loginAdmin} from '../controllers/adminController.js'
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorcontroller.js";

//creating a route

const adminRouter=express.Router()

//we are adding a middleware called upload.singe
//here also in add-doctor we will be adding a middleware for the token
adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctors)
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.get('/appointments',authAdmin,appointmentsAdmin)

adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)

adminRouter.get('/dashboard',authAdmin,adminDashboard)
export default adminRouter