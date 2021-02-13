import { StorageToken } from '@iv7n/utils'
import { AxiosRequestConfig } from 'axios'

/**
 * 请求成功拦截器
 * @param  config
 * @param storageInstance
 * @returns axios request config
 */
export function requestOnFulfilled(
  config: AxiosRequestConfig,
  storageInstance?: StorageToken
) {
  // add token to header
  if (storageInstance) {
    const token = storageInstance.getStorageToken()
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  }

  return config
}

/**
 * 请求失败拦截器
 * @param error
 */
export function requestOnRejected(error: any) {
  return Promise.reject(error)
}
