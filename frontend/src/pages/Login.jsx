import React, { useContext,useState,useEffect } from 'react'
import { Form, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';

const Login = () => {

    const {token,setToken,backendUrl}=useContext(AppContext)

    const navigate=useNavigate()
    
    const [state,setState]=useState('Sign Up')

    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [name,setName]=useState('')

    const onSubmitHandler= async(e)=>{
        e.preventDefault()

        //making an api call:
        try{

            //here we are making two api calls one for login and one for Signup
            if(state==='Sign Up'){
                const {data}=await axios.post(backendUrl+'/api/user/register' ,{name,password,email})
                if(data.success){
                    localStorage.setItem('token',data.token)
                    setToken(data.token)
                }else{
                    toast.error(data.message)
                }
            }else{//it means the state is login
                const {data}=await axios.post(backendUrl+'/api/user/login',{email,password})
                if(data.success){
                    localStorage.setItem('token',data.token)
                    setToken(data.token)
                }
                else{
                    
                    toast.error(data.message)
                }
            }

        }catch(error){
            toast.error(error.message)
        }

    }

    useEffect(()=>{
        if(token){
            navigate('/')
        }
    },[token])
  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
       <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>
            {state==='Sign Up'?"Create Account" : "Login"}
        </p>
        <p>Please {state==='Sign Up'?"Sign Up":"login"} to book appointment</p>
        {
          state=== "Sign Up"&&   <div className='w-full'>
          <p>Full Name</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setName(e.target.value)} value={name} required/>
      </div>
        }
        <div className='w-full'>
            <p>Email</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setEmail(e.target.value)} value={email} required/>
        </div>
        <div className='w-full'>
            <p>Password</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setPassword(e.target.value)} value={password} required/>
        </div>
        <button type='submit' className='bg-primary w-full text-white py-2 rounded-md text-base mt-1'>
            {state==='Sign Up'?"Create Account":"Login"}
        </button>
        {
            state==='Sign Up'? 
            <p className=''>Already have an account? <span onClick={()=>setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>: 
            <p>Create a new account? <span onClick={()=>setState('Sign Up')} className='text-primary underline cursor-pointer'>click here</span></p>
        }
       </div>
    </form>
  )
}

export default Login
