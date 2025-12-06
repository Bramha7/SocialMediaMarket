import express from 'express'
import { addCredential, addListing, deleteUserlisting, getAllPubliclisting, getAllUserListing, getAllUserOrders, markFeatured, puchaseAccount, toggleStatus, updateListing, withdrawAmount } from '../controllers/listing.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import upload from '../config/multer.js'


const router = express.Router()
router.post('/', upload.array('images', 5), protect, addListing)
router.put('/', upload.array('images', 5), protect, updateListing)
router.get('/public', getAllPubliclisting)
router.get('/user', protect, getAllUserListing)
router.put('/:id/status', protect, toggleStatus)
router.delete('/:listingId', protect, deleteUserlisting)
router.post('/add-credential', protect, addCredential)
router.put('/featured/:id', protect, markFeatured)
router.get('/user-orders', protect, getAllUserOrders)
router.post('/withdraw', protect, withdrawAmount)
router.post('/purchase-account/:listingId', protect, puchaseAccount)



export default router
