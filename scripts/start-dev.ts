import * as webpack from 'webpack';
import WebpackConfig from '../config/Webpack.config';

const devConfig = new WebpackConfig('development');

webpack(devConfig).watch({
  aggregateTimeout: 300,
}, (error: Error) => {
  console.log(error);
});
