const ErrorResponse = require('../helpers/ErrorResponse');
const taiKhoanRouter = require('./taikhoan');
const proxyRouter = require('./proxy');

const errorHandle = require('../middlewares/error.handle');

module.exports = (app) => {
  app.use('/', proxyRouter);
  app.use('/api/dichvu', taiKhoanRouter);

  app.use('*', (req, res) => {
    throw new ErrorResponse(404, 'page not found');
  });

  app.use(errorHandle);
};
