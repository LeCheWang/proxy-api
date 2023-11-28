const express = require('express');
const cors = require('cors');
const app = express();
const { CronJob } = require('cron');

const connectDB = require('./configs/database');
const router = require('./routers');

const Proxy = require('./models/proxy');

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
router(app);

// const cronJobDeleteProxyLate5m = new CronJob(
//   '05 * * * *',
//   async function () {
//     const proxy = await Proxy.find();

//   },
//   null,
//   true,
//   'Asia/Ho_Chi_Minh',
// );
// cronJobDeleteProxyLate5m.start();

app.listen(8080, () => {
  console.log('server run at port 5000');
});
