import { createLogger, format, transports } from 'winston'
import 'winston-daily-rotate-file'
import safeStringify from 'fast-safe-stringify'
// import the built-in formatting methods
const {
  combine, metadata, timestamp, printf, colorize, padLevels,
} = format
const loggerDebug = createLogger({
  level: 'debug',
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    metadata({ key: 'content', fillExcept: ['timestamp', 'level', 'message'] }),
    padLevels(),
    printf((info) => {
      let output = `${info.timestamp} ${info.level}: ${info.message}`
      if (Object.keys(info.content).length !== 0) {
        output += ` ${safeStringify(info.content)}`
      }
      return output
    }),
  ),
  transports: [
    new transports.Console(),
  ],
})
const loggerInfo = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    metadata({ key: 'content', fillExcept: ['timestamp', 'level', 'message'] }),
    printf((info) => `${info.timestamp}  ${info.message}: ${safeStringify(info.content)}\n`),
  ),
  transports: [
    new transports.DailyRotateFile({
      level: 'info',
      filename: 'logs/info/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      // zippedArchive: true,
      // maxSize: '2m',
      maxFiles: '30d',
    }),
  ],
})
const loggerError = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    metadata({ key: 'content', fillExcept: ['timestamp', 'level', 'message'] }),
    printf((info) => `${info.timestamp}  ${info.message}: ${safeStringify(info.content)}\n`),
  ),
  transports: [
    new transports.DailyRotateFile({
      level: 'error',
      filename: 'logs/error/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      // zippedArchive: true,
      // maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
})
const loggerTrack = createLogger({
  level: 'info',
  format: combine(
    // timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    metadata({ key: 'content', fillExcept: ['level', 'message'] }),
    printf((info) => `${info.content.time}  ${info.content.userId}  ${info.content.event}  ${info.content.property}  `),
  ),
  transports: [
    new transports.DailyRotateFile({
      level: 'info',
      filename: 'logs/track/track-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      // zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
})
const loggerPerf = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    metadata({ key: 'content', fillExcept: ['timestamp', 'level', 'message'] }),
    printf((info) => `${info.timestamp} ${info.content.type} ${info.content.url}\n user:${safeStringify(info.content.user)}\n performance:${safeStringify(info.content.performance)}\n resources:${safeStringify(info.content.resources)}`),
  ),
  transports: [
    new transports.DailyRotateFile({
      level: 'info',
      filename: 'logs/perf/perf-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      // zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
})
module.exports = {
  loggerDebug,
  loggerInfo,
  loggerError,
  loggerPerf,
  loggerTrack,
}
