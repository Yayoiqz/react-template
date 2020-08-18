import mongoose from 'mongoose'
import schemas from '../schema'

Object.keys(schemas).map((key) => {
  schemas[key].pre('findOneAndUpdate', function () {
    const update = this.getUpdate()
    if (update.__v !== null) {
      delete update.__v
    }
    const keys = ['$set', '$setOnInsert']
    for (const key of keys) {
      if (update[key] !== null && update[key].__v !== null) {
        delete update[key].__v
        if (Object.keys(update[key]).length === 0) {
          delete update[key]
        }
      }
    }
    update.$inc = update.$inc || {}
    update.$inc.__v = 1
  })
})

const BusinessTemplate = mongoose.model('BusinessTemplate', schemas.BusinessTemplateSchema)
const ComponentEventPageTemplate = mongoose.model('ComponentEventPageTemplate', schemas.ComponentEventPageTemplateSchema)
const ComponentEventPageConfig = mongoose.model('ComponentEventPageConfig', schemas.ComponentEventPageConfigSchema)
const BusinessConfig = mongoose.model('BusinessConfig', schemas.BusinessConfigSchema)
const BusinessProcess = mongoose.model('BusinessProcess', schemas.BusinessProcessSchema)
const ComponentEventPageInstance = mongoose.model('ComponentEventPageInstance', schemas.ComponentEventPageInstanceSchema)
const BusinessProperty = mongoose.model('BusinessProperty', schemas.BusinessPropertySchema)
const BuildLog = mongoose.model('BuildLog', schemas.BuildLogSchema)

const succFun = (ctx, docs, resolve) => {
  docs = docs || []
  ctx.body = {
    code: 200,
    data: docs,
    msg: 'ok',
  }
  resolve()
}
const errFun = (ctx, error, resolve) => {
  error = error || {
    message: 'internal error',
  }
  if (error.code === 11000) {
    const matched = error.message.match(/ (\w*) dup key/)
    const name = matched && matched[1].split('_')[0]
    if (name) {
      error.message = `${name}已存在！`
    }
  }
  console.log(error)
  ctx.body = {
    code: 500,
    data: null,
    msg: error.message,
  }
  ctx.status = 500
  resolve()
}

const findHelper = async (ctx, model) => {
  const skip = (+ctx.request.body.page - 1) * +ctx.request.body.pageSize
  const limit = +ctx.request.body.pageSize
  delete ctx.request.body.page
  delete ctx.request.body.pageSize

  return new Promise((resolve) => {
    model.countDocuments(ctx.request.body, (err, count) => {
      if (err) {
        errFun(ctx, err, resolve)
      } else {
        const query = model.find(ctx.request.body, '', {
          skip,
          limit,
        }).sort({
          updatedAt: -1,
        })
        query.exec((error, docs) => {
          if (error) {
            errFun(ctx, error, resolve)
          } else {
            docs = {
              total: count,
              docs,
            }
            succFun(ctx, docs, resolve)
          }
        })
      }
    })
  })
}
const updateHelper = async (ctx, model) => new Promise((resolve) => {
  model.findByIdAndUpdate(ctx.request.body._id, {
    $set: ctx.request.body,
  }, {
    new: true,
  }, (error, docs) => {
    error = error || {
      message: '不存在的doc!',
    }
    if (docs) {
      succFun(ctx, docs, resolve)
    } else {
      errFun(ctx, error, resolve)
    }
  })
})
const delHelper = async (ctx, model) => new Promise((resolve) => {
  model.findOneAndDelete({
    _id: ctx.request.body._id,
  }, (error, docs) => {
    error = error || {
      message: '不存在的doc!',
    }
    if (docs) {
      succFun(ctx, docs, resolve)
    } else {
      errFun(ctx, error, resolve)
    }
  })
})
const createHelper = async (ctx, model) => new Promise((resolve) => model.insertMany([{
  ...ctx.request.body,
}]).then((docs) => {
  succFun(ctx, docs, resolve)
}).catch((error) => {
  errFun(ctx, error, resolve)
}))
const autoIdCreateHelper = async (ctx, model) => new Promise((resolve) => {
  model.findOne({}, 'id', (err, countDocs) => {
    let count = 1
    if (err || !countDocs) {
      console.log('count err', err)
    } else {
      count = +countDocs.id + 1
    }
    return model.insertMany([{
      ...ctx.request.body,
      id: count,
    }]).then((docs) => {
      succFun(ctx, docs, resolve)
    }).catch((error) => {
      errFun(ctx, error, resolve)
    })
  }).sort({
    id: -1,
  })
})
const validateComponentEventPageTemplate = async (ctx, sucDeal) => {
  const getSameTemplateNameItem = async () => new Promise((resolve) => {
    ComponentEventPageTemplate.find({
      businessTemplateId: ctx.request.body.businessTemplateId,
      templateType: ctx.request.body.templateType,
      templateName: ctx.request.body.templateName,
    }).exec((err, docs) => {
      resolve(docs[0])
    })
  })
  const sameTemplateNameItem = await getSameTemplateNameItem()
  const getSameTemplateIdItem = async () => new Promise((resolve) => {
    ComponentEventPageTemplate.find({
      businessTemplateId: ctx.request.body.businessTemplateId,
      templateType: ctx.request.body.templateType,
      templateId: ctx.request.body.templateId,
    }).exec((err, docs) => {
      resolve(docs[0])
    })
  })
  const sameTemplateIdItem = await getSameTemplateIdItem()
  const findSelf = async () => new Promise((resolve) => {
    ComponentEventPageTemplate.find({
      _id: ctx.request.body._id,
    }).exec((err, docs) => {
      resolve(docs[0] || {})
    })
  })
  const self = await findSelf()
  if (sameTemplateNameItem && sameTemplateNameItem.templateName !== self.templateName) {
    return new Promise((resolve) => {
      const error = {
        message: '模板名称重复!',
      }
      errFun(ctx, error, resolve)
    })
  } if (sameTemplateIdItem && sameTemplateIdItem.templateId !== self.templateId) {
    return new Promise((resolve) => {
      const error = {
        message: '模板ID重复!',
      }
      errFun(ctx, error, resolve)
    })
  }
  await sucDeal(ctx, ComponentEventPageTemplate)
}
const validateComponentEventPageConfig = async (ctx, sucDeal) => {
  const getSameConfigNameItem = async () => new Promise((resolve) => {
    ComponentEventPageConfig.find({
      componentEventPageTemplateId: ctx.request.body.componentEventPageTemplateId,
      componentEventPageConfigType: ctx.request.body.componentEventPageConfigType,
      configName: ctx.request.body.configName,
    }).exec((err, docs) => {
      resolve(docs[0])
    })
  })
  const sameConfigNameItem = await getSameConfigNameItem()
  const getSameConfigKeyItem = async () => new Promise((resolve) => {
    ComponentEventPageConfig.find({
      componentEventPageTemplateId: ctx.request.body.componentEventPageTemplateId,
      componentEventPageConfigType: ctx.request.body.componentEventPageConfigType,
      configKey: ctx.request.body.configKey,
    }).exec((err, docs) => {
      resolve(docs[0])
    })
  })
  const sameConfigKeyItem = await getSameConfigKeyItem()
  const findSelf = async () => new Promise((resolve) => {
    ComponentEventPageConfig.find({
      _id: ctx.request.body._id,
    }).exec((err, docs) => {
      resolve(docs[0] || {})
    })
  })
  const self = await findSelf()
  if (sameConfigNameItem && sameConfigNameItem.configName !== self.configName) {
    return new Promise((resolve) => {
      const error = {
        message: '配置名称重复!',
      }
      errFun(ctx, error, resolve)
    })
  } if (sameConfigKeyItem && sameConfigKeyItem.configKey !== self.configKey) {
    return new Promise((resolve) => {
      const error = {
        message: '配置key重复!',
      }
      errFun(ctx, error, resolve)
    })
  }
  await sucDeal(ctx, ComponentEventPageConfig)
}
const validateBusinessConfig = async (ctx, sucDeal) => {
  const getSameConfigNameItem = async () => new Promise((resolve) => {
    BusinessConfig.find({
      businessTemplateId: ctx.request.body.businessTemplateId,
      configName: ctx.request.body.configName,
    }).exec((err, docs) => {
      resolve(docs[0])
    })
  })
  const sameConfigNameItem = await getSameConfigNameItem()
  const getSameConfigKeyItem = async () => new Promise((resolve) => {
    BusinessConfig.find({
      businessTemplateId: ctx.request.body.businessTemplateId,
      configKey: ctx.request.body.configKey,
    }).exec((err, docs) => {
      resolve(docs[0])
    })
  })
  const sameConfigKeyItem = await getSameConfigKeyItem()
  const findSelf = async () => new Promise((resolve) => {
    BusinessConfig.find({
      _id: ctx.request.body._id,
    }).exec((err, docs) => {
      resolve(docs[0] || {})
    })
  })
  const self = await findSelf()
  if (sameConfigNameItem && sameConfigNameItem.configName !== self.configName) {
    return new Promise((resolve) => {
      const error = {
        message: '配置名称重复!',
      }
      errFun(ctx, error, resolve)
    })
  } if (sameConfigKeyItem && sameConfigKeyItem.configKey !== self.configKey) {
    return new Promise((resolve) => {
      const error = {
        message: '配置key重复!',
      }
      errFun(ctx, error, resolve)
    })
  }
  await sucDeal(ctx, BusinessConfig)
}
const validateComponentEventPageInstance = async (ctx, sucDeal) => {
  const getSameInstanceNameItem = async () => new Promise((resolve) => {
    ComponentEventPageInstance.find({
      instanceType: ctx.request.body.instanceType,
      businessProcessId: ctx.request.body.businessProcessId,
      instanceName: ctx.request.body.instanceName,
    }).exec((err, docs) => {
      resolve(docs[0])
    })
  })
  const sameInstanceNameItem = await getSameInstanceNameItem()
  const findSelf = async () => new Promise((resolve) => {
    ComponentEventPageInstance.find({
      _id: ctx.request.body._id,
    }).exec((err, docs) => {
      resolve(docs[0] || {})
    })
  })
  const self = await findSelf()
  if (sameInstanceNameItem && sameInstanceNameItem.instanceName !== self.instanceName) {
    return new Promise((resolve) => {
      const error = {
        message: '实例名称重复!',
      }
      errFun(ctx, error, resolve)
    })
  }
  await sucDeal(ctx, ComponentEventPageInstance)
}
const r = {
  // 构建日志
  startBuild: async (ctx) => {
    let COMPILE_CONFIG = {}
    const getProcess = async () => new Promise((resolve) => {
      BusinessProcess.find({
        id: ctx.request.body.businessProcessId,
      }).exec((err, docs) => {
        resolve(docs || [])
      })
    })
    const buildProcess = await getProcess()
    try {
      // 查询业务流程、模板基本信息
      const p = buildProcess[0]
      if (!p) {
        throw new Error('无此流程！')
      }
      const getTemplate = async () => new Promise((resolve) => {
        BusinessTemplate.find({
          id: p.businessTemplateId,
        }).exec((err, docs) => {
          resolve(docs || [])
        })
      })
      const buildTemplate = await getTemplate()
      const t = buildTemplate[0]
      if (!t) {
        throw new Error('无模板！')
      }
      COMPILE_CONFIG = {
        templateId: `${t.id}`,
        templateName: t.templateName,
        instanceId: `${p.id}`,
        instanceName: p.processName,
        gitRepo: t.gitRepo,
        gitBranch: t.gitBranch,
        gitTag: t.gitTag,
      }
      // 查询业务属性
      const getProperties = async () => new Promise((resolve) => {
        BusinessProperty.find({
          businessProcessId: p.id,
        }).exec((err, docs) => {
          resolve(docs || [])
        })
      })
      const businessProps = await getProperties()
      const mapFun = (bp) => {
        let r = {}
        if (bp.value instanceof Array) {
          r = {
            configType: bp.type,
            configKey: bp.key,
            configValue: bp.value.map((v) => ({
              configType: v.type === 'enum' ? 'string' : v.type,
              configKey: v.key,
              configValue: v.value,
            })),
          }
        } else {
          r = {
            configType: bp.type === 'enum' ? 'string' : bp.type,
            configKey: bp.key,
            configValue: bp.value,
          }
        }
        return r
      }
      COMPILE_CONFIG.config = ((businessProps[0] || []).propertyList || []).map(mapFun)
      // 查询该业务流程下所有实例
      const getDependence = async () => new Promise((resolve) => {
        ComponentEventPageInstance.find({
          businessProcessId: p.id,
        }).exec((err, docs) => {
          resolve(docs || [])
        })
      })
      const instances = await getDependence()
      COMPILE_CONFIG.dependence = instances.map((ins) => ({
        instanceId: ins._id.toString(),
        instanceName: ins.instanceName,
        templateId: ins.componentEventPageTemplateId.toString(),
        templateName: ins.componentEventPageTemplateName,
        templateType: ins.instanceType,
        config: ins.componentEventPageConfigList.map(mapFun),
      }))
      const updateLog = (logId, log) => {
        const op = {
          $push: {
            logs: log.newLog,
          },
        }
        if (log.status) {
          op.$set = {
            status: log.status,
          }
        }
        console.log(log.newLog)
        BuildLog.findByIdAndUpdate(logId, op, {}, (error) => {
          if (error) {
            updateLog(logId, {
              newLog: `log update err: ${error}`,
            })
          }
        })
      }
      return new Promise((resolve) => {
        BuildLog.insertMany([{
          ...ctx.request.body,
          inputConfig: COMPILE_CONFIG,
        }]).then((docs) => {
          const logId = docs[0]._id
          const createTime = docs[0].createdAt
          const logcb = (logStr) => updateLog(logId, {
            newLog: logStr,
          })
          const timer = setTimeout(() => {
            updateLog(logId, {
              status: 'fail',
              newLog: '20 mins timeout!',
            })
          }, 1000 * 60 * 20)
          MTComplite(COMPILE_CONFIG, {
            logId,
            createTime,
            workPath: `/opt/h5/business_deploy_platform_h5/logs/workspace_bdph5_${Date.now()}`,
            logCallback: logcb,
          }, (err, data) => {
            clearTimeout(timer)
            if (err) {
              updateLog(logId, {
                status: 'fail',
                newLog: err,
              })
            } else {
              updateLog(logId, {
                status: 'success',
                newLog: data,
              })
            }
          })
          succFun(ctx, docs, resolve)
        })
      })
    } catch (buildErr) {
      return new Promise((resolve) => {
        BuildLog.insertMany([{
          ...ctx.request.body,
          inputConfig: COMPILE_CONFIG,
          logs: [buildErr.toString()],
          status: 'fail',
        }]).then((docs) => {
          console.log(docs)
          errFun(ctx, {
            message: `构建失败: ${buildErr}`,
          }, resolve)
        })
      })
    }
  },
  'BuildLog/findLogList': async (ctx) => {
    await findHelper(ctx, BuildLog)
  },
  // 业务属性
  'BusinessProperty/createProperty': async (ctx) => {
    await createHelper(ctx, BusinessProperty)
  },
  'BusinessProperty/updateProperty': async (ctx) => {
    await updateHelper(ctx, BusinessProperty)
  },
  'BusinessProperty/findPropertyList': async (ctx) => {
    await findHelper(ctx, BusinessProperty)
  },
  // 组件、事件、页面（实例）库
  'ComponentEventPageInstance/createInstance': async (ctx) => {
    await validateComponentEventPageInstance(ctx, createHelper)
  },
  'ComponentEventPageInstance/delInstance': async (ctx) => {
    const getAllInstances = async () => new Promise((resolve) => {
      ComponentEventPageInstance.find({}).exec((err, docs) => {
        resolve(docs || [])
      })
    })
    const allInstances = await getAllInstances()
    const tgtId = ctx.request.body._id
    const hasReference = allInstances.some((ins) => {
      ins.componentEventPageConfigList = ins.componentEventPageConfigList || []
      return ins.componentEventPageConfigList.some((config) => {
        if (config.value instanceof Array) {
          return config.value.some((v) => `${v.value.toString()}` === tgtId)
        }
        return `${config.value.toString()}` === tgtId
      })
    })
    if (hasReference) {
      return new Promise((resolve) => {
        const error = {
          message: '该组件被该业务流程下面的页面/组件/事件引用!',
        }
        errFun(ctx, error, resolve)
      })
    }
    await delHelper(ctx, ComponentEventPageInstance)
  },
  'ComponentEventPageInstance/updateInstance': async (ctx) => {
    await validateComponentEventPageInstance(ctx, updateHelper)
  },
  'ComponentEventPageInstance/findInstanceList': async (ctx) => {
    await findHelper(ctx, ComponentEventPageInstance)
  },
  // 业务流程
  'BusinessProcess/createProcess': async (ctx) => {
    await autoIdCreateHelper(ctx, BusinessProcess)
  },
  'BusinessProcess/delProcess': async (ctx) => {
    await delHelper(ctx, BusinessProcess)
  },
  'BusinessProcess/updateProcess': async (ctx) => {
    await updateHelper(ctx, BusinessProcess)
  },
  'BusinessProcess/findProcessList': async (ctx) => {
    await findHelper(ctx, BusinessProcess)
  },
  // 业务配置
  'BusinessConfig/createConfig': async (ctx) => {
    await validateBusinessConfig(ctx, createHelper)
  },
  'BusinessConfig/delConfig': async (ctx) => {
    await delHelper(ctx, BusinessConfig)
  },
  'BusinessConfig/updateConfig': async (ctx) => {
    await validateBusinessConfig(ctx, updateHelper)
  },
  'BusinessConfig/findConfigList': async (ctx) => {
    await findHelper(ctx, BusinessConfig)
  },
  // 组件、事件、页面配置
  'ComponentEventPageConfig/createConfig': async (ctx) => {
    await validateComponentEventPageConfig(ctx, createHelper)
  },
  'ComponentEventPageConfig/delConfig': async (ctx) => {
    await delHelper(ctx, ComponentEventPageConfig)
  },
  'ComponentEventPageConfig/updateConfig': async (ctx) => {
    await validateComponentEventPageConfig(ctx, updateHelper)
  },
  'ComponentEventPageConfig/findConfigList': async (ctx) => {
    await findHelper(ctx, ComponentEventPageConfig)
  },
  // 组件、事件、页面模板
  'ComponentEventPageTemplate/createTemplate': async (ctx) => {
    await validateComponentEventPageTemplate(ctx, createHelper)
  },
  'ComponentEventPageTemplate/delTemplate': async (ctx) => {
    const hasInstance = await ComponentEventPageInstance.exists({
      componentEventPageTemplateId: ctx.request.body.templateId,
    })
    const hasReference1 = await ComponentEventPageConfig.exists({
      specificTemplateId: ctx.request.body.templateId,
    })
    const hasReference2 = await BusinessConfig.exists({
      specificTemplateId: ctx.request.body.templateId,
    })
    const hasReference = hasReference1 || hasReference2
    if (hasInstance) {
      return new Promise((resolve) => {
        const error = {
          message: '该组件当前存在实例化出来的数据!',
        }
        errFun(ctx, error, resolve)
      })
    } if (hasReference) {
      return new Promise((resolve) => {
        const error = {
          message: '该组件当前被其他组件、事件、页面组件引用!',
        }
        errFun(ctx, error, resolve)
      })
    }
    await delHelper(ctx, ComponentEventPageTemplate)
  },
  'ComponentEventPageTemplate/updateTemplate': async (ctx) => {
    const getOldTemplate = async () => new Promise((resolve) => {
      ComponentEventPageTemplate.find({
        _id: ctx.request.body._id,
      }).exec((err, docs) => {
        resolve(docs || [])
      })
    })
    const oldTemp = await getOldTemplate()
    if (oldTemp[0]) {
      ComponentEventPageInstance.updateMany({
        componentEventPageTemplateId: oldTemp[0].templateId,
      }, {
        $set: {
          componentEventPageTemplateId: ctx.request.body.templateId,
          componentEventPageTemplateName: ctx.request.body.templateName,
        },
      }, () => {})
    }
    await validateComponentEventPageTemplate(ctx, updateHelper)
  },
  'ComponentEventPageTemplate/findTemplateList': async (ctx) => {
    await findHelper(ctx, ComponentEventPageTemplate)
  },
  // 业务模板
  'BusinessTemplate/createTemplate': async (ctx) => {
    await autoIdCreateHelper(ctx, BusinessTemplate)
  },
  'BusinessTemplate/delTemplate': async (ctx) => {
    const hasProcess = await BusinessProcess.exists({
      businessTemplateId: ctx.request.body.id,
    })
    if (hasProcess) {
      return new Promise((resolve) => {
        const error = {
          message: '该业务模板存在被实例化出来的业务流程!',
        }
        errFun(ctx, error, resolve)
      })
    }
    await delHelper(ctx, BusinessTemplate)
  },
  'BusinessTemplate/updateTemplate': async (ctx) => {
    await updateHelper(ctx, BusinessTemplate)
    BusinessProcess.updateMany({
      businessTemplateId: ctx.request.body.templateId,
    }, {
      $set: {
        businessTemplateName: ctx.request.body.templateName,
      },
    }, () => {})
  },
  'BusinessTemplate/findTemplateList': async (ctx) => {
    await findHelper(ctx, BusinessTemplate)
  },
}
module.exports = r
