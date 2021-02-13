import { StorageToken } from '@iv7n/utils'
import { AxiosRequestConfig } from 'axios'

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
      };
    }
  }

  return config
}

export function requestOnRejected(error: any) {
  return Promise.reject(error)
}
