"use strict";

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const nodeSassMagicImporter = require('node-sass-magic-importer');

const copy = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const devMode = nodeEnv === 'development';

const MiniCssExtract = new MiniCssExtractPlugin({
    filename: 'css/[name].css',
    chunkFilename: "[id].css",
    disable: nodeEnv === 'development'
});

module.exports = (function makeWebpackConfig() {
    let config = {
        context: __dirname,
        mode: devMode ? 'development' : 'production'
    };

    config.entry = {
        app: ['./src/index.js']
    };

    config.output = {
        path: path.resolve(__dirname, 'dist'),
        publicPath: devMode ? '/' : '/dist/',
        filename: 'js/[name].bundle.js',
    };

    // config.devtool = isProd ? 'hidden-source-map' : 'cheap-module-source-map';
    config.devtool = devMode ? 'cheap-module-source-map' : undefined;

    config.resolve = {
        extensions: ['.css', '.scss', '.js'],
        alias: {
            assets: path.resolve(__dirname, './src/assets/')
        }
    };

    config.devServer = {
        contentBase: './',
        overlay: true,
        historyApiFallback: true,
        hot: true,
        noInfo: false,
        disableHostCheck: true
    };

    config.module = {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                include: [
                    path.resolve(__dirname, './src/assets','scss')
                ],
                use: [
                    // MiniCssExtractPlugin.loader,
                    (process.env.NODE_ENV !== 'production') ? 'style-loader' : MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { importLoaders: 2 } },
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                ctx: {
                                    cssnext: true,
                                    cssnano: true,
                                    autoprefixer: true
                                }
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: [path.resolve(__dirname, 'node_modules/foundation-sites/scss'), path.resolve(__dirname, 'node_modules/motion-ui')],
                            importer: nodeSassMagicImporter(),
                        },
                    },
                ],
            },
            {
                test: /\.(js)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        // plugins: ['@babel/plugin-transform-runtime']
                    }
                },
                exclude: path.resolve(__dirname, './node_modules/')
            },
            {
                test: /\.(png|jpe?g|gif|svg|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: 'images/[name].[ext]'
                        }
                    }
                ],
                exclude: path.resolve(__dirname, '../node_modules/')
            },
            {
                test: /\.(woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: 'fonts/[name].[ext]'
                        }
                    }
                ],
                exclude: path.resolve(__dirname, '../node_modules/')
            },
            {
                test: /\.json$/,
                use: [ 'json-loader' ]
            }
        ]
    };

    config.plugins = [
        // new CleanWebpackPlugin(['assets/js']),

        new webpack.NamedModulesPlugin(),

        new webpack.HotModuleReplacementPlugin(),

        MiniCssExtract,

        new HtmlWebpackPlugin({
            cache: false,
            filename: 'index.html',
            template: path.join(__dirname, './public/index.html')
        })
    ];

    config.optimization = {
        minimizer: [
            new UglifyJsPlugin({
                // cache: true,
                // parallel: true,
                uglifyOptions: {
                    compress: {
                        warnings: false,
                        drop_console: false
                    },
                    output: {
                        comments: false
                    },
                    mangle: {
                        keep_fnames: true
                    }
                },
                sourceMap: true // set to true if you want JS source maps
            }),
            // new OptimizeCSSAssetsPlugin({})
            new OptimizeCSSAssetsPlugin({
                assetNameRegExp: /\.optimize\.css$/g,
                cssProcessor: require('cssnano'),
                cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
                canPrint: true
            })
        ]
    };

    return config;
}());
