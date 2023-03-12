const mongoose = require('mongoose')

const verifySchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
    },
    dateCreated: {
        type: Number,
        required: true,
    }
})

module.exports = mongoose.model("Verify", verifySchema)