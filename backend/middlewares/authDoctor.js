import jwt from 'jsonwebtoken'

// Doctor authentication middleware:

const authDoctor=async(req,res,next)=>{
    try{

        const {dtoken}=req.headers;
        if(!dtoken){
            return res.json({
               success:false,
               message:"Not Authorized login again!" 
            })
        }
        //if user is authorized then we need to decode the token first inorder to verify
        const token_decode=jwt.verify(dtoken,process.env.JWT_SECRET)

        //after decoding the token we will get an id and then we will provide the id in the body
        req.body.docId=token_decode.id
        
        //if token is matching then:

        next();

    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export default authDoctor