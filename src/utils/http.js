import axios from 'axios';
import { message as Message } from 'antd';

const instance = axios.create({
  // 超时时间
  timeout: 3000,
  // 响应前处理
  transformResponse: (responseData) => {
    const { success, message } = JSON.parse(responseData);
    if (!success) Message.error(message);
    return responseData;
  },
});
// 响应拦截
instance.interceptors.response.use((response) => {
  const { status, data, statusText } = response;
  if (status === 200) {
    return JSON.parse(response.data);
  } if (status === 401) {
    // 跳转登录
  } else {
    Message.error(`${status}-${statusText}`);
    return response;
  }
}, (error) =>
  // 对响应错误做点什么
  Promise.reject(error));
export default {
  get: (url, params, option) => instance.get(url, { params, ...option }),
  post: (url, params, option) => instance.post(url, params, option),
  delete: (url, params, option) => instance.delete(url, { params, ...option }),
};
