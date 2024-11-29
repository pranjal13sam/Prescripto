import mongoose from "mongoose";

const doctorSchema= new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    image:{type:String,required:true},
    speciality:{type:String,required:true},
    degree:{type:String,required:true},
    experience:{type:String,required:true},
    about:{type:String,required:true},
    available:{type:Boolean,default:true},
    fees:{type:Number,required:true},
    address:{type:Object,required:true},
    date:{type:Number,required:true},
    slots_booked:{type:Object,default:{}},
},{minimize:false})
//writting minmize:false here because by default mongodb removes empty object while saving in the database so sometimes doctors slots may be empty but we don't need to remove them from the database so we write minmize:false


const doctorModel=mongoose.models.doctor||mongoose.model('doctor',doctorSchema)

//mongoose.models.doctor => this line here is added because whenever we start the project everytime the doctor model will be created so if we add the mongoose.models.doctor line it will check if the model is already created then the mongoose.models.doctor will be used else doctor model will be created

export default doctorModel