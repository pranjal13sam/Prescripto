//api logic for uesr register,login,logout,getprofile,update-profile,payment-gateway,also everything about appointments:
import validator from "validator"
import bcrypt from 'bcryptjs'
import userModel from "../models/userModel.js"
import jwt from 'jsonwebtoken'
import authUser from "../middlewares/authUser.js"
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import razorpay from 'razorpay'

//api for register user:

const registerUser = async (req, res) => {

    try {
        //taking username and password from req.body
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details!' })

        }
        //validating email:
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Invalid Email!' })

        }

        //vaildating a strong password:
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password!" })
        }

        //hashing the password:

        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password, salt)

        //adding user to database:

        const userData = {
            name,
            email,
            password: hashedPassword
        }
        //saving userData to database:

        const newUser = new userModel(userData)
        const user = await newUser.save()
        //here after user registers for the first time he/she details gets saved in the database and mongodb will generate a unique id for that particular user
        //using the _id property we will create a token so that user can login


        //we need to provide the jwt token as well to encrypt the token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })



    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//code for loginuser:

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist!!" })
        }

        //password is we are getting from what we are entering that is req.body and user.password is we are comparing from bcrypt library whetether the password is correct or not
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            return res.json({ success: false, message: "Invalid Credentials!" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


//Api to get User Profile Data:

const getProfile = async (req, res) => {
    try {
        //we will get userId using authentication
        const { userId } = req.body
        //now after getting an id from request.body we need to find the user from the database
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Api to get update UserProfile:

const updateProfile = async (req, res) => {
    try {

        const { userId, name, phone, address, dob, gender, email } = req.body
        //receiving image file:
        const imageFile = req.file

        if (!name || !phone || !dob || !gender || !email) {
            return res.json({ success: false, message: "Data Missing!" })
        }

        //if we have all the above property then we will update the userData:
        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender, email })

        if (imageFile) {
            //upload image to cloudinary:
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })

            //getting the response after upload
            const imageURL = imageUpload.secure_url

            //updating to database:
            await userModel.findByIdAndUpdate(userId, { image: imageURL })

        }
        res.json({ success: true, message: "profile Updated!" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


//creating the logic for booking an appintment:
//api to book appointment

const bookAppointment = async (req, res) => {
    try {
        //destructing the parameters
        const { userId, docId, slotDate, slotTime } = req.body

        //getting the doctordata:
        const docData = await doctorModel.findById(docId).select('-password')

        //checking whether the doctor is available for the booking or not:
        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not Available!' })
        }

        //booking the slots:
        let slots_booked = docData.slots_booked

        //checking the slotdate and slottime is available or not:
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot not Available!' })
            } else {//this means slottime is available 
                slots_booked[slotDate].push(slotTime)
            }

        } else {//this means the entire slotdate is empty
            //here if the entire day is empty then [] is created and then slottime is pushed inside it
            //if the slots_booked array is not added then new appointments for the date cannot be added as there is no array for that
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        //deleting the slots_booked data from the doctor data
        //we are deleting the doc data because we don't want to keep the history of the doctor's slot
        //also most important we need to save the docdata to appointment data also and we don't need the entire doctors appointment details (booking time) 
        delete docData.slots_booked


        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        //saving the data to the database:

        const newAppointment = new appointmentModel(appointmentData)

        await newAppointment.save()

        //save new slots data in docData:
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked!' })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


//Api to get all user appointments which he/she has booked(for frontend):

const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;

        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//Api to cancel the appointments:

const cancelAppointments = async (req, res) => {

    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        //verification appointment user:

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action!' })
        }

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



//Api to make the online pay of appointments using razorpay:

const razorPayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const paymentRazorPay = async (req, res) => {

    try {
        //to make the payment for the appointment we will require appointment id:
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        //we will check first that either our appointment is there or not we will not make payments for cancelled appointments
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment cancelled or not found!' })
        }

        //creating options for razorpay payment:
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,

        }

        //creation of an order:
        const order = await razorPayInstance.orders.create(options)

        res.json({ success: true, order })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

//api to verify payment of razorpay:
const verifyRazorpay=async(req,res)=>{
    try{
        const {razorpay_order_id}=req.body
        const orderInfo=await razorPayInstance.orders.fetch(razorpay_order_id)

        console.log("orderInfo: ",orderInfo)
        if(orderInfo.status==='paid'){
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            res.json({success:true,message:'Payment Successful!'})
        }else{
            res.json({success:false,message:'Payment Failed!'})
        }
    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointments,paymentRazorPay,verifyRazorpay }