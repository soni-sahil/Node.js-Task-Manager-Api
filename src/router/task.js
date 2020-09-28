//----------Task Router----------

const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')

const Task = require('../models/task')

//----------Router for getting all the tasks----------

router.get('/tasks' , auth , async (req,res) =>{

    // GET /tasks?completed=true
    // GET /tasks?limit=2&skip=0   (we use limit and skip options)
    // GET /tasks?sortBy=createdAt:asc

    // const match = {}
    // const sort = {}

    // if(req.query.completed){
    //     match.completed = req.query.completed === 'true'
    // }
    // if(req.query.sortBy){
    //     const parts = req.query.sortBy.split(":")
    //     sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    // }

    let Query
    if(req.query.completed){
       Query = {
           owner: req.user.id ,
           completed: req.query.completed
       }
    }
    else{
        Query ={owner: req.user.id}
    }
    
    try{
        
        const task = await Task.find(Query).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip))

        // await req.user.populate({
        //     path: 'userTasks' ,
        //     match ,
        //     options: {
        //         limit: parseInt(req.query.limit) ,
        //         skip : parseInt(req.query.skip)
        //     } ,
        //     sort
        // }).execPopulate()

        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

//----------Router for getting the task by id----------
router.get("/tasks/:id" , auth, async (req,res) =>{
    const _id = req.params.id

    try{
        // const task =await Task.findById(_id)

        const task = await Task.findOne({_id: _id , owner: req.user.id})

        if(!task){
            return res.status(404).send()
        }
        res.send(task)    
    }catch(e){
        res.status(500).send()
    }
})

//----------Router for creating the task----------
router.post('/tasks' ,auth ,async (req,res) =>{
    // const task  = new Tasks(req.body)

    const task = new Task({
        ...req.body ,
        owner : req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

//----------Router for updating the task by using the id----------
router.patch('/tasks/:id' ,auth , async (req, res) =>{

    const updates = Object.keys(req.body)
    const allowed = ['description' , 'completed']
    const isValid = updates.every(update => allowed.includes(update))

    if(!isValid){
        return res.status(404).send({"error" : "Invalid Request"})
    }

    try{
        // const task = await Task.findById(req.params.id)

        const task = await Task.findOne({_id: req.params.id , owner: req.user.id})

        if(!task){
            return res.status(404).send()
        }

        updates.forEach(update =>{
            task[update] = req.body[update]
        })

        await task.save()
        
        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})

//----------Router for deleting the task by id----------
router.delete('/tasks/:id' ,auth , async (req,res) =>{
    try{
        const task = await Task.findOneAndDelete({ _id: req.params.id , owner: req.user.id} )
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send(e)
    }
})

module.exports = router