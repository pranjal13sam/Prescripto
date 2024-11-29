import jwt from 'jsonwebtoken'

// admin authentication middleware:

const authAdmin=async(req,res,next)=>{
    try{

        const {atoken}=req.headers;
        if(!atoken){
            return res.json({
               success:false,
               message:"Not Authorized login again!" 
            })
        }
        //if user is authorized then we need to decode the token first inorder to verify
        const token_decode=jwt.verify(atoken,process.env.JWT_SECRET)
        
        if(token_decode!==process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.json({
                success:false,
                message:"Not Authorized login again!" 
            })
        }

        //if token is matching then:

        next();

    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export default authAdmin