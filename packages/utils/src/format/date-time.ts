import dayjs, { ConfigType } from 'dayjs'

/**
 * 格式化时间为 YYYY/MM/DD
 * @param dateTime
 * @param pattern
 */
export function formatDate2YYYYMMDD(
  dateTime: ConfigType,
  pattern = 'YYYY/MM/DD'
) {
  return dayjs(dateTime, pattern)
}

/**
 * 格式化时间为 MM/DD
 * @param dateTime
 * @param pattern
 */
export function formatDate2MMDD(dateTime: ConfigType, pattern = 'MM/DD') {
  return dayjs(dateTime, pattern)
}

/**
 * 格式化时间为 HH:mm:ss
 * @param dateTime
 * @param pattern
 */
export function formatDate2HHmmss(dateTime: ConfigType, pattern = 'HH:mm:ss') {
  return dayjs(dateTime, pattern)
}

/**
 * 格式化时间为 YYYY/MM/DD HH:mm:ss
 * @param dateTime
 * @param pattern
 */
export function formatDate2DDMMYYYYHHMMss(
  dateTime: string | number,
  pattern = 'YYYY/MM/DD HH:mm:ss'
) {
  return dayjs(dateTime, pattern)
}
