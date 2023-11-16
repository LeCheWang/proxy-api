const express = require('express');
const router = express.Router();

const Async = require('../middlewares/async');

const { updateNewProxy, changeProxy, getProxy } = require('../controllers/proxy');

router.route('/update-new-proxy').get(Async(updateNewProxy));
router.route('/change-proxy').get(Async(changeProxy));
router.route('/get-proxy').get(Async(getProxy));

module.exports = router;
