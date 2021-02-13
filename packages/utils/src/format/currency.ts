/**
 * 货币过滤器
 * @param {string | number} value 金额
 * @param {boolean} showSymbol 是否显示$符号 默认显示
 */
export function formatCurrency(
	value: string | number = 0.0,
	showSymbol = true,
) {
	value = value + ''
	const index = value.indexOf('-')
	const prefix = showSymbol ? '$' : ''
	if (index === -1) {
		return prefix + parseFloat(value).toFixed(2)
	} else {
		return '-' + prefix + parseFloat(value.split('-')[1]).toFixed(2)
	}
}
