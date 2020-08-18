/* eslint-disable guard-for-in */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('../config');
const packageConfig = require('../package.json');
const theme = require('../theme');

const devMode = process.env.NODE_ENV !== 'production';

exports.assetsPath = (_path) => {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory;

  return path.posix.join(assetsSubDirectory, _path);
};

exports.cssLoaders = (options) => {
  // eslint-disable-next-line no-param-reassign
  options = options || {};

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap,
      modules: {
        localIdentName: '[local]--[hash:base64:5]', // 开启css module
      },
    },
  };

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap,
    },
  };

  const styleLoader = {
    loader: devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
  };
  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = options.usePostCSS
      ? [styleLoader, cssLoader, postcssLoader] : [styleLoader, cssLoader];

    if (loader) {
      loaders.push({
        loader: `${loader}-loader`,
        options: { ...loaderOptions, sourceMap: options.sourceMap },
      });
    }

    return loaders;
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    less: generateLoaders('less', { modifyVars: theme }),
    scss: generateLoaders('sass'),
  };
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = (options) => {
  const output = [];
  const loaders = exports.cssLoaders(options);

  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp(`\\.${extension}$`),
      use: loader,
    });
  }
  return output;
};


exports.createNotifierCallback = () => {
  // eslint-disable-next-line global-require
  const notifier = require('node-notifier');

  return (severity, errors) => {
    if (severity !== 'error') return;

    const error = errors[0];
    const filename = error.file && error.file.split('!').pop();

    notifier.notify({
      title: packageConfig.name,
      message: `${severity}: ${error.name}`,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png'),
    });
  };
};
