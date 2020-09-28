const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

//---------Router for creating the user---------
router.post('/users' , async (req,res) =>{
    const user = new User(req.body)

    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user ,token})
    }catch(e){
        res.status(400).send(e)
    }
})

//---------Router for login the user---------
router.post('/users/login' , async (req,res) =>{
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateAuthToken()
        res.send({user: user, token})
    }catch(e){
        res.status(400).send()
    }
})

//---------Router for logout the user---------
router.post('/users/logout' , auth , async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})

//---------Router for logout all the user from every device---------
//---------By removing all the token values---------
router.post('/users/logoutall' , auth , async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})

//---------Router for getting the user---------
router.get('/users/me' , auth , async(req,res) =>{
    res.send(req.user)
})

//---------Router for getting the user by id---------
router.get('/users/:id', async(req,res) =>{
    const _id = req.params.id

    try{
        const user =await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch(e){
        res.status(500).send()
    }
})

//---------Router for update the user---------
router.patch('/users/me' , auth , async (req,res) =>{
    const updates = Object.keys(req.body)
    const allow = ['name' , 'age', 'email' , 'password']
    const isValid=(updates.every(update => allow.includes(update)))

    if(!isValid){
        return res.status(400).send({error:"Invalid request"})
    }

    try{

        updates.forEach(update =>{
            req.user[update] = req.body[update]
        })

        await req.user.save()

        //const user = await User.findByIdAndUpdate(req.params.id, req.body ,{new: true , runValidators: true})
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

//---------Router for delete the user---------
router.delete('/users/me', auth , async (req,res)=>{
    try{
        // const user =await User.findByIdAndDelete(req.params.id)
        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        res.send(req.user)
    }
    catch(e){
        res.status(500).send(user)
    }
})

//----------Router for Upload the images----------
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        const regex = (/\.(jpg|jpeg|png)$/)
        if(!file.originalname.match(regex)){
            return cb(new Error("Please upload an image file"))
        }
        cb(null,true)
    }
})
//Uploading Image
router.post('/users/me/avatar' ,auth , upload.single('avatar') , async (req,res) =>{
    const img= await sharp(req.file.buffer).resize({width:250,height:250}).jpeg().toBuffer()
    req.user.avatar = img
    await req.user.save()
    res.send()
} , (error ,req,res,next)=>{
    res.status(400).send({error: error.message})
})

//---------Router for deleting the images---------
router.delete('/users/me/avatar' , auth , async (req, res) =>{
    try{
        req.user.avatar=undefined
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(404).send()
    }
})

//---------Router for fetching the user image---------
router.get('/users/:id/avatar' , async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error("Can't find")
        }
        res.set('Content-Type' , 'image/jpeg')
        res.send(user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})

module.exports = (router)