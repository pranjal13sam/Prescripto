import { createContext } from "react";

export const AppContext=createContext()

const calculateAge=(dob)=>{
    const today=new Date();
    const birthDate=new Date(dob)

    let age=today.getFullYear()-birthDate.getFullYear()
    return age;
}

const months=['Jan','Feb','March','April','May','Jun','Jul','Aug',
    'Sep','Oct','Nov','Dec'
]

const slotDateFormat=(slotDate)=>{
    const dateArray=slotDate.split('-')
    return dateArray[0]+" "+ months[Number(dateArray[1]-1)]+" " + dateArray[2]
}

const currency='$'


const AppContextProvider=(props)=>{
    const value={
        calculateAge,slotDateFormat,currency
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}


export default AppContextProvider