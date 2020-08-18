import Koa from 'koa';
import serve from 'koa-static';
import koaBody from 'koa-body';
import path from 'path';
import history from 'koa2-connect-history-api-fallback';
import nodeRoutes from './routes';
import db from './mongodb/connect';
import {
  readConfig,
} from './tools';

readConfig();
const app = new Koa();
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  if (ctx.request.headers.accept && ctx.request.headers.accept.indexOf('html') !== -1) {
    console.log('html time', new Date().toLocaleString());
    console.log('html ms', ms);
    console.log('html prod-------------request', ctx.request);
    // console.log('prod-------------headers', ctx.request.headers)
    // console.log('prod-------------url', ctx.request.url)
  }
});
app.use(koaBody({
  multipart: true,
  formidable: {
    keepExtensions: true,
  },
}));

db.connect();
app.on('close', (err) => {
  console.error(err);
  db.disconnect();
});
app.use(serve(path.join(__dirname, '../dist')));
app.use(nodeRoutes.routes());
app.use(nodeRoutes.allowedMethods());

app.listen(process.env.PORT, () => {
  console.info('listen on port:', process.env.PORT);
});
module.exports = app;
