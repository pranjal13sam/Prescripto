import axios from "axios";
import { createContext } from "react";
import { useState,useEffect } from "react";
import { toast } from "react-toastify";
export const AdminContext=createContext()

const AdminContextProvider=(props)=>{
    //this is basically so that if we refresh the page after login then the token is there wo reset na ho
    const [aToken,setAToken]=useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'')
    const backendUrl=import.meta.env.VITE_BACKEND_URL

    const [doctors,setDoctors]=useState([])
    const [appointments,setAppointments]=useState([])
    const [dashData,setDashData]=useState(false)

    console.log("URL:", backendUrl + "api/admin/all-doctors");
    console.log("token",aToken)

    

    const getAllDoctors=async()=>{
        try{

            const {data}=await axios.post(backendUrl+'/api/admin/all-doctors',{},{headers:{aToken}})
            console.log(data)
            if(data.success){
                setDoctors(data.doctors)
                console.log(data.doctors)
            }else{
                toast.error(data.message)
            }
        }catch(error){
            
            toast.error(error.message)
            console.log(error)
        }
    }


   // change availability function:

    const changeAvailability=async(docId)=>{
        
        try{
            //api call:
            const {data}=await axios.post(backendUrl+'/api/admin/change-availability',{docId},{headers:{aToken}})
            console.log(data)

            if(data.success){
                toast.success(data.message)
                //now if doctors data(availabiliy) has been updated then we need to update the doctor functionality also 
                getAllDoctors()
            }else{
                
                toast.error(data.message)
            }
        }
        catch(error){
            toast.error(error.message)
            console.log(error)
        }
    }
    //get all appointments:
    const getAllAppointments=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/admin/appointments',{headers:{aToken}})

            if(data.success){
                setAppointments(data.appointments)
                console.log(data.appointments)
            }else{
                toast.error(data.message)
            }
        }catch(error){
            console.log(error)
            toast.error(error.message)
        }
    }

    
    //to get the dashboard data from the api:

    const getDashData=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/admin/dashboard',{headers:{aToken}})

            if(data.success){
                setDashData(data.dashData)
                console.log(data.dashData)
            }else{
                toast.error(data.message)
            }
        }catch(error){
            console.log(error);
            toast.error(error.message)
        }
    }

    //api to cancel appointment:
    
    const cancelAppointment=async(appointmentId)=>{
        try{

            const {data}=await axios.post(backendUrl+'/api/admin/cancel-appointment',{appointmentId},{headers:{aToken}})

            if(data.success){
                toast.success(data.message)
                getAllAppointments()
                getAllDoctors()
                getDashData()
            }else{
                toast.error(data.message)
            }
        }catch(error){
            console.log(error);
            toast.error(error.message)
        }
    }


    const value={
        aToken,setAToken,
        backendUrl,doctors,
        getAllDoctors,changeAvailability,appointments,setAppointments,
        getAllAppointments,cancelAppointment,
        getDashData,dashData
    }
    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider
