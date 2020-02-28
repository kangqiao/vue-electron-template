const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
//const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {entries, htmlPlugin} = require('./muti-page.config');

const {
  // dependencies,
  // devDependencies,
  productName,
} = require('../package.json')

// const externals = Object.keys(dependencies).concat(Object.keys(devDependencies))
const isDevMode = process.env.NODE_ENV === 'development'
// const whiteListedModules = ['vue']

const config = {
  name: 'renderer',
  mode: process.env.NODE_ENV,
  devtool: isDevMode ? 'eval' : false,
  entry: {
    main: path.join(__dirname, '../src/renderer/main.js'),
    ...entries()
  },
  output: {
    filename: '[name]/index.js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist'),
  },
  // externals: externals.filter(d => !whiteListedModules.includes(d)),
  module: {
    rules: [
      {
        test: /\.(j|t)s$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // use: {
        //   loader: 'vue-loader',
        //   options: {
        //     loaders: {
        //       sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
        //     },
        //   },
        // },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          //'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|tif?f|bmp|webp|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000, //小于10K的 都打包
            name: '[name]--[folder].[ext]', //生成文件名
            publicPath:"../imgs",	//替换CSS引用的图片路径
            outputPath:"../dist/imgs/"		//生成之后存放的路径
          },
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000, //小于10K的 都打包
            name: '[name]--[folder].[ext]',
            publicPath:"../fonts",	//替换字体文件向上查找
            outputPath:"../dist/fonts/"		//生成之后存放的路径
          },
        },
      },
    ],
  },
  node: {
    __dirname: isDevMode,
    __filename: isDevMode,
  },
  plugins: [
    //new CleanWebpackPlugin(['dist']),
    // new WriteFilePlugin(),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.PRODUCT_NAME': JSON.stringify(productName),
      'process.env.IS_BROWSER': true,
    }),
    new MiniCssExtractPlugin({
      filename: '[name]/style.css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      title: 'main',
      excludeChunks: ['processTaskWorker'],
      filename: 'main/index.html',
      chunks: ['manifest', 'vendor', 'main'],
      template: path.resolve(__dirname, '../src/renderer/index.ejs'),
      nodeModules: isDevMode
        ? path.resolve(__dirname, '../node_modules')
        : false,
    }),
  ].concat(htmlPlugin()),
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.common.js',
      //vue$: 'vue/dist/vue.esm.js',
      '@': path.join(__dirname, '../src/'),
      src: path.join(__dirname, '../src/'),
      icons: path.join(__dirname, '../_icons/'),
    },
    extensions: ['.ts', '.js', '.vue', '.json'],
  },
  target: 'electron-renderer',
}

/**
 * Adjust rendererConfig for production settings
 */
if (isDevMode) {
  // any dev only config
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
} else {
  config.plugins.push(
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../static'),
        to: path.join(__dirname, '../dist/main/static'),
      },
      {
        from: path.join(__dirname, '../static'),
        to: path.join(__dirname, '../dist/newPage/static'),
      },
      {
        from: path.join(__dirname, '../_icons'),
        to: path.join(__dirname, '../dist/icons'),
      },
    ])
  )

  // config.optimization = {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  // }
}

module.exports = config
