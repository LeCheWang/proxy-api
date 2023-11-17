const mongoose = require('mongoose');

const proxySchema = mongoose.Schema(
  {
    local: {
      type: String,
    },
    wan: {
      type: String,
    },
    ip: {
      type: String,
      default: '',
    },
    port: {
      type: String,
    },
    status: {
      type: String,
      default: 'available',
    },
    type: {
      type: String,
      default: 'ipv4',
    },
    time: {
      type: Number,
      default: 0,
    },
    token: {
      type: String,
      default: '',
    },
    time_update: {
      type: Date,
    },
    time_reset: {
      type: Number,
      default: 0,
    },
    next_change: {
      type: Number,
      default: 0,
    },
    timeout: {
      type: Number,
      default: 0,
    },
    table_id: {
      type: String,
      default: '0',
    },
    key: String,
    time_start_use: Date,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model('proxy', proxySchema);
