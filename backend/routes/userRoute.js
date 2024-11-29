import express from 'express'
import { bookAppointment, cancelAppointments, getProfile, listAppointment, loginUser, paymentRazorPay, registerUser, updateProfile, verifyRazorpay } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter=express.Router()

//api endpoint:

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/get-profile',authUser,getProfile)
//here below we are using two middleware one for passing the data(image) and one for authentication
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
//api endpoint for bookappointment
userRouter.post('/book-appointment',authUser,bookAppointment)

//list appointment :
userRouter.get('/appointments',authUser,listAppointment)

//cancel appointment:
userRouter.post('/cancel-appointment',authUser,cancelAppointments)

//payment 
userRouter.post('/payment-razorpay',authUser,paymentRazorPay)

//payment verfication
userRouter.post('/verify-razorpay',authUser,verifyRazorpay)

export default userRouter
