import 'dotenv/config'
import express from 'express'
import db from './db.js'
const app =express()
const PORT = process.env.PORT || 3000

app.use(express.json())


//*---> import routes
import userRoute from './routes/user.routes.js'
import candidateRoute from './routes/candidate.routes.js'

//*---> use routes
app.use('/user',userRoute)
app.use('/candidate',candidateRoute)

app.listen(PORT,()=>{
    console.log(`server is listening at http://localhost:${PORT}`);
})