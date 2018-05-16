import * as Koa from 'koa';
import chalk from 'chalk';
import { symbolRoutePrefix, Route } from './Route';
import { RouteConfig } from '../../types/router';

let requestID = 0;

function sureIsArray(arr: any) {
  return Array.isArray(arr) ? arr : [arr];
}

function isDescriptor(desc: PropertyDescriptor | Function): boolean {
  if (!desc || !desc.hasOwnProperty) return false;

  for (let key of ['value', 'initializer', 'get', 'set']) {
    if (desc.hasOwnProperty(key)) return true;
  }
  
  return false;
}

function last(arr: Array<Function>): Function | PropertyDescriptor {
  return arr[arr.length - 1];
}

function requireDescriptor(target: any, name: string, descriptor: PropertyDescriptor, rules: any) {
  async function middleware(ctx: Koa.Context, next: any) {
    if (rules.query) {
      rules.query = sureIsArray(rules.query);

      for (let name of rules.query) {
        if (!ctx.query[name]) {
          ctx.throw(412, `GET Request query: ${name} required`);
        }
      }
    }

    if (rules.params) {
      rules.params = sureIsArray(rules.params);

      for (let name of rules.params) {
        if (!ctx.params[name]) {
          ctx.throw(412, `GET Request params: ${name} required`);
        }
      }
    }

    await next();
  }

  target[name] = sureIsArray(target[name]);
  target[name].splice(target[name].length - 1, 0, middleware);

  return descriptor;
}

function decorate(handleDescriptor: Function, entryArgs: Array<Function>) {
  if (isDescriptor(last(entryArgs))) return handleDescriptor(entryArgs);

  return function () {
    return handleDescriptor(...Array.from(arguments), ...entryArgs);
  }
}

/**
 * url参数
 * list/:id?username=zhangsan&&age=30
 * @required({query: 'username'}) 
 * @required({query: ['username','age'],params: 'id'}) 
 */
export function required(args: any) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    return requireDescriptor(target, name, descriptor, args)
  };
}

/**
 * 添加静态属性
 * @prefix('/user')
 */
export function prefix(prefix: string) {
  return (target: any) => {
    target.prototype[symbolRoutePrefix] = prefix
  };
}

/**
 * 路由
 * @router({
 *   method: 'get',
 *   path: '/login/:id'
 * })
 */
export function router(config: RouteConfig) {
  return (target: any, name: string) => {
    Route.__DecoratedRouters.set({
      target,
      path: config.path,
      method: config.method,
      unless: config.unless,
    }, target[name]);
  }
}

/**
 * 修饰方法
 * @params 
 * @convert(async function(ctx, next){await next()})
 */
export function convert(middleware: Function) {
  return decorate((target: any, name: string, descriptor: PropertyDescriptor, middleware: Function) => {
    target[name] = sureIsArray(target[name]);
    target[name].splice(target[name].length - 1, 0, middleware);
    return descriptor;
  }, sureIsArray(middleware));
}

/**
 * 日志 修饰api方法
 * use: @log
 * @export
 * @param {*} target
 * @param {string} name
 * @param {PropertyDescriptor} value
 * @returns
 */
export function log(target: any, name: string, value: PropertyDescriptor) {
  async function Logger(ctx: Koa.Context, next: any) {
    // 请求数加1
    const currentRequestID = requestID++;

    const startTime = process.hrtime();
    
    if ((ctx.method).toLowerCase() === 'post') {
      console.log(`${chalk.green('→')} (ID: ${currentRequestID}) ${chalk.blue(`${ctx.method}`)} ${JSON.stringify(ctx.request.body)}`);
    } else {
      console.log(`${chalk.green('→')} (ID: ${currentRequestID}) ${chalk.blue(`${ctx.method}`)} ${ctx.url}`);
    }

    await next();

    const endTime = process.hrtime();
    const timespan = (endTime[0] - startTime[0]) * 1000 + (endTime[1] - startTime[1]) / 1000000;
    console.log(`${chalk.green('←')} (ID: ${currentRequestID}) ${chalk.blue(`${ctx.method}`)} ${ctx.url}, Status: ${ctx.status} Time: ${timespan.toFixed(0)} ms`);
  }

  target[name] = sureIsArray(target[name]);
  target[name].splice(target[name].length - 1, 0, Logger);

  return value;
}
