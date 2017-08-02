(function() {
    var webpack = require('webpack'); // It's the main module loader
    var config = require('./webpack.config');
    var path = require('path'); //module used to get and resolved directory path
    var CopyWebpackPlugin = require('copy-webpack-plugin'); //module used to copy directory

    var replaceOutput = {
        filename: 'app.bundle.js',
        path: path.resolve(__dirname, 'dist/src'), //Combined js and css file paths are set to src
        //path: path.resolve(__dirname, 'dist')
    }

    config.output = replaceOutput;
    config.plugins.push(new CopyWebpackPlugin([{
        from: __dirname + '/index.html',
        to: __dirname + '/dist'
    }]));

    config.plugins.push(new CopyWebpackPlugin([{
        from: __dirname + '/src/app/task/view',
        to: __dirname + '/dist/src/app/task/view'
    }]));

    config.plugins.push(new CopyWebpackPlugin([{
        from: __dirname + '/src/lib',
        to: __dirname + '/dist/src/lib'
    }]));

    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    config.plugins.push(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }));
    config.devServer = {
        contentBase: __dirname + './dist',
        stats: 'minimal'
    };

    // config.module.rules[0].use['options'] = {
    //     minimize: true || { /* CSSNano Options */ }
    // }

    // config.module.rules[1].use['options'] = {
    //     minimize: true || { /* CSSNano Options */ }
    // }

    //console.log(config.module.rules[0]);

    module.exports = config;
})()