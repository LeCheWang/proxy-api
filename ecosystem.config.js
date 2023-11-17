module.exports = {
  apps: [
    {
      name: 'PROXY_API',
      script: './index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 2100,
      },
    },
  ],
};
