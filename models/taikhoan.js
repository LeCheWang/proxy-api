const mongoose = require('mongoose');

const tkSchema = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    dichvu: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    chitiet: {
      type: String,
      required: true,
    },
    trangthai: {
      type: String,
      required: true,
    },
    khieunai: {
      type: String,
      default: null,
    },
    thoigianmua: {
      type: Date,
      required: true,
    },
    songaymua: {
      type: Number,
      required: true,
    },
    time: {
      type: Number,
      required: true,
    },
    expire_time_token: {
      type: Number,
      required: true,
    },
    expire_time_get_proxy: {
      type: Number,
      required: true,
    },
    local: {
      type: String,
      required: true,
    },
    dinhdang: {
      type: String,
      required: true,
    },
    node: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
    ipv6: {
      type: String,
      default: null,
    },
    time_change_proxy: {
      type: Number,
      default: Date.now(),
    },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

module.exports = mongoose.model('taikhoan', tkSchema);
