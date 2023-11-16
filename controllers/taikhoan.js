const axios = require('axios');
const TaiKhoan = require('../models/taikhoan');

module.exports = {
  syncData: async (req, res) => {
    const dichvu = req.query.dichvu;
    const response = await axios.get(
      'https://proxyfb.com/exportService.php?dichvu=' + dichvu,
    );
    if (response.data && response.data.data.length > 0) {
      //   await TaiKhoan.deleteMany();
      // Lưu dữ liệu vào schema
      for (const item of response.data.data) {
        const tk = await TaiKhoan.findOne({ id: item.id });
        if (!tk) {
          await TaiKhoan.create(item);
        } else {
          await TaiKhoan.findOneAndUpdate({ id: item.id }, item);
        }
      }
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'sync data success',
    });
  },
  getTaiKhoan: async (req, res) => {
    const dichvu = req.query.dichvu.split(',');
    const bodyQuery = {
      dichvu: {
        $in: dichvu,
      },
    };

    const taikhoans = await TaiKhoan.find(bodyQuery);
    return res.status(200).json({
      status: 'success',
      data: taikhoans,
    });
  },
};
