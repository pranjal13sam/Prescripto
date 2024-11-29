import React, { useEffect,useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useContext } from 'react'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import {toast} from 'react-toastify'
import axios from 'axios'

const Appointment = () => {

    const {docId}=useParams()
    const {doctors,currencySymbol,backendUrl,token,getDoctorsData}=useContext(AppContext)

    const navigate=useNavigate()

    const daysOfWeek=['SUN','MON','TUE','WED',
        'THU','FRI','SAT'
    ]
    const [docInfo,setDocInfo]=useState(null)
    const [docSlots,setDocSlots]=useState([])
    const [slotIndex,setSlotIndex]=useState(0)
    const [slotTime, setSlotTime]=useState('')

    const fetchDocInfo=async ()=>{
        const docInfo=await doctors.find(doc=>doc._id===docId)
        setDocInfo(docInfo)
        //console.log(docInfo);
        
    }


    //function for booking an appointment:
    const bookAppointment=async()=>{
        if(!token){
            toast.warn('Please login to book the appointment!')
            return navigate('/login')
        }

        try{
            //datetime is an object when i consoled it i got this object in inspect 
            const date=docSlots[slotIndex][0].datetime

            let day=date.getDate()
            //+1 becaues when it will give the result it will start from jan so for jan it will give 0 so by adding 1 it will start giving from jan as 1
            let month=date.getMonth()+1
            let year=date.getFullYear()

            const slotDate=day+"-"+month+"-"+year
            //console.log("slotdate: ",slotDate)

            //making an api call to book an appointment:

            const {data}=await axios.post(backendUrl+'/api/user/book-appointment',{docId,slotDate,slotTime},{headers:{token}})

            if(data.success){
                toast.success(data.message)
                //for updation of timeslots 
                getDoctorsData()
                navigate('/my-appointments')
            }else{
                toast.error(data.message)
            }

        }catch(error){
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        fetchDocInfo()
    },[doctors,docId])


    const getAvailableSlots=async()=>{
        //clearing the previous slots
        setDocSlots([])

        //gettting current date:
        let today=new Date();
        
        //calculating next 7 days from today:
        for(let i=0;i<7;i++){
            //getting date with index
            let currentDate=new Date(today)
            currentDate.setDate(today.getDate()+i)
            
            //setting endtime of the date with index
            let endTime=new Date()
            endTime.setDate(today.getDate()+i)
            endTime.setHours(21,0,0,0,)

            //setting hours:
            if (today.getDate() === currentDate.getDate()) {
                // For today: start from the next valid slot
                if (today.getMinutes() > 30) {
                    currentDate.setHours(today.getHours() + 1);
                    currentDate.setMinutes(0);
                } else {
                    currentDate.setHours(today.getHours());
                    currentDate.setMinutes(30);
                }
            } else {
                // For subsequent days: always start from 10:00 AM
                currentDate.setHours(10);
                currentDate.setMinutes(0);
            }

            let timeSlots=[]

            while(currentDate<endTime){
                let formattedTime=currentDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})

                
                let day=currentDate.getDate()
                //+1 becaues when it will give the result it will start from jan so for jan it will give 0 so by adding 1 it will start giving from jan as 1
                let month=currentDate.getMonth()+1
                let year=currentDate.getFullYear()

                const slotDate=day+"-"+month+"-"+year
                
                const slotTime=formattedTime
                
                //here basically we are removing those times and dates on which slots are already booked on ui:
                const isSlotAvailable=docInfo.slots_booked && docInfo.slots_booked[slotDate]&&docInfo.slots_booked[slotDate].includes(slotTime)?false:true

                console.log("Slots Booked: ",docInfo)
                if(isSlotAvailable){
                    //add slots to array
                timeSlots.push({
                    datetime:new Date(currentDate),
                    time:formattedTime
                })
                }
                

                    //increment current time by 30 minutes

                    currentDate.setMinutes(currentDate.getMinutes()+30)
            }
            setDocSlots(prev=>([...prev,timeSlots]))
        }
    }

   

    useEffect(()=>{
        console.log(docSlots)
    },[docSlots])

    useEffect(()=>{
        getAvailableSlots()
    },[docInfo])

  return docInfo &&(
    <div className=''>
      {/* Doctor's Details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
            <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 sm:mt-0 mt-[-80px]'>
            {/* doctor details */}
            <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>{docInfo.name} 
                <img className='w-5' src={assets.verified_icon} alt="" />
                </p>
            <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
                <p>{docInfo.degree} - {docInfo.speciality}</p>
                <button className='py-0.5 px-2 border text-xs  rounded-full'>{docInfo.experience}</button>
            </div>

            {/* doctor's about */}
            <div>
                <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About 
                    <img src={assets.info_icon} alt="" /></p>
                <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
            </div>
            <p className='text-gray-500 font-medium mt-4'>
              Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
            </p>
        </div>
      </div>

      {/* {Booking Slots} */}

      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium
      text-gray-700'>
        <p className=''>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
            {
                docSlots.length&&docSlots.map((item,index)=>(
                    <div onClick={()=>setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex===index?'bg-primary text-white':'border border-gray-200'}`} key={index}>
                        <p>{item[0]&&daysOfWeek[item[0].datetime.getDay()]}</p>
                        <p>{item[0]&&item[0].datetime.getDate()}</p>
                    </div>
                ))
            }
        </div>
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
            {docSlots.length&& docSlots[slotIndex].map((item,index)=>(
                <p onClick={()=>setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time===slotTime? 'bg-primary text-white': 'text-gray-400 border border-gray-400'}`} key={index}>
                    {item.time.toLowerCase()}
                </p>
            ))}
        </div>
        <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>
            Book an Appointment
        </button>
      </div>

      {/* Listing Related Doctors */}

      <RelatedDoctors docId={docId} speciality={docInfo.speciality}/>
    </div>
  )
}

export default Appointment
