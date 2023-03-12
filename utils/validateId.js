const mongoose = require("mongoose")

exports.validateMongoDbId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id)
    if (!isValid) throw new Error("Khong tim thay id, vui long thu lai")
}