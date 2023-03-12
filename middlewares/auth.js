const User = require('../models/authModel')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

exports.authMiddleware = asyncHandler(async (req, res, next) => {
    let token
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                const user = await User.findById(decoded.id)
                req.user = user
                next()
            }
        } catch (error) {
            throw new Error("Phiên đăng nhập đã hết hạn!")
        }
    } else {
        throw new Error("Vui lòng đăng nhập để sử dụng tính năng này")
    }
})

exports.isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user
    const adminUser = await User.findOne({ email })
    if (adminUser.role !== 'Admin') {
        throw new Error("Yêu cầu quyền admin để truy cập vào tài nguyên này")
    } else {
        next()
    }
})