const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

exports.dbConnect = () => {
    try {
        mongoose.connect(process.env.DB_URI)
        console.log('Kết nối DB thành công!')
    } catch (error) {
        console.log('Không thể kết nối đến DB')
    }
}