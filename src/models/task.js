//----------Task Model----------

const mongoose = require('mongoose')

const validator = require('validator')

//----------Creating a Schema----------
const taskSchema = mongoose.Schema({
    description: {
        type: String ,
        required: true ,
        trim: true
    },
    completed: {
        type : Boolean ,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId ,
        required: true ,
        ref: 'User'
    }
},{
    timestamps: true
})

//----------Creating a task model----------
const Tasks = mongoose.model('Tasks' , taskSchema)

module.exports = Tasks