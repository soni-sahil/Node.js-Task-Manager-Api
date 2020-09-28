const express = require('express')
require("./db/mongoose")

//----------Import user router----------
const userRouter = require('./router/user')

//----------Import task router----------
const taskRouter = require('./router/task')
const User = require('./models/user')

const app = express()

const port = process.env.PORT || 3000

// app.use((req , res , next) =>{
//     res.status(503).send("Under maintenance")
//     next()
// })

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(port , () =>{
    console.log('Server on port' + port)
})


// const myFunction = async ()=>{
//     const user = await User.findById('5f6dea8329f0d80afcc0cb6e')
//     await user.populate('userTasks').execPopulate()
//     console.log(user.userTasks)
// }

// myFunction()