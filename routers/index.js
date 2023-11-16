const ErrorResponse = require('../helpers/ErrorResponse');
const taiKhoanRouter = require('./taikhoan');
const proxyRouter = require('./proxy');

const errorHandle = require('../middlewares/error.handle');

module.exports = (app) => {
  app.use('/api/dichvu', taiKhoanRouter);
  app.use('/api/proxy', proxyRouter);

  app.use('*', (req, res) => {
    throw new ErrorResponse(404, 'page not found');
  });

  app.use(errorHandle);
};
