const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
router.get('/profile-v1', authMiddleware, userController.getProfile);
router.put('/update-profile-v1', authMiddleware, userController.updateProfile);
router.put('/cover-image-v1', authMiddleware, userController.updateCoverImage);
router.post('/follow/:starId-v1', authMiddleware, userController.followStar);
module.exports = router;