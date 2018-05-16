import * as Koa from 'koa';
import { router, required, prefix, convert, log } from '../middlewares/router';

// 测试中间件
async function someFun(ctx: Koa.Context, next: any) {
  console.log('convert function');
  await next();
}

@prefix('/api')
class UserController {

  @router({
    method: 'get',
    path: '/user',
  })
  @log
  async getUser(ctx: Koa.Context): Promise<void> {
    ctx.success({
      data: {
        userId: 'IMike',
        userName: 'IMike',
      },
      msg: '获取 user 信息成功！',
    });
  }
}

export default UserController;
