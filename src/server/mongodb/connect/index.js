import mongoose from 'mongoose'
import {
  config,
} from '../../tools'

const db = {
  dbConf: {},
  dbAddress() {
    const {
      dburl,
      dbname,
      username,
      password,
    } = JSON.parse(config).mongo.main
    db.dbConf = {
      url: `mongodb://${dburl}${dbname}`,
      user: username,
      pass: password,
    }
  },
  connect() {
    db.dbAddress()
    // console.log('dbConf', db.dbConf);
    const conn = () => {
      mongoose.connect(db.dbConf.url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        user: db.dbConf.user,
        pass: db.dbConf.pass,
      })
    }
    conn()
    mongoose.connection.once('open', (err) => {
      if (err) {
        console.log('open err', err)
        throw err
      }
      console.log('mongodb 建立连接 成功')
    })
    mongoose.connection.on('disconnected', (err) => {
      if (err) {
        console.log('disconnected err', err)
        throw err
      }
      conn()
    })
    mongoose.connection.on('error', (err) => {
      if (err) {
        console.log('error err', err)
        throw err
      }
      conn()
    })
  },
  disconnect() {
    mongoose.disconnect()
    console.log('mongodb 断开连接')
  },
}
module.exports = db
