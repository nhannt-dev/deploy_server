const router = require('express').Router()
const uploader = require('../config/cloudinary')
const { createProduct, getProduct, getProducts, updateProduct, deleteProduct, ratings, uploadImagesProduct } = require('../controllers/productController')
const { authMiddleware, isAdmin } = require('../middlewares/auth')

router.post('/', [authMiddleware, isAdmin], createProduct)

router.get('/:id', getProduct)

router.get('/', getProducts)

router.put('/:id', [authMiddleware, isAdmin], updateProduct)

router.delete('/:id', [authMiddleware, isAdmin], deleteProduct)

router.put('/ratings/:id', authMiddleware, ratings)

router.put('/upload/:id', [authMiddleware, isAdmin], uploader.array('images', 3),uploadImagesProduct)

module.exports = router