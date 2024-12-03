import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },
        age:{
            type:Number,
            required: true
        },
        mobile:{
            type:String,
        },
        email:{
            type: String,
        },
        address:{
            type: String,
            required: true
        },
        CNIC:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true
        },
        role:{
            type: String,
            enum: ['voter','admin'],
            default: 'voter',
            required: true
        },
        isVotted:{
            type: Boolean,
            default: false
        }
    },
    {
        timestamps:true
    }
)

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10);
    next()   
})

userSchema.methods.comparePassword = async function(inputPassword){
    return await bcrypt.compare(inputPassword,this.password)
}

export const User = mongoose.model('User',userSchema)