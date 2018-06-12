import * as Koa from 'koa';
import { Get, required, Controller, convert, log } from '../middlewares/router';

// 测试中间件
async function someFun(ctx: Koa.Context, next: any) {
  console.log('convert function');
  await next();
}

@Controller('user')
export default class UserController {

  @Get(':id')
  @required({ params: 'id' })
  @log
  @convert(someFun)
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
