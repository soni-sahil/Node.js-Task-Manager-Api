//----------User Model----------

const mongoose = require('mongoose')

const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//----------Importing Task Model----------
const Task = require('./task')

//----------Creating a Schema----------
const userSchema = new mongoose.Schema({
    name: {
        type: String ,
        required: true ,
        trim: true
    },
    email:{
        type: String ,
        required: true,
        unique: true ,
        trim: true ,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 7 ,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cant be password')
            }
        }
    },
    age: {
        type: Number ,
        default : 0,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be +ve number')
            }
        }
    } ,
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }] ,
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('userTasks' ,{
    ref: 'Tasks' ,
    localField : '_id' ,
    foreignField : 'owner' 
})

//----------working on the toJSON method----------
//----------which is an inbuild method----------
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//----------Generating tokens----------
userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id: user._id.toString()} , process.env.JWT_SECRET)

    user.tokens= user.tokens.concat({token})
    await user.save()

    return token
}

//----------Authenticate the user for login----------
userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password , user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

//----------Using mongoose middleware----------
//-----------Hash the password before saving-------------
userSchema.pre('save' , async function (next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8)
    }
    next()
})

//----------Using mongoose middleware----------
//----------Deleting the task when useris deleted ----------
userSchema.pre('remove' , async function (next){
    const user =this

    await Task.deleteMany({owner: user._id})

    next()
})

//----------Creating a model----------
const User = mongoose.model('User' , userSchema)

module.exports = User