import Router from 'koa-router';
import send from 'koa-send';
import {
  performanceInfoServer,
  getClientIp,
} from '../tools';
import dbBase from '../mongodb/model';

const app = new Router({
  prefix: '/deploy',
});

app.post('/getPerformanceInfo', async (ctx, next) => {
  await performanceInfoServer(ctx, next);
});

app.get('/download', async (ctx) => {
  const {
    path,
  } = ctx.request.query;
  ctx.attachment(path);
  await send(ctx, path, {
    root: '/',
  });
});

const apis = Object.keys(dbBase);
apis.map((apiName) => {
  app.post(`/${apiName}`, async (ctx, next) => {
    await dbBase[apiName](ctx, next);
  });
});

module.exports = app;
