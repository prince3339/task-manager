var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: __dirname + '/src/app',
    entry: {
        app: ['./required-files.js', __dirname + '/src/public/style/sass/main.scss'],
        vendor: [
            __dirname + '/node_modules/angular',
            __dirname + '/node_modules/angular-messages',
            __dirname + '/node_modules/angular-material',
            __dirname + '/node_modules/firebase',
            __dirname + '/node_modules/angularfire',
            __dirname + '/node_modules/@uirouter/angularjs'
        ]
    },
    devtool: 'inline-source-map',
    output: {
        filename: 'app.bundle.js',
        path: path.resolve(__dirname, 'src'),
        //path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        // new HtmlWebpackPlugin({
        //     title: 'Task Manager'
        // }),
        new ExtractTextPlugin({ // define where to save the file
            filename: '/public/style/css/[name].bundle.css',
            allChunks: true,
        }),
        new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' })
    ],
    // devServer: {
    //     contentBase: './src'
    // },
    module: {
        rules: [{
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.(scss|sass)$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    //resolve-url-loader may be chained before sass-loader if necessary
                    use: ['css-loader', 'sass-loader']
                })
            }
        ]
    }
};