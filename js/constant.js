/**
 * 曜日パラメーター
 * @type {[{name: string, value: number}]}
 */
const dayOfWeekParams = [
    {value: 0, name: '日'},
    {value: 1, name: '月'},
    {value: 2, name: '火'},
    {value: 3, name: '水'},
    {value: 4, name: '木'},
    {value: 5, name: '金'},
    {value: 6, name: '土'}
]

/**
 * 祝日のWEB API URL
 * @type {string}
 */
const getHolidayUrl = 'https://holidays-jp.github.io/api/v1'