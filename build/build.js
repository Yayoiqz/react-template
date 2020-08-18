
require('./check-versions')();

process.env.NODE_ENV = 'production';
// process.env.npm_config_report = true

const ora = require('ora');
const rm = require('rimraf');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const config = require('../config');
const webpackConfig = require('./webpack.prod.conf');

const spinner = ora('building for production...');
spinner.start();

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), (err) => {
  if (err) throw err;
  webpack(webpackConfig, (errNew, stats) => {
    spinner.stop();
    if (errNew) throw errNew;
    process.stdout.write(`${stats.toString({
      colors: true,
      modules: false,
      children: false, // using ts-loader, set this to true will make TypeScript error during build.
      chunks: false,
      chunkModules: false,
    })}\n\n`);

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'));
      process.exit(1);
    }

    console.log(chalk.cyan('  Build complete.\n'));
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n'
      + '  Opening index.html over file:// won\'t work.\n',
    ));
  });
});