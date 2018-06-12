import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as path from 'path';

import { Route } from './middlewares/router/Route';

import errorHandle from './middlewares/errorHandle';
import response from './middlewares/response';

const app = new Koa();

const router = new Route(app);

// Use default router
app.use(bodyParser());

app.use(response);

app.use(errorHandle);

// 初始化所有的routers
router.registerRouters();

export default app;
