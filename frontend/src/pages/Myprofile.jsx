import React from 'react'
import { useState,useContext } from 'react'
import { assets } from '../assets/assets'
import { Input } from 'postcss'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';

const Myprofile = () => {

     
    // const [userData, setUserData] = useState({
    //     name: "Pranjal",
    //     image: assets.pranjal_pic,
    //     email: "pandeypranjal264@gmail.com",
    //     phone: '+91 6295526510',
    //     address: {
    //         line1: '115,4th floor,UpperBazar',
    //         line2: 'Rangpo,Sikkim'
    //     },
    //     gender: 'Male',
    //     dob: '2003-06-13'
    // })


    const {userData,setUserData,token,backendUrl,loadUserProfileData}=useContext(AppContext)

    const [isEdit, setIsEdit] = useState(false)
    
    const [image,setImage]=useState(false)

    const updateUserProfileDate=async()=>{
        try{
            const formData=new FormData();

            formData.append('email',userData.email)
            formData.append('name',userData.name)
            formData.append('phone',userData.phone)
            formData.append('address',JSON.stringify(userData.address))
            formData.append('gender',userData.gender)
            formData.append('dob',userData.dob)

            image && formData.append('image',image)

            //making an api call to update the data:

            const {data}=await axios.post(backendUrl+'/api/user/update-profile' , formData,{headers:{token}})

            if(data.success){
                toast.success(data.message)
                //refetching the user data after updation:
                await loadUserProfileData();
                setIsEdit(false)
                setImage(false)
            }else{
                toast.error(data.message)
            }

        }catch(error){
            console.log(error);
            toast.error(error.message)
        }
    }
    
    //here we are writting the userData&& because when we are reloading the webpage then the userdata is not initialized
    //here because userdata is beinge fethed by the api call so it might take some moment to get the data so that is why we are writting userData&& so that we does not face any error if the userdata is not available when we reload the webpage
    return  userData&&(
        <div className='max-w-lg flex flex-col gap-2 text-sm'>

            {
                isEdit?
                <label htmlFor="image">
                    <div className='inline-block relative cursor-pointer'>
                        <img className='w-36 rounded opacity-75' src={image? URL.createObjectURL(image):userData.image} alt="" />
                        <img className='w-10 absolute buttom-12 right-12'  src={image?'':assets.upload_icon} alt="" />
                        <input type="text" />
                    </div>
                    <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden/>
                </label>
                :
                <img className='w-36 rounded' src={userData.image} alt="" />
            }

           

            {
                isEdit ?
                    <input className='bg-gray-50 text-3xl font-medium max-w-60 mt-4' type="text" value={userData.name} onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} />
                    : <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
            }


            <hr className='bg-zinc-400 h-[1px] border-none'/>

            <div>
                <p className='text-neutral-500 underline mt-3'>
                    CONTACT INFORMATION
                </p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
                    <p className='font-medium '>Email id:</p>
                    {
                        isEdit?
                        <input className='bg-gray-100 max-w-52' type="text" onChange={(e)=>setUserData(prev=>({...prev,email:e.target.value}))} value={userData.email}/>
                        :
                        <p className='text-blue-500'>{userData.email}</p>
                    }
                    
                    <p className='font-medium'>Phone:</p>
                    {
                        isEdit ?
                            <input  className='bg-gray-100 max-w-52' type="text" value={userData.phone} onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} />
                            : <p className='text-blue-500'>{userData.phone}</p>
                    }
                    <p className='font-medium'>Address:</p>
                    {
                        isEdit ?
                            <p>
                                <input className='bg-gray-50 ' type="text" onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={userData.address.line1} />
                                <br />
                                <input className='bg-gray-50 ' type="text" onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={userData.address.line2} />
                            </p>
                            :
                            <p className=''>
                                {userData.address.line1}
                                <br />
                                {userData.address.line2}
                            </p>
                    }

                </div>
            </div>

            <div>
                <p className='text-neutral-500 underline mt-3'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
                    <p className='font-medium '>Gender:</p>
                    {
                        isEdit ?
                            <select className='max-w-20 bg-gray-100' onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select> :
                            <p className='text-gray-400'>{userData.gender}</p>
                    }
                    <p className='font-medium'>BirthDay:</p>
                    {
                        isEdit?
                        <input className='max-w-28 bg-gray-100' type="date" onChange={(e)=>setUserData(prev=>({...prev,dob:e.target.value}))} value={userData.dob}/>:
                        <p className='text-gray-400'>{userData.dob}</p>
                    }
                </div>
               
            </div>
            <div className='mt-10 '>
            {
                isEdit?
                <button className='border border-primary px-8 py-2 rounded-full hover:text-white hover:bg-primary transition-all' onClick={updateUserProfileDate}>Save information</button>:
                <button className='border border-primary px-8 py-2 rounded-full hover:text-white hover:bg-primary transition-all' onClick={()=>setIsEdit(true)}>Edit</button>
            }
            </div>

          
        </div>
    )
}

export default Myprofile
