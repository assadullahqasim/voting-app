import express from 'express'
import { User } from '../models/user.model.js';
import { jwtAuthMiddleware, generateToken } from '../middleware/jwt.middleware.js';
import { body,validationResult } from 'express-validator';

const router = express.Router();

// signup

router.post("/signup",[
    body('email').isEmail().withMessage('Invalid email type'),
    body('password').isLength({min:8}).withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/).withMessage('Password must include an uppercase character')
    .matches(/\d/).withMessage('Password must include a number'),
    body("age").custom((value)=>{
        if(value < 18){
            throw new Error('Age must be 18 or above')
        }
        return true
    }),
    body("CNIC").matches(/^\d{5}-\d{7}-\d{1}$/).withMessage("CNIC must follow the format 36102-5599883-9")
], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = new User(req.body);
        const data = await user.save();

        res.status(201).json({ user: data});
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// login

router.post('/login', async (req, res) => {
    try {
        const { CNIC, password } = req.body;
        const user = await User.findOne({ CNIC });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid CNIC or password" });
        } 

        const payload = { id: user.id};
        const token = generateToken(payload,'1d');

        res.status(200).json({ token, user });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// profile

router.get("/profile", jwtAuthMiddleware, async (req, res) => {

    try {
        const userId = req.user.id;
        const data = await User.findById({userId});

        if (!data) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Error in /profile route:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


// update

router.put("/profile/password",jwtAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const {currentPassword,newPassword} = req.body
        const user = await User.findOne({id});
        if (await user.comparePassword(currentPassword)) {
            return res.status(404).json({ error: "Invalid password" });
        }
        user.password = newPassword
        await user.save()
        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = await User.findByIdAndDelete(id);
        if (!data) {
            return res.status(404).json({ error: "user not found" });
        }
        res.status(200).json({ message: "user deleted", data });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/:workType',async(req,res)=>{
    try {
        const workType = req.params.workType
        if(workType == 'chef' || workType == 'waiter' || workType == 'manager'){
            const data = await User.find({work:workType})
            res.status(201).json(data)
        }else{
            res.status(404).json({error:"Invalid work type"})
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({error:"Internal server error"})
    }
})


export default router;