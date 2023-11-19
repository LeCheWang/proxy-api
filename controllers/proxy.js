const requestIp = require('request-ip');
const Proxy = require('../models/proxy');
const TaiKhoan = require('../models/taikhoan');
const ErrorResponse = require('../helpers/ErrorResponse');

module.exports = {
  updateNewProxy: async (req, res) => {
    //done
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
    const bodyQueryProxy = { status: 'available', ip: { $ne: '' } };
    if (!local) {
      const count = await Proxy.countDocuments(bodyQueryProxy);
      skip = Math.floor(Math.random() * count);
    } else {
      const countLocal = await Proxy.countDocuments({ local: local });
      if (countLocal > 0) {
        bodyQueryProxy.local = local;
      } else {
        const count = await Proxy.countDocuments(bodyQueryProxy);
        skip = Math.floor(Math.random() * count);
      }
    }
    const proxy = await Proxy.findOne(bodyQueryProxy).skip(skip).exec();

    if (!proxy) {
      throw new ErrorResponse(
        404,
        `Không tìm thấy proxy có local: ${local || ''} và status: available`,
      );
    }

    //update từ unavailable => expired
    await Proxy.findOneAndUpdate(
      {
        status: 'unavailable',
        key: key,
      },
      {
        status: 'expired',
        //   ip: '',
      },
    );

    await Proxy.findByIdAndUpdate(proxy._id, {
      status: 'unavailable',
      time_start_use: Date.now(),
      key: key,
    });
    //next_change
    const time_wait = (next_change - (time_now - tks.time_change_proxy)) / 1000;

    return res.status(200).json({
      success: true,
      proxy: proxy.ip + ':' + proxy.port,
      location: proxy.local,
      next_change: time_wait,
      time_out: 20 * 60,
    });
  },
  getProxy: async (req, res) => {
    //done
    const key = req.query.key;

    //lấy thời gian còn lại phải chờ
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

    const time_wait = (next_change - (time_now - tks.time_change_proxy)) / 1000;

    //get proxy
    const proxy = await Proxy.find({ status: 'unavailable', key: key });

    const timeout1 = time_now - proxy[0].time_start_use;
    console.log(timeout1);
    return res.status(200).json({
      success: true,
      proxy: proxy[0].ip + ':' + proxy[0].port,
      location: proxy[0].local,
      timeout: 1200 - timeout1 / 1000,
      next_change: time_wait,
    });
  },
  //tìm ra các proxy status expired và loca...
  exportWanExpired: async (req, res) => {
    const wan = req.query.wan;
    const local = req.query.local;
    const port = req.query.port;

    const result = await Proxy.updateMany(
      {
        wan,
        port,
        local,
        status: 'expired',
        time_start_use: {
          $lt: Date.now() - 20 * 60 * 1000,
        },
      },
      { ip: '', status: 'available', time_start_use: '', key: '' },
    );

    if (result.matchedCount === 0) {
      return res.send('');
    }

    return res.send(
      `#!/bin/bash
      ifdown wan
      sleep 5
      ifup wan
	  sleep 10
      wget -O /root/ip.sh "http://api.proxyfb.com/updateNewProxy.php?local=${local}&wan=${wan}&port=${port}"
      sleep 5
      wget -O /root/ip.sh "http://api.proxyfb.com/updateNewProxy.php?local=${local}&wan=${wan}&port=${port}"`,
    );
  },
};
