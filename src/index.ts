import * as http from 'http';
import chalk from 'chalk';
import * as moment from 'moment';

import app from './app';
import config from './config';

let currentApp = app.callback();
const server = http.createServer(currentApp);
server.listen(config.port, () => {
  console.log(
    `[${chalk.grey(moment().format('HH:mm:ss'))}] ${chalk.blue(
      'Mock Server is running on port:',
    )} ${chalk.cyan(`${config.port}`)}`,
  );
});

if (module.hot) {
  module.hot.accept('./app.ts', () => {
    server.removeListener('request', currentApp);
    currentApp = app.callback();
    server.on('request', currentApp);

    console.log(
      `[${chalk.grey(moment().format('HH:mm:ss'))}] ${chalk.blue(
        'Mock Server is restarting on port:',
      )} ${chalk.cyan(`${config.port}`)}`,
    );
  });
}
