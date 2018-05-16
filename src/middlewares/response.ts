import { Context } from 'koa';
import { Response } from '../types/response';

export default async (ctx: Context, next: any) => {
  ctx.success = ({ data, msg, total, success }: Response) => {
    ctx.body = {
      code: 200,
      data,
      msg,
      total,
      success,
    };
  };

  await next();
};
