const path = require("path");
const webpack = require('webpack');
const ProgressiveWebappPlugin = require('../packages/progressive-webapp-plugin');

module.exports = {
  entry: {
      bundle: [
        'webpack-dev-server/client?http://localhost:3000/',
        path.join(process.cwd(), "packages/progressive-webapp-plugin/index.js"),
        path.join(process.cwd(), "packages/generate-service-worker/index.js"),
        path.join(process.cwd(), "packages/generate-service-worker/templates/cache.js"),
        path.join(process.cwd(), "packages/generate-service-worker/templates/notifications.js"),
      ]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: path.resolve(__dirname),
    filename: "[name].js"
  },
  externals: {
    "fs": "Number"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ProgressiveWebappPlugin({
      version: '1',
      cache: {
        precache: [
          '*.css'
        ],
        strategy: [{
          type: 'prefer-cache',
          matches: '*.js'
        }]
      },
      notifications: {
        fetch: {
            url: 'fake/path',
        },
        log: {
          url: 'fake/path',
        }
      },
    })
  ]
};
