const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/main.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_module/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx','.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'geompi.js',
        library: 'GeomPi',
        libraryTarget: "umd"
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    externals: {
        '@svgdotjs/svg.js': '@svgdotjs/svg.js',
        '@svgdotjs/svg.draggable.js': '@svgdotjs/svg.draggable.js'
    }
};