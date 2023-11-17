const express = require('express');
const router = express.Router();

const {
  syncData,
  getTaiKhoan,
  deleteExpiredTime,
} = require('../controllers/taikhoan');

const Async = require('../middlewares/async');

router.route('/').get(Async(getTaiKhoan));
router.route('/sync').get(Async(syncData));
router.route('/delete-expired').get(Async(deleteExpiredTime));

module.exports = router;
