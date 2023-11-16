const express = require('express');
const router = express.Router();

const { syncData, getTaiKhoan } = require('../controllers/taikhoan');

const Async = require('../middlewares/async');

router.route('/').get(Async(getTaiKhoan));
router.route('/sync').get(Async(syncData));

module.exports = router;
