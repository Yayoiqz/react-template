import crypto from 'crypto';
import Axios from 'axios';
import path from 'path';
import fs from 'fs';
import {
  loggerInfo,
  loggerError,
  loggerPerf,
} from '../log';

const Tools = {
  getClientIp(req) {
    let ip = req.headers['x-forwarded-for']
      || req.headers['Proxy-Client-IP']
      || req.headers['WL-Proxy-Client-IP']
      || req.connection.remoteAddress
      || req.socket.remoteAddress
      || req.connection.socket.remoteAddress;
    const index = ip.lastIndexOf(':');
    if (index > -1) {
      ip = ip.slice(index + 1);
    }
    console.log('getClientIp', ip);
    return ip;
  },
  config: {},
  readConfig() {
    let configFile;
    let config;
    if (process.env.CONFIG_FILE) {
      // 线上
      configFile = process.env.CONFIG_FILE;
    } else if (process.env.CD_TYPE === 'manual') {
      // 测试手动部署
      configFile = path.resolve(__dirname, '../../conf.json');
    } else {
      // 开发
      configFile = path.resolve(__dirname, '../../../conf.json');
    }
    try {
      config = fs.readFileSync(configFile, 'utf8');
      console.log('config : ', config);
      Tools.config = config;
    } catch (err) {
      config = {
        server: {
          main: 'http://XXX',
        },
        mongo: {
          main: {
            dburl: 'XXX/',
            dbname: 'admin',
            username: 'admin',
            password: 'admin',
          },
        },
      };
      console.log('readConfig Error: ', err);
    }
  },
  setOption(option) {
    // baseurl配置
    const c = JSON.parse(Tools.config);
    option.server = c.server.main;
    const config = {
      headers: {
        ...option.headers,
      },
      baseURL: option.server,
      url: option.url ? option.url : '',
      method: option.method || 'POST',
    };
    config.params = option.params || '';
    config.data = option.body || '';
    return config;
  },
  // call api server 转发到Java
  callServer(ctx, next, option) {
    const startTime = Date.now();
    const traceId = option.headers.traceid;
    loggerInfo.info(`request traceId: ${traceId}`, option);
    return Axios(option).then((res) => {
      let json;
      console.log('------------------------------------');
      console.log('time:', (new Date()).toLocaleString());
      console.log('req: ', option);
      console.log('res data: ', res.data);
      try {
        json = res.data;
        // if (res.headers['set-cookie']) {
        //   for (const ele of res.headers['set-cookie']) {
        //     // kv0--cookiename:cookievalue
        //     const kv0 = ele.split(';')[0].split('=');
        //     if (kv0[0] === 'token') {
        //       ctx.cookies.set('token', kv0[1]);
        //       break;
        //     }
        //   }
        // }
      } catch (e) {
        loggerError.error(`parse/decry error  traceId: ${traceId}`, {
          errorDescription: e.message,
        });
        console.log('parse/decry error:', e.message);
        json = {
          success: false,
          error: 'parse/decry error',
        };
      }
      const endTime = Date.now();
      const duration = endTime - startTime;
      loggerInfo.info(`response traceId: ${traceId}`, {
        url: option.url,
        status: res.status,
        data: json,
        duration,
        responseHeaders: res.headers,
      });
      ctx.body = json;
      next();
    }).catch((err) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      loggerError.error(`error traceId: ${traceId}`, {
        errorDescription: err.message,
        duration,
      });
      ctx.body = err;
      ctx.status = 500;
      next();
    });
  },
  // 截止于node
  nodeServer(ctx, next, option) {
    const traceId = option.headers.traceid;
    loggerInfo.info(`request traceId: ${traceId}`, option);
    return Axios(option)
      .then((res) => {
        ctx.response.status = 200;
        const json = {
          a: 1,
          b: 2,
        };
        loggerInfo.info(`response traceId: ${traceId}`, {
          status: res.status,
          data: json,
          responseHeaders: res.headers,
        });
        ctx.body = json;
        next(json);
      }).catch((error) => {
        loggerError.error(`error traceId: ${traceId}`, {
          errorDescription: error.message,
        });
        ctx.body = error;
        next(error);
      });
  },
  nodeLogServer(ctx, next, option) {
    const traceId = option.headers.traceid;
    delete option.deviceType;
    loggerInfo.info(`nodeLog traceId: ${traceId}`, option);
    return new Promise(((resolve) => {
      ctx.body = {};
      ctx.status = 200;
      resolve();
    }));
  },
  performanceInfoServer(ctx, next) {
    const ip = Tools.getClientIp(ctx.req);
    ctx.request.body.user.ip = ip;
    loggerPerf.info('performance:', ctx.request.body);
    ctx.body = {
      res: 'success',
    };
    next();
  },
  nodeResponse() {},
  // AES encryption
  encryption(content) { // 加密
    const iv = '';
    const clearEncoding = 'utf8';
    const cipherEncoding = 'base64';
    const key = 'xxx';
    const algorithm = 'aes-128-ecb';
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const cipherChunks = [];
    cipherChunks.push(cipher.update(JSON.stringify(content), clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    const datas = cipherChunks.join('');
    return datas;
  },
  // AES decryption
  decryption(body) { // 解密
    const iv = '';
    const clearEncoding = 'utf8';
    const cipherEncoding = 'base64';
    const key = 'xxx';
    const cipherChunks = [];
    const decipher = crypto.createDecipheriv('aes-128-ecb', key, iv);
    cipherChunks.push(decipher.update(body, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));
    const decryption = cipherChunks.join('');
    return decryption;
  },
};
// Tools.readConfig();
module.exports = Tools;
