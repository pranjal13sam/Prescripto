import { createContext } from "react";
//import { doctors } from "../assets/assets";
import axios from 'axios'
import {useState,useEffect} from 'react'
import {toast} from 'react-toastify'

export const AppContext=createContext()


const AppContextProvider=(props)=>{

    const backendUrl=import.meta.env.VITE_BACKEND_URL

    const [doctors,setDoctors]=useState([])
    
    //saving the token which is comimg from the backend
    //this is the logic for lets suppose if the user is loggen in and if he refreshes the page so he doesn't get logged out
    const [token,setToken]=useState(localStorage.getItem('token')?localStorage.getItem('token'):false)
    const [userData,setUserData]=useState(false)




    const currencySymbol='$'

 

    const getDoctorsData=async()=>{
        try{
            const {data}=await axios.get(backendUrl+ '/api/doctor/list')
            if(data.success){
                setDoctors(data.doctors)
            }else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
            console.log(error)
        }
    }

    const loadUserProfileData=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/user/get-profile',{headers:{token}})

            if(data.success){
                setUserData(data.userData)
            }
            else{
                toast.error(data.message)
            }
        }catch(error){
            console.log(error);
            toast.error(error.message)
        }
    }

    const value={
        doctors,currencySymbol,token,setToken,
        backendUrl,setUserData,userData,loadUserProfileData,getDoctorsData
    }

    useEffect(()=>{
        getDoctorsData()
    },[])

    useEffect(()=>{
        if(token){
            loadUserProfileData()
        }else{
            setUserData(false)
        }
    },[token])
    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider

