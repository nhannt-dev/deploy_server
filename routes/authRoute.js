const { sendVerifyUser, deleteUser, register, login, logout, loginAdmin, updateUser, updateRoleUserByAdmin, changePasswordUser, getCurrentUser, getAllUsers, forgotPassword, resetPassword } = require('../controllers/authController')
const { authMiddleware, isAdmin } = require('../middlewares/auth')

const router = require('express').Router()

router.post('/verify', sendVerifyUser)

router.post('/register', register)

router.post('/login', login)

router.post('/admin-login', loginAdmin)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password', resetPassword)

router.put('/', authMiddleware, updateUser)

router.put('/password', authMiddleware, changePasswordUser)

router.put('/role/:id', [authMiddleware, isAdmin], updateRoleUserByAdmin)

router.get('/', authMiddleware, getCurrentUser)

router.get('/users', [authMiddleware, isAdmin], getAllUsers)

router.delete('/:id', [authMiddleware, isAdmin], deleteUser)

router.get('/logout', logout)


module.exports = router