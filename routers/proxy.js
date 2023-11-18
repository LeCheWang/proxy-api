const express = require('express');
const router = express.Router();

const Async = require('../middlewares/async');

const { updateNewProxy, changeProxy, getProxy, exportWanExpired } = require('../controllers/proxy');

router.route('/updateNewProxy.php').get(Async(updateNewProxy));
router.route('/api/changeProxy.php').get(Async(changeProxy));
router.route('/api/getProxy.php').get(Async(getProxy));
router.route('/exportWanExpired.php').get(Async(exportWanExpired));

module.exports = router;
