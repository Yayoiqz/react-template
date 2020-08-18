import {
  Schema,
} from 'mongoose';

const options = {
  timestamps: true,
};

// 业务模板
const BusinessTemplateSchema = new Schema({
  id: Number,
  templateName: {
    type: String,
    unique: true,
    required: [true, 'templateName is required!'],
  },
  gitRepo: {
    type: String,
    required: [true, 'gitRepo is required!'],
  },
  gitBranch: {
    type: String,
    required: [true, 'gitBranch is required!'],
  },
  gitTag: {
    type: String,
  },
  description: {
    type: String,
    required: [true, 'description is required!'],
  },
}, options);
// 组件、事件、页面模板
const ComponentEventPageTemplateSchema = new Schema({
  businessTemplateId: {
    type: Number,
    required: [true, 'businessTemplateId is required!'],
  },
  templateType: {
    type: String,
    enum: ['component', 'event', 'page'],
    required: [true, 'templateType is required!'],
  },
  templateName: {
    type: String,
    // unique: true,
    required: [true, 'templateName is required!'],
  },
  templateId: {
    type: String,
    // unique: true,
    required: [true, 'templateId is required!'],
  },
  description: {
    type: String,
    required: [true, 'description is required!'],
  },
}, options);
// 组件、事件、页面配置
const ComponentEventPageConfigSchema = new Schema({
  componentEventPageTemplateId: {
    type: String,
    required: [true, 'componentEventPageTemplateId is required!'],
  },
  componentEventPageConfigType: {
    type: String,
    enum: ['component', 'event', 'page'],
    required: [true, 'componentEventPageConfigType is required!'],
  },
  configName: {
    type: String,
    // unique: true,
    required: [true, 'configName is required!'],
  },
  configKey: {
    type: String,
    // unique: true,
    required: [true, 'configKey is required!'],
  },
  configType: {
    type: String,
    enum: ['number', 'string', 'bool', 'component', 'event', 'page', 'list', 'enum'],
    required: [true, 'configType is required!'],
  },
  specification: {
    type: String,
    required: [true, 'specification is required!'],
  },
  specificTemplateId: {
    type: Array,
  },
  itemType: {
    type: String,
    enum: ['number', 'string', 'bool', 'component', 'event', 'page'],
  },
  enumValue: String,
}, options);
// 业务配置
const BusinessConfigSchema = new Schema({
  businessTemplateId: {
    type: Number,
    required: [true, 'businessTemplateId is required!'],
  },
  configName: {
    type: String,
    // unique: true,
    required: [true, 'configName is required!'],
  },
  configKey: {
    type: String,
    // unique: true,
    required: [true, 'configKey is required!'],
  },
  configType: {
    type: String,
    enum: ['number', 'string', 'bool', 'component', 'event', 'page', 'list', 'enum'],
    required: [true, 'configType is required!'],
  },
  specification: {
    type: String,
    required: [true, 'specification is required!'],
  },
  specificTemplateId: {
    type: Array,
  },
  itemType: {
    type: String,
    enum: ['number', 'string', 'bool', 'component', 'event', 'page'],
  },
  enumValue: String,
}, options);
// 业务流程
const BusinessProcessSchema = new Schema({
  id: Number,
  processName: {
    type: String,
    unique: true,
    required: [true, 'processName is required!'],
  },
  businessTemplateId: {
    type: Number,
    required: [true, 'businessTemplateId is required!'],
  },
  businessTemplateName: {
    type: String,
    required: [true, 'businessTemplateName is required!'],
  },
  description: {
    type: String,
    required: [true, 'description is required!'],
  },
}, options);
// 属性值列表
const propertyListSchema = new Schema({
  type: {
    type: String,
    enum: ['number', 'string', 'bool', 'component', 'event', 'page', 'list', 'enum'],
    required: [true, 'type is required!'],
  },
  key: {
    type: String,
    // required: [true, 'key is required!']
  },
  value: {
    type: Schema.Types.Mixed,
    required: [true, 'value is required!'],
  },
}, options);
// 组件、事件、页面（实例）库
const ComponentEventPageInstanceSchema = new Schema({
  instanceType: {
    type: String,
    enum: ['component', 'event', 'page'],
    required: [true, 'instanceType is required!'],
  },
  instanceName: {
    type: String,
    // unique: true,
    required: [true, 'instanceName is required!'],
  },
  businessProcessId: {
    type: Number,
    required: [true, 'businessProcessId is required!'],
  },
  businessProcessName: {
    type: String,
    required: [true, 'businessProcessName is required!'],
  },
  componentEventPageTemplateId: {
    type: String,
    required: [true, 'componentEventPageTemplateId is required!'],
  },
  componentEventPageTemplateName: {
    type: String,
    required: [true, 'componentEventPageTemplateName is required!'],
  },
  description: {
    type: String,
    required: [true, 'description is required!'],
  },
  componentEventPageConfigList: [propertyListSchema],
}, options);
// 业务属性
const BusinessPropertySchema = new Schema({
  businessProcessId: {
    type: Number,
    required: [true, 'businessProcessId is required!'],
  },
  propertyList: [propertyListSchema],
}, options);
// 构建日志
const BuildLogSchema = new Schema({
  businessProcessId: {
    type: Number,
    required: [true, 'businessProcessId is required!'],
  },
  businessProcessName: {
    type: String,
    required: [true, 'businessProcessName is required!'],
  },
  operator: {
    type: String,
    required: [true, 'operator is required!'],
    default: 'admin',
  },
  status: {
    type: String,
    required: [true, 'status is required!'],
    enum: ['processing', 'fail', 'success'],
    default: 'processing',
  },
  // buildStartTime --> createdAt
  logs: {
    type: Array,
    required: [true, 'logs is required!'],
    default: [],
  },
  inputConfig: {
    type: Object,
  },
}, options);

module.exports = {
  BusinessTemplateSchema,
  ComponentEventPageTemplateSchema,
  ComponentEventPageConfigSchema,
  BusinessConfigSchema,
  BusinessProcessSchema,
  ComponentEventPageInstanceSchema,
  BusinessPropertySchema,
  BuildLogSchema,
};
