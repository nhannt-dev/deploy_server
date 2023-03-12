const mongoose = require('mongoose')

const { ObjectId } = mongoose.Types

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    specification: {
        screen_size: String,
        screen_tech: String,
        rear_camera: String,
        front_camera: String,
        chipset: String,
        ram_capacity: String,
        memory: String,
        battery: String,
        sim: String,
        charger: String,
        os: String,
        network: String,
        wifi: String,
        bluetooth: String,
        gps: String,
        extension: String
    },
    variant: [
        {
            color: String
        }
    ],
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    images: {
        type: Array
    },
    ratings: [
        {
            star: { type: Number },
            postedBy: { type: ObjectId, ref: 'User' },
            comment: { type: String }
        }
    ],
    totalRatings: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema)