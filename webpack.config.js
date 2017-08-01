var webpack = require('webpack'); // It's the main module loader
var path = require('path'); //module used to get and resolved directory path
//var HtmlWebpackPlugin = require('html-webpack-plugin'); 
var CleanWebpackPlugin = require('clean-webpack-plugin'); // Used to clean dist folder
var ExtractTextPlugin = require('extract-text-webpack-plugin'); //Used it to extract css code

module.exports = {
    context: __dirname + '/src/app',
    entry: {
        //required-files.js app's javascript is entry point, /src/public/style/sass/main.scss is the scss entry point
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
        path: path.resolve(__dirname, 'src'), //Combined js and css file paths are set to src
        //path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        // new HtmlWebpackPlugin({
        //     title: 'Task Manager'
        // }),
        new ExtractTextPlugin({ // define where to save the file
            filename: '/public/style/css/[name].bundle.css', // combined css file name
            allChunks: true,
        }),
        new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' })
        //All the vendor library code's will be stored in this file
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
                    }) //This loader used to load css files
            },
            {
                test: /\.(scss|sass)$/,
                use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        //resolve-url-loader may be chained before sass-loader if necessary
                        use: ['css-loader', 'sass-loader']
                    }) ////This loader used to load and extract scss/css files
            }
        ]
    }
};