import jwt from 'jsonwebtoken'

// User authentication middleware:

const authUser=async(req,res,next)=>{
    try{

        const {token}=req.headers;
        if(!token){
            return res.json({
               success:false,
               message:"Not Authorized login again!" 
            })
        }
        //if user is authorized then we need to decode the token first inorder to verify
        const token_decode=jwt.verify(token,process.env.JWT_SECRET)

        //after decoding the token we will get an id and then we will provide the id in the body
        req.body.userId=token_decode.id
        
        //if token is matching then:

        next();

    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export default authUser