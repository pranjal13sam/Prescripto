import mongoose from "mongoose";

const apponintmentSchema=new mongoose.Schema({
    userId:{type:String,required:true},
    docId:{type:String,required:true},
    slotDate:{type:String,required:true},
    slotTime:{type:String,required:true},
    userData:{type:Object,required:true},
    docData:{type:Object,required:true},
    amount:{type:Number,required:true},
    date:{type:Number,required:true},
    cancelled:{type:Boolean,default:false},
    payment:{type:Boolean,default:false},
    isCompleted:{type:Boolean,default:false}
})

//the use of || operator ensures that if an appointment model already exists in the Mongoose model registry, it will be reused instead of being redefined. This is particularly useful in situations where the code is executed multiple times, such as in a development environment where the server automatically reloads due to changes.
const appointmentModel=mongoose.model.appointment||mongoose.model('appointment',apponintmentSchema)

export default appointmentModel


