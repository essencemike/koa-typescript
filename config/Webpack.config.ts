import * as path from 'path';
import * as StartServerPlugin from 'start-server-webpack-plugin';
import * as webpack from 'webpack';
import * as nodeExternals from 'webpack-node-externals';
import { Configuration, ExternalsElement } from 'webpack';

class WebpackConfig implements Configuration {
  // node 环境
  target: Configuration['target'] = 'node';
  mode: Configuration['mode'] = 'production';

  entry = [
    path.resolve(__dirname, '../src/index.ts'),
  ];

  output = {
    path: path.resolve(__dirname, '../dist'),
    filename: 'index.js',
  };

  externals: ExternalsElement[] = [];

  module = {
    rules: [
      {
        test: /\.ts$/,
        use: [
          { loader: 'babel-loader' },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: path.resolve(__dirname, './tsconfig.json'),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      }
    ],
  };

  resolve = {
    extensions: ['.ts', '.js', '.json'],
  };

  plugins = [new webpack.NoEmitOnErrorsPlugin()];

  constructor(mode: Configuration['mode']) {
    this.mode = mode;

    if (mode === 'development') {
      // 添加webpack/hot/signal 用来热更新
      this.entry.push('webpack/hot/signal');
      this.externals.push(
        nodeExternals({
          whitelist: ['webpack/hot/signal'],
        })
      );

      const devPlugins = [
        new webpack.HotModuleReplacementPlugin(),

        new StartServerPlugin({
          name: 'index.js',
          signal: true,
          nodeArgs: ['--inspect'],
        }),
      ];

      this.plugins.push(...devPlugins);
    }
  }
}

export default WebpackConfig;
