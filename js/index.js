(async () => {
    // DOM 取得
    /**
     * @type {HTMLInputElement}
     */
    const period = document.getElementById('period')
    const ticketPrice = document.getElementById('ticket-price')
    const regularPrice = document.getElementById('regular-price')
    const startDate = document.getElementById('start-date')
    const endDate = document.getElementById('end-date')
    const priceCalc = document.getElementById('price-calc')

    /**
     * @type {(HTMLInputElement)[]}
     */
    const inputList = [period, ticketPrice, regularPrice, startDate, endDate]

    /**
     * @type {HTMLElement}
     */
    const resultArea = document.getElementById('result-area')
    const result = document.getElementById('result')
    const dayOfWeekArea = document.getElementById('day-of-week-checkbox-area')

    // トリガー定義
    priceCalc.addEventListener('click', () => {
        resultArea.removeAttribute('class')
        startToEndPeriodCalc(startDate, endDate, result, ticketPrice.value, regularPrice.value)
    })

    period.addEventListener('change', () => {
        startValueFromEndValue(startDate, endDate, period.value)
    })

    startDate.addEventListener('change', () => {
        startValueFromEndValue(startDate, endDate, period.value)
    })

    for (const item of inputList) {
        item.addEventListener('change', () => {
            saveLocalStorageFromInputList(inputList)
        })
    }

    // メイン処理
    // 開始・終了 Input要素 日付処理
    const startDay = moment().add('months', 1).startOf('month')
    await flatpickrInit({id: startDate.getAttribute('id'), defaultDate: startDay.toDate()})
    endDate.value = formatDate(monthLater(period.value, startDay).toDate())

    // 曜日Checkbox List 作成
    addItemDayOfWeekInput(dayOfWeekArea)

    // Local Storageから各Input要素の値を呼び出し
    getLocalStorageToInputList(inputList)
})()
