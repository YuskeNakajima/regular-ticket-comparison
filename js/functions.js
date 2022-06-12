/**
 * @typedef { import('moment').Moment } Moment
 */

/**
 * 祝日一覧をWEB APIから取得する
 * @param {number} year
 * @returns {Promise<{[key: string] : string}>}
 */
const fetchHolidays = (year) => {
    return fetch(`${getHolidayUrl}/${year}/date.json`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then((json) => {
            return json;
        })
        .catch((reason) => {
            console.error(reason);
        });
}

/**
 * 日付をフォーマット YYYY-MM-DD
 * @param {Date} date
 * @returns {string} YYYY-MM-DD
 */
const formatDate = (date) => {
    const year  = date.getFullYear();
    const month = date.getMonth() + 1;
    const mm    = ('00' + month).slice(-2);
    const day   = date.getDate();
    const dd    = ('00' + day).slice(-2);
    return `${year}-${mm}-${dd}`;
}

/**
 * 祝日の場合にクラスをつける
 * @param {Element} day
 * @param { {[key: string] : string} } holidays
 */
const addHolidayClass = (day, holidays) => {
    const date      = day.dateObj;
    const selectDay = formatDate(date);
    if(selectDay in holidays){
        day.classList.add('is-holiday');
    }
}

/**
 * flatpickr 初期化
 * @param param { {id: string, defaultDate: Date} }  params
 * @returns {Promise<void>}
 */
const flatpickrInit = async (param /* {id, defaultDate}*/) => {
    const holidays = await fetchHolidays(param.defaultDate.getFullYear());
    flatpickr(`#${param.id}`, {
        locale      : Japanese,
        dateFormat  : 'Y-m-d',
        defaultDate : param.defaultDate,
        onDayCreate : (dObj, dStr, fp, dayElement) => {
            addHolidayClass(dayElement, holidays);
        }
    });
}

/**
 * 指定Domエレメントにチェックボックス郡を追加
 * @param {Element} appendArea
 */
const addItemDayOfWeekInput = (appendArea) => {
    for (const item of dayOfWeekParams) {
        const div = document.createElement('div')
        div.setAttribute('class', 'l-checkbox-area__item')

        const label = document.createElement('label')
        label.innerText = item.name
        label.setAttribute('for', `day-of-Week-${item.value}`)

        const input = document.createElement('input')
        input.setAttribute('type', 'checkbox')
        input.setAttribute('id', `day-of-Week-${item.value}`)
        input.setAttribute('value', `${item.value}`)
        if ([1, 2, 3, 4, 5].includes(item.value)) input.setAttribute('checked', 'true')

        div.append(label)
        div.append(input)

        appendArea.append(div)
    }
}

/**
 * 〇ヶ月後の moment オブジェクトを返す
 * @param {string} monthPeriod number
 * @param {Moment} startDay
 * @returns {Moment}
 */
const monthLater = (monthPeriod, startDay) => {
    return startDay.clone().add('months', monthPeriod).add('days', -1)
}

/**
 * @param {number} ticketPrice
 * @param {number} ticketDateNum
 * @param {number} regularPrice
 * @param {HTMLElement[]} appendElements
 * @returns {HTMLDivElement}
 */
const createResultItem = (ticketPrice, ticketDateNum, regularPrice, appendElements = []) => {
    const div = document.createElement('div')
    const calcPeriodTicketPrice = ticketPrice * 2 * ticketDateNum
    const diffPrice = regularPrice - calcPeriodTicketPrice

    div.setAttribute('class', 'c-response-area')
    div.innerHTML = `<div>実行時刻: ${moment().format('YYYY年MM月DD日 HH:mm:ss')}</div><br>`

    const regularPriceArea = document.createElement("div")
    regularPriceArea.innerHTML = `定期料金 = ${regularPrice}円`
    if (diffPrice < 0)
        regularPriceArea.innerHTML += ` <span class="u-color-great">切符より${Math.abs(diffPrice)}円お得です</span>`

    const ticketPriceArea = document.createElement("div")
    ticketPriceArea.innerHTML =
        `${ticketPrice * 2}円（往復料金）</span> * ${ticketDateNum}日 = ${calcPeriodTicketPrice}円`
    if (diffPrice > 0)
        ticketPriceArea.innerHTML += ` <span class="u-color-great">定期より${diffPrice}円お得です</span>`

    div.append(regularPriceArea)
    div.append(ticketPriceArea)
    if (appendElements.length) for (const item of appendElements) div.append(item)

    return div
}

/**
 * @param {number} ticketPrice
 * @param {Moment[]} dayList
 * @returns {HTMLTableElement|HTMLElement}
 */
const createResultTable = (ticketPrice, dayList) => {
    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')
    const roundTripTicketPrice = ticketPrice * 2
    const dayOfWeekJapanNameList = dayOfWeekParams.map(item => item.name)

    thead.innerHTML = `<tr>
                            <th class="u-text-align-right"></th>
                            <th class="u-text-align-right">年</th>
                            <th class="u-text-align-right">月</th>
                            <th class="u-text-align-right">日</th>
                            <th class="u-text-align-right">曜日</th>                            
                            <th class="u-text-align-right">祝日</th>                            
                            <th class="u-text-align-right">累計</th>
                        </tr>`

    let ticketPriceSum = 0
    let index = 0
    dayList.forEach((item) => {
        const tr = document.createElement('tr')
        if (item.isHoliday) tr.setAttribute('class', 'u-color-holiday')
        if (!item.isHoliday) {
            ticketPriceSum += roundTripTicketPrice
            index += 1
        }

        tr.innerHTML = `<td class="u-text-align-right">${item.isHoliday ? '' : index}</td>
                        <td class="u-text-align-right">${item.get('year')}</td>
                        <td class="u-text-align-right">${item.get('month') + 1}</td>
                        <td class="u-text-align-right">${item.get('date')}</td>
                        <td class="u-text-align-right">${dayOfWeekJapanNameList[item.get('day')]}</td>                        
                        <td class="u-text-align-right">${item.isHoliday ? item.holidayName : ''}</td>                        
                        <td class="u-text-align-right">${item.isHoliday ? '': ticketPriceSum}</td>`
        tbody.append(tr)
    })

    table.append(thead)
    table.append(tbody)
    return table
}

/**
 * 切符と定期の比較
 * @param {HTMLInputElement} start
 * @param {HTMLInputElement} end
 * @param {HTMLElement} result
 * @param {number} ticketPrice
 * @param {number} regularPrice
 * @returns {Promise<void>}
 */
const startToEndPeriodCalc = async (
    start,
    end,
    result,
    ticketPrice,
    regularPrice
) => {
    const startDay = moment(start.value)
    const endDay = moment(end.value)

    const startDayHolidays = await fetchHolidays(startDay.get('year'))
    const endDayHolidays = await fetchHolidays(endDay.get('year'))
    const holidays = Object.assign(startDayHolidays, endDayHolidays)

    const trueDayOfWeekParamsValues = dayOfWeekParams.map(item => {
        if (document.getElementById(`day-of-Week-${item.value}`).checked) return item.value
    })

    /**
     * @type {Moment[]}
     */
    const trueDateList = []

    while (true) {
        const thisDay = startDay.clone()
        startDay.add('days', 1) // 一日プラス

        // 判定日が祝日の判定
        thisDay.isHoliday = formatDate(thisDay.toDate()) in holidays
        if (thisDay.isHoliday) {
            thisDay.holidayName = holidays[formatDate(thisDay.toDate())]
        }

        // 有効曜日は含める
        if (trueDayOfWeekParamsValues.includes(thisDay.get('day'))) trueDateList.push(thisDay)

        // 最後の日を判定してbreak
        if (thisDay.isSame(endDay)) break
    }

    result.prepend(
        createResultItem(
            ticketPrice,
            trueDateList.length,
            regularPrice,
            [createResultTable(ticketPrice, trueDateList)]
        )
    )
}

/**
 * 開始から終了日付を計算して変更
 * @param {HTMLInputElement} start
 * @param {HTMLInputElement} end
 * @param {string} period number
 */
const startValueFromEndValue = async (start , end , period) => {
    const startDay = moment(start.value)
    end.value = formatDate(monthLater(period, startDay).toDate())
}

/**
 * 各input 要素の値を Local Storage に保存
 * key: element.id, value: element.value
 * @param {[HTMLInputElement]} inputList
 */
const saveLocalStorageFromInputList = (inputList) => {
    for (const item of inputList) localStorage.setItem(item.getAttribute('id'), item.value)
}

/**
 * Local Storage から各input要素に値を入れる
 * @param {[HTMLInputElement]} inputList
 */
const getLocalStorageToInputList = (inputList) => {
    for (const item of inputList) {
        if (!localStorage.getItem(item.getAttribute('id'))) continue
        item.value = localStorage.getItem(item.getAttribute('id'))
    }
}