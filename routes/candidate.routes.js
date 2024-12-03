import express from 'express'
import { Candidate } from '../models/candidate.model.js';
import { User } from '../models/user.model.js';
import { jwtAuthMiddleware } from '../middleware/jwt.middleware.js';
import { body,validationResult } from 'express-validator';
const router = express.Router();

const checkAdminRole = async (userId)=>{
    try {
        const user = await User.findById(userId)
        return user.role === 'admin'
    } catch (err) {
        return false
    }
}

router.post("/signup",jwtAuthMiddleware,[
    body("age").custom((value)=>{
        if(value < 18){
            throw new Error('Age must be 18 or above')
        }
        return true
    })
], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({error:'user does not have admin role'})
        }
        const user = new Candidate(req.body);
        const data = await user.save();

        res.status(201).json({ user: data});
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//! update
router.put("/:candidateId",jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({error:'user does not have admin role'})
        }
        const candidateId = req.params.candidateId;
        const user = await Candidate.findByIdAndUpdate(candidateId,req.body,{new:true});
        if(!user){
            return res.status(404).json({error:"candidate not found"})
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//! delete
router.delete("/:candidateId",jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({error:'user does not have admin role'})
        }
        const candidateId = req.params.candidateId;
        const user = await Candidate.findByIdAndDelete(candidateId);
        if(!user){
            res.status(404).json({error:"candidate not found"})
        }
        res.status(200).json({message:"candidate deleted"});
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//! voting

router.post("/vote/:candidateId",jwtAuthMiddleware,async(req,res)=>{
    const candidateId = req.params.candidateId
    const userId = req.user.id
    try {
        const candidate = await Candidate.findById(candidateId)
        if(!candidate){
            return res.status(404).json({error:"candidate not found"})
        }

        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error:"user not found"})
        }

        if(user.isVotted){
            return res.status(400).json({error:'You have already voted cannot vote again'})
        }

        if(user.role === 'admin'){
            return res.status(403).json({error:'Admin cannot vote'})
        }

        //? candidate
        candidate.votes.push({user:userId})
        candidate.voteCount++;
        await candidate.save()

        //? user 
        user.isVotted = true
        await user.save()

        res.status(200).json({message:"vote recorded successfully"})
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

//! vote count 

router.get('/vote/count',async(req,res)=>{
    try {

        const candidate = await Candidate.find().sort({voteCount:'desc'})

        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        })

        return res.status(200).json(voteRecord)
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.get('/',async(req,res)=>{
    try {
        const candidate = await Candidate.find({},{name:1,party:1,_id:0})
        res.status(200).json({candidate:candidate})
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

export default router