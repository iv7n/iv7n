import { AxiosResponse } from 'axios'

export function responseOnFulfilled(response: AxiosResponse<any>) {
  // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
  // 否则的话抛出错误
  if (response.status === 200) {
    // 正常数据返回
    if (response.data.errno === 0) {
      return response.data.data
    }
  }
  return Promise.reject(response)
}

export function responseOnRejected(error: any) {
  console.error(error)
  return Promise.reject(error)
}
