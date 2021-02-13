import { StorageToken } from '@iv7n/utils'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  requestOnFulfilled,
  requestOnRejected,
  responseOnFulfilled,
  responseOnRejected,
} from './interceptors'

export interface Interceptors<T = any> {
  requestOnFulfilled(
    config: AxiosRequestConfig,
    storageInstance?: StorageToken
  ): AxiosRequestConfig
  requestOnRejected(error: any): any
  responseOnFulfilled(config: AxiosResponse<T>): AxiosResponse<T>
  responseOnRejected(error: any): any
}

const defaultInterceptors = {
  requestOnFulfilled,
  requestOnRejected,
  responseOnFulfilled,
  responseOnRejected,
}

/**
 * 创建请求实例
 * @param baseURL - axios baseURL
 * @param storageInstance - StorageToken instance
 * @param interceptors - axios interceptors
 * @returns the instance of axios
 */
export function createRequest(
  baseURL: string,
  storageInstance?: StorageToken,
  interceptors?: Partial<Interceptors>
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  })

  const _interceptors: Interceptors = interceptors
    ? { ...defaultInterceptors, ...interceptors }
    : { ...defaultInterceptors }

  // 请求拦截器
  instance.interceptors.request.use(
    config => _interceptors.requestOnFulfilled(config, storageInstance),
    _interceptors.requestOnRejected
  )

  // 响应拦截器
  instance.interceptors.response.use(
    _interceptors.responseOnFulfilled,
    _interceptors.responseOnRejected
  )

  return instance
}
