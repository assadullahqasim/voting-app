import jwt from 'jsonwebtoken'

const generateToken = (payLoad,expiresIn)=>{
    try {
        return jwt.sign(payLoad,process.env.JWT_SECRET_KEY,{expiresIn})
    } catch (err) {
        console.error('error generating token ',err.message)
        throw new Error('failed to generate token')
    }
}

const jwtAuthMiddleware = (req,res,next)=>{

    //? check token is present or not
    const authorization = req.headers.authorization
    if(!authorization)return res.status(401).json({error:"Token not found"})
    
    //? extract token Bearer token
    const token = authorization.split(' ')[1]
    if(!token) return res.status(401).json({error:'Unauthorized"'})
    
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user = decoded
        next()
    } catch (err) {
        console.error('jwt verfication failed ',err.message)
        res.send(401).json({error:'Invalid or expire token'})
    }
}

export {generateToken,jwtAuthMiddleware}