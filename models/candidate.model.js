import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const candidateSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },
        age:{
            type:Number,
            required: true
        },
        party:{
            type: String,
            required: true
        },
        votes:[
            {
                user:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                votedAt:{
                    type: Date,
                    default: Date.now,
                    required: true
                }
            }
        ],
        voteCount:{
            type: Number,
            default: 0
        }
    },
    {
        timestamps:true
    }
)


export const Candidate = mongoose.model('Candidate',candidateSchema)