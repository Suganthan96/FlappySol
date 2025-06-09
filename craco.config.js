const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Add fallbacks for Node.js core modules
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                "process": require.resolve("process/browser"),
                "stream": require.resolve("stream-browserify"),
                "crypto": require.resolve("crypto-browserify"),
                "buffer": require.resolve("buffer/"),
                "assert": require.resolve("assert"),
                "http": require.resolve("stream-http"),
                "https": require.resolve("https-browserify"),
                "os": require.resolve("os-browserify"),
                "url": require.resolve("url")
            };

            // Add plugins
            webpackConfig.plugins.push(
                new webpack.ProvidePlugin({
                    process: 'process/browser',
                    Buffer: ['buffer', 'Buffer'],
                })
            );

            // Handle ESM modules
            webpackConfig.module.rules.push({
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            });

            // Configure hot module replacement
            webpackConfig.module.rules.push({
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                include: /node_modules\/@reown/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['react-hot-loader/babel']
                    }
                }
            });

            return webpackConfig;
        }
    }
}; 
