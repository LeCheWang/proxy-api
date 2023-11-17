const express = require('express');
const router = express.Router();

const Async = require('../middlewares/async');

const { updateNewProxy, changeProxy, getProxy, exportWanExpired } = require('../controllers/proxy');

router.route('/updateNewProxy.php').get(Async(updateNewProxy));
router.route('/change-proxy').get(Async(changeProxy));
router.route('/get-proxy').get(Async(getProxy));
router.route('/exportWanExpired.php').get(Async(exportWanExpired));

module.exports = router;
