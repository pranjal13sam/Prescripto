import React, { useContext,useState,useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import {toast} from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const MyAppointment = () => {

    const {doctors,backendUrl,token,getDoctorsData}=useContext(AppContext)

    const [appointments,setAppointments]=useState([])
    const months=['Jan','Feb','March','April','May','Jun','Jul','Aug',
        'Sep','Oct','Nov','Dec'
    ]
    
    const navigate=useNavigate()

    const slotDateFormat=(slotDate)=>{
        const dateArray=slotDate.split('-')
        return dateArray[0]+" "+ months[Number(dateArray[1]-1)]+" " + dateArray[2]
    }


    const getUserAppointments=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/user/appointments',{headers:{token}})

            if(data.success){
                //we will get the appointments in reverse order from the backend so to correct that:
                const sortedAppointments = data.appointments.sort((a, b) => {
                    // Parse slotDate and slotTime into full Date objects
                    const dateTimeA = new Date(`${a.slotDate} ${a.slotTime}`);
                    const dateTimeB = new Date(`${b.slotDate} ${b.slotTime}`);
    
                    //console.log("Comparing:", dateTimeA, dateTimeB); // Debugging: Check parsed dates
    
                    // Sort appointments in ascending order of datetime
                    return dateTimeA - dateTimeB;
                });
    
                //console.log("After sorting:", sortedAppointments); // Debugging: Verify the sorted data
    
                setAppointments(sortedAppointments);
            }
        }catch(error){
            console.log(error)
            toast.error(error.message)
        }
    }

    const cancelAppointment=async(appointmentId)=>{
        try{
            //console.log("AppointmentId: ",appointmentId)
            const {data}=await axios.post(backendUrl+'/api/user/cancel-appointment',{appointmentId},{headers:{token}})

            if(data.success){
                toast.success(data.message)
                getUserAppointments()
                //to refresh the appointment time slots again
                getDoctorsData()
            }else{
                toast.error(data.message)
            }
        }catch(error){
            console.log(error)
            toast.error(error.message)
        }
    }

    const initPay=(order)=>{
        const options={
            key:import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount:order.amount,
            currency:order.currency,
            name:'Appointment Payment',
            description:'Appointment Paymnet',
            order_id:order.id,
            receipt:order.receipt,
            //whenever the payment is successful 
            handler:async(response)=>{
                console.log("response: ",response)

                try{
                    const {data}=await axios.post(backendUrl+'/api/user/verify-razorpay',response,{headers:{token}})
                    if(data.success){
                        getUserAppointments();
                        navigate('/my-appointments')
                    }
                }catch(error){
                    console.log(error);
                    toast.error(error.message)
                }
            }
        }
        //initializing the payment:
        const rzp=new window.Razorpay(options)
        //creating a pop-up in the window
        rzp.open()
    }
  
    const appointmentRazorPay=async(appointmentId)=>{

        try{
            const {data}=await axios.post(backendUrl+'/api/user/payment-razorpay',{appointmentId},{headers:{token}})

            if(data.success){
                initPay(data.order)
                console.log("order: ",data.order)
               
            }
        }catch(error){
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(token){
            console.log("appointments: ",getUserAppointments())
        }
    },[token])
  return (
    <div>
     <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
     <div >
        {
            appointments.map((item,index)=>(
                <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
                    <div>
                        <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
                    </div>
                    <div className='flex-1 text-sm text-zinc-600'>
                        <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                        <p>{item.docData.speciality}</p>
                        <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                        <p className='text-xs'>{item.docData.address.line1}</p>
                        <p className='text-xs'>{item.docData.address.line2}</p>
                        <p className='text-xs mt-1'> <span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
                    </div>
                    {/* this div is left for future to make the component responsive */} 
                    <div></div>
                    <div className='flex flex-col gap-2 justify-end'>
                        {!item.cancelled&&item.payment && <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>Paid</button>}
                       {!item.cancelled&& !item.payment&& <button onClick={()=>appointmentRazorPay(item._id)} className='hover:bg-primary hover:text-white transition-all duration-300 text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded'>
                            Pay Online
                            </button>}
                            {!item.cancelled&&<button onClick={()=>cancelAppointment(item._id)} className='hover:bg-red-600 hover:text-white transition-all duration-300 text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded'>
                                Cancel Appointment
                            </button>}
                            {item.cancelled&& <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment Cancelled</button>}
                    </div>
                </div>
            ))
        }
     </div>
    </div>
  )
}

export default MyAppointment
