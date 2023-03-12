const User = require('../models/authModel')
const Verify = require('../models/verifyModel')
const asyncHandler = require('express-async-handler')
const { generateRefreshToken, generateToken } = require('../utils/jwt')
const { generateVerifyCode, isVerifyEmail } = require('../middlewares/verify')
const { sendEmail, htmlSignupAccount, htmlResetPassword } = require('../utils/nodemailer')

exports.sendVerifyUser = asyncHandler(async (req, res) => {
    const { email } = req.body
    const findUser = await User.findOne({ email })
    if (findUser) throw new Error('Gửi mã thất bại người dùng đã tồn tại')
    const verifyCode = generateVerifyCode(6)
    const mail = {
        to: email,
        subject: 'Mã xác thực tạo tài khoản',
        html: htmlSignupAccount(verifyCode)
    }
    await Verify.findOneAndDelete({ email })
    await Verify.create({
        code: verifyCode,
        email,
        dateCreated: Date.now()
    })
    const result = await sendEmail(mail)
    if (result) return res.status(200).json({ message: 'Gửi mail xác thực thành công. Vui lòng kiểm tra lại email' })
})

exports.register = asyncHandler(async (req, res) => {
    try {
        const { verifyCode, firstname, lastname, email, mobile, password, confirmPassword, address } = req.body
        if (!verifyCode || !firstname || !lastname || !email || !mobile || !password || !confirmPassword || !address) throw new Error('Vui lòng nhập đầy đủ thông tin!')
        const findUser = await User.findOne({ email })
        if (findUser) throw new Error('Email đã tồn tại')
        if(confirmPassword !== password) throw new Error('Mật khẩu nhập lại không khớp')
        const isVerify = await isVerifyEmail(email, verifyCode)
        if (!isVerify) return res.status(400).json({ message: 'Mã xác nhận không hợp lệ !' })
        const newUser = await User.create({ firstname, lastname, email, mobile, password, confirmPassword, address })
        if (newUser) {
            await Verify.deleteOne({ email })
        }
        res.json(newUser)
    } catch (error) {
        return res.status(400).json({
            message: 'Đăng ký người dùng thất bại.',
            error
        })
    }
})

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const findUser = await User.findOne({ email })
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id)
        await User.findByIdAndUpdate(findUser?._id, { refreshToken: refreshToken }, { new: true })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            role: findUser?.role,
            token: generateToken(findUser?._id),
        })
    } else {
        throw new Error('Email hoặc mật khẩu không khớp!')
    }
})

exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const findAdmin = await User.findOne({ email })
    if (findAdmin.role !== "Admin") throw new Error("Yêu cầu quyền Admin thì mới có thể truy cập")
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id)
        await User.findByIdAndUpdate(findAdmin?._id, { refreshToken: refreshToken }, { new: true })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            role: findAdmin?.role,
            token: generateToken(findAdmin?._id),
        })
    } else {
        throw new Error('Email hoặc mật khẩu không đúng!')
    }
})

exports.logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie?.refreshToken) throw new Error('Không có Refresh Token hoặc đã đăng xuất trước đó trong Cookies này')
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({ refreshToken })
    if (!user) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
      })
      return res.sendStatus(204)
    }
    await User.findOneAndUpdate(refreshToken, {
      refreshToken: '',
    })
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    })
    res.json({ msg: 'Đăng xuất thành công!' })
})

exports.updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    if (Object.keys(req.body).length === 0) throw new Error('Vui lòng nhập đầy đủ thông tin!')
    const updatedUser = await User.findByIdAndUpdate(_id, req.body, { new: true })
    res.json(updatedUser)
})

exports.updateRoleUserByAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params
    const updatedRoleUser = await User.findByIdAndUpdate(id, { role: req.body?.role }, { new: true })
    res.json({ 
        msg: 'Cập nhật phân quyền thành công!',
        updatedRoleUser
    })
})

exports.deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    await User.findByIdAndDelete(id)
    res.json({ msg: 'Xóa người dùng thành công!' })
})

exports.changePasswordUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('+password')
    const isPasswordMatched = await user.isPasswordMatched(req.body.oldPassword)
    if (Object.keys(req.body).length === 0) throw new Error('Vui lòng nhập đầy đủ thông tin!')
    if (!isPasswordMatched) throw new Error('Mật khẩu cũ không đúng')
    if (req.body.newPassword !== req.body.confirmPassword) throw new Error('Mật khẩu của 2 trường không khớp')
    user.password = req.body.newPassword
    user.confirmPassword = req.body.confirmPassword
    await user.save()
    res.json({ msg: 'Đổi mật khẩu thành công!' })
})

exports.getCurrentUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const currentUser = await User.findById(_id).select('-_id -isBlocked -password -confirmPassword -refreshToken -createdAt -updatedAt')
    res.json(currentUser)
})

exports.getAllUsers = asyncHandler(async (req, res) => {
    const allUsers = await User.find().select('-_id -isBlocked -password -confirmPassword -cart -refreshToken -createdAt -updatedAt')
    res.json(allUsers)
})

exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) throw new Error('Người dùng không tồn tại')
    const verifyCode = generateVerifyCode(6)
    const mail = {
        to: email,
        subject: 'Thay đổi mật khẩu',
        html: htmlResetPassword(verifyCode)
    }
    await Verify.findOneAndDelete({ email })
    await Verify.create({
        code: verifyCode,
        email,
        dateCreated: Date.now()
    })
    const result = await sendEmail(mail)
    if (result) {
        res.status(200).json({ message: 'Gửi mail yêu cầu đổi mật khẩu thành công. Vui lòng kiểm tra lại email' })
    } else {
        res.json({ message: 'Gửi email thất bại!' })
    }
})

exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, verifyCode } = req.body
    const user = await User.findOne({ email })
    if (Object.keys(req.body).length === 0) throw new Error('Vui lòng nhập đầy đủ thông tin!')
    if(!user) throw new Error('Email không tồn tại!')
    if (req.body.newPassword !== req.body.confirmPassword) throw new Error('Mật khẩu của 2 trường không khớp')
    const isVerify = await isVerifyEmail(email, verifyCode)
    if (!isVerify) throw new Error('Mã xác nhận không hợp lệ.')
    user.password = req.body.newPassword
    user.confirmPassword = req.body.confirmPassword
    await user.save()
    await Verify.deleteOne({ email })
    res.json({ msg: 'Đổi mật khẩu thành công!' })
})