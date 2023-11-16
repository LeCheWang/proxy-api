const requestIp = require('request-ip');
const Proxy = require('../models/proxy');
const TaiKhoan = require('../models/taikhoan');
const ErrorResponse = require('../helpers/ErrorResponse');

module.exports = {
  updateNewProxy: async (req, res) => {
    const local = req.query.local;
    const wan = req.query.wan;
    const port = req.query.port;

    const oldProxy = await Proxy.findOne({ local, wan, port });
    let newProxy;
    if (oldProxy) {
      newProxy = await Proxy.findOneAndUpdate(
        { local, wan, port },
        { ip: requestIp.getClientIp(req), time_update: new Date() },
        { new: true },
      );
    } else {
      //chưa tồn tại thì tạo mới
      newProxy = await Proxy.create({
        local,
        wan,
        port,
        ip: requestIp.getClientIp(req),
        time_update: new Date(),
      });
    }

    return res.status(201).json({
      statusCode: 201,
      message: 'success',
      data: newProxy,
    });
  },
  changeProxy: async (req, res) => {
    const key = req.query.key;
    let local = req.query.local;

    //kiểm tra key
    let dichvu_ipv4 = [
      { id: '38', nextchange: 180000 },
      { id: '39', nextchange: 0 },
      { id: '40', nextchange: 5 * 60 * 1000 },
      { id: '41', nextchange: 120000 },
    ];
    const bodyQuery = {
      chitiet: key,
    };

    const tks = await TaiKhoan.findOne(bodyQuery);

    if (!tks) {
      throw new ErrorResponse(404, 'Key không chính xác. Hãy kiểm tra lại!!');
    }

    //next_change
    const next_change = dichvu_ipv4.find((d) => d.id === tks.dichvu).nextchange;

    const time_now = Date.now();
    if (time_now - tks.time_change_proxy < next_change) {
      throw new ErrorResponse(
        400,
        'Bạn cần đợi thêm ' +
          (next_change - (time_now - tks.time_change_proxy)) / 1000 +
          's',
      );
    }

    await TaiKhoan.findByIdAndUpdate(tks._id, {
      time_change_proxy: Date.now(),
    });

    //proxy
    let skip = 0;
    const bodyQueryProxy = { status: 'available' };
    if (!local) {
      const count = await Proxy.countDocuments(bodyQueryProxy);
      skip = Math.floor(Math.random() * count);
    } else {
      bodyQueryProxy.local = local;
    }
    const proxy = await Proxy.findOne(bodyQueryProxy).skip(skip).exec();

    if (!proxy) {
      throw new ErrorResponse(
        404,
        `Không tìm thấy proxy có local: ${local || ''} và status: available`,
      );
    }

    await Proxy.findByIdAndUpdate(proxy._id, {
      status: 'unavailable',
      time_update: new Date(),
    });

    return res.status(200).json(proxy);
  },
  getProxy: async (req, res) => {
    const key = req.query.key;

    //kiểm tra key
    let dichvu_ipv4 = [
      { id: '38', nextchange: 180000 },
      { id: '39', nextchange: 0 },
      { id: '40', nextchange: 5 * 60 * 1000 },
      { id: '41', nextchange: 120000 },
    ];
    const bodyQuery = {
      chitiet: key,
    };

    const tks = await TaiKhoan.findOne(bodyQuery);

    if (!tks) {
      throw new ErrorResponse(404, 'Key không chính xác. Hãy kiểm tra lại!!');
    }

    //next_change
    const next_change = dichvu_ipv4.find((d) => d.id === tks.dichvu).nextchange;

    const time_now = Date.now();
    if (time_now - tks.time_change_proxy < next_change) {
      throw new ErrorResponse(
        400,
        'Bạn cần đợi thêm ' +
          (next_change - (time_now - tks.time_change_proxy)) / 1000 +
          's',
      );
    }

    await TaiKhoan.findByIdAndUpdate(tks._id, {
      time_change_proxy: Date.now(),
    });

    //get proxy
    const proxy = await Proxy.find({ status: 'available' })
      .sort('port')
      .exec();
    if (proxy.length === 0) {
      throw new ErrorResponse(
        404,
        'Không tìm thấy proxy nào có status: available và local: ' + tks.local,
      );
    }
    return res.status(200).json({
      success: true,
      proxy: proxy[0].ip + ':' + proxy[0].port,
      location: tks.local,
      timeout: proxy[0].timeout,
      next_change: (next_change - (time_now - tks.time_change_proxy)) / 1000 ,
    });
  },
};
