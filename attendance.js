// ====== 台灣國定假日資料 (2024-2027) ======
const TAIWAN_HOLIDAYS = {
    // 2024
    '2024-01-01': '元旦',
    '2024-02-08': '農曆除夕',
    '2024-02-09': '春節',
    '2024-02-10': '春節',
    '2024-02-11': '春節',
    '2024-02-12': '春節(補假)',
    '2024-02-28': '和平紀念日',
    '2024-04-04': '兒童節/清明節',
    '2024-04-05': '清明節(補假)',
    '2024-05-01': '勞動節',
    '2024-06-10': '端午節',
    '2024-09-17': '中秋節',
    '2024-10-10': '國慶日',
    // 2025
    '2025-01-01': '元旦',
    '2025-01-27': '農曆除夕(調整)',
    '2025-01-28': '農曆除夕',
    '2025-01-29': '春節',
    '2025-01-30': '春節',
    '2025-01-31': '春節',
    '2025-02-28': '和平紀念日',
    '2025-04-03': '兒童節(補假)',
    '2025-04-04': '清明節',
    '2025-05-01': '勞動節',
    '2025-05-31': '端午節(補假)',
    '2025-06-02': '端午節(補假)',
    '2025-10-06': '中秋節',
    '2025-10-10': '國慶日',
    // 2026
    '2026-01-01': '元旦',
    '2026-01-02': '元旦(補假)',
    '2026-02-14': '農曆除夕(調整)',
    '2026-02-15': '農曆除夕(調整)',
    '2026-02-16': '農曆除夕',
    '2026-02-17': '春節',
    '2026-02-18': '春節',
    '2026-02-19': '春節',
    '2026-02-20': '春節(補假)',
    '2026-02-27': '和平紀念日(補假)',
    '2026-02-28': '和平紀念日',
    '2026-04-03': '兒童節(補假)',
    '2026-04-04': '兒童節',
    '2026-04-05': '清明節',
    '2026-04-06': '清明節(補假)',
    '2026-05-01': '勞動節',
    '2026-06-19': '端午節',
    '2026-09-25': '中秋節',
    '2026-10-09': '國慶日(補假)',
    '2026-10-10': '國慶日',
    // 2027
    '2027-01-01': '元旦',
    '2027-02-05': '農曆除夕(調整)',
    '2027-02-06': '農曆除夕',
    '2027-02-07': '春節',
    '2027-02-08': '春節',
    '2027-02-09': '春節',
    '2027-02-10': '春節(補假)',
    '2027-03-01': '和平紀念日(補假)',
    '2027-04-05': '兒童節/清明節',
    '2027-04-06': '清明節(補假)',
    '2027-05-01': '勞動節',
    '2027-06-09': '端午節',
    '2027-09-15': '中秋節',
    '2027-10-11': '國慶日(補假)',
    '2027-10-10': '國慶日',
};

// ====== 全域狀態 ======
let currentUser = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;

// ====== 工具函式 ======
function dateStr(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayStr() {
    const t = new Date();
    return dateStr(t.getFullYear(), t.getMonth(), t.getDate());
}

function nowTimeStr() {
    const t = new Date();
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}

function formatDateDisplay(ds) {
    const d = new Date(ds + 'T00:00:00');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;
}

function getWeekday(ds) {
    return new Date(ds + 'T00:00:00').getDay();
}

function isWeekend(ds) {
    const day = getWeekday(ds);
    return day === 0 || day === 6;
}

function isHoliday(ds) {
    return TAIWAN_HOLIDAYS.hasOwnProperty(ds);
}

function getHolidayName(ds) {
    return TAIWAN_HOLIDAYS[ds] || '';
}

function isWorkday(ds) {
    return !isWeekend(ds) && !isHoliday(ds);
}

function isTyphoonDay(user, ds) {
    var record = getRecord(user, ds);
    return record && record.type === 'typhoon';
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomClockIn() {
    var h = 8;
    var m = randomInt(50, 59);
    if (m >= 60) { h = 9; m = 0; }
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function randomClockOut() {
    var h = 18;
    var m = randomInt(0, 15);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function isPast(ds) {
    return ds < todayStr();
}

function isToday(ds) {
    return ds === todayStr();
}

function isFuture(ds) {
    return ds > todayStr();
}

// ====== localStorage 操作 ======
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('attendance_users') || '[]');
    } catch (e) { return []; }
}

function saveUsers(users) {
    localStorage.setItem('attendance_users', JSON.stringify(users));
}

function addUser(name) {
    const users = getUsers();
    if (!users.includes(name)) {
        users.push(name);
        saveUsers(users);
    }
}

function getRecords(user) {
    try {
        return JSON.parse(localStorage.getItem(`attendance_${user}`) || '{}');
    } catch (e) { return {}; }
}

function saveRecords(user, records) {
    localStorage.setItem(`attendance_${user}`, JSON.stringify(records));
}

function getRecord(user, ds) {
    const records = getRecords(user);
    return records[ds] || null;
}

function setRecord(user, ds, record) {
    const records = getRecords(user);
    records[ds] = record;
    saveRecords(user, records);
}

function deleteRecordData(user, ds) {
    const records = getRecords(user);
    delete records[ds];
    saveRecords(user, records);
}

// ====== 登入/登出 ======
function login() {
    const nameInput = document.getElementById('loginName');
    const name = nameInput.value.trim();
    if (!name) {
        alert('請輸入姓名！');
        nameInput.focus();
        return;
    }
    currentUser = name;
    addUser(name);
    localStorage.setItem('attendance_currentUser', name);
    showMainScreen();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('attendance_currentUser');
    document.getElementById('mainScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    renderUserList();
}

function showMainScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'block';
    document.getElementById('currentUserName').textContent = currentUser;

    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();

    updateTodayStatus();
    renderCalendar();
    renderStats();
    renderDetail();
}

function renderUserList() {
    const container = document.getElementById('userList');
    const users = getUsers();
    if (users.length === 0) {
        container.innerHTML = '';
        return;
    }
    let html = '<div class="user-list-label">已登入過的使用者：</div>';
    users.forEach(u => {
        html += `<span class="user-chip" onclick="selectUser('${u.replace(/'/g, "\\'")}')">${u}</span>`;
    });
    container.innerHTML = html;
}

function selectUser(name) {
    document.getElementById('loginName').value = name;
}

// ====== 今日狀態 ======
function updateTodayStatus() {
    const ds = todayStr();
    const d = new Date();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    document.getElementById('todayDate').textContent =
        `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 ${weekdays[d.getDay()]}` +
        (isHoliday(ds) ? `  — ${getHolidayName(ds)}` : '');

    const record = getRecord(currentUser, ds);
    const el = document.getElementById('todayRecords');

    if (isHoliday(ds)) {
        el.innerHTML = '今天是國定假日，不需要打卡';
        updateClockButtons(true);
    } else if (isWeekend(ds)) {
        el.innerHTML = '今天是週末，不需要打卡';
        updateClockButtons(true);
    } else if (record) {
        let text = '';
        if (record.clockIn) text += `上班打卡：${record.clockIn}`;
        if (record.clockOut) text += `　　下班打卡：${record.clockOut}`;
        if (record.note) text += `　　備註：${record.note}`;
        el.innerHTML = text;
        updateClockButtons(false, record);
    } else {
        el.innerHTML = '尚未打卡';
        updateClockButtons(false, null);
    }
}

function updateClockButtons(isOff, record) {
    const btnIn = document.getElementById('btnClockIn');
    const btnOut = document.getElementById('btnClockOut');

    if (isOff) {
        btnIn.disabled = true;
        btnOut.disabled = true;
        return;
    }

    if (!record) {
        btnIn.disabled = false;
        btnOut.disabled = true;
    } else if (record.clockIn && !record.clockOut) {
        btnIn.disabled = true;
        btnOut.disabled = false;
    } else {
        btnIn.disabled = true;
        btnOut.disabled = true;
    }
}

// ====== 快速打卡 ======
function clockIn() {
    const ds = todayStr();
    const time = nowTimeStr();
    const record = getRecord(currentUser, ds) || {};
    record.clockIn = time;
    record.type = 'normal';
    setRecord(currentUser, ds, record);
    updateTodayStatus();
    renderCalendar();
    renderStats();
    renderDetail();
    alert(`上班打卡成功！時間：${time}`);
}

function clockOut() {
    const ds = todayStr();
    const time = nowTimeStr();
    const record = getRecord(currentUser, ds) || {};
    record.clockOut = time;
    setRecord(currentUser, ds, record);
    updateTodayStatus();
    renderCalendar();
    renderStats();
    renderDetail();
    alert(`下班打卡成功！時間：${time}`);
}

// ====== 日曆渲染 ======
function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
    renderStats();
    renderDetail();
}

function goToday() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    renderCalendar();
    renderStats();
    renderDetail();
}

function renderCalendar() {
    document.getElementById('calendarTitle').textContent =
        `${currentYear} 年 ${currentMonth + 1} 月`;

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 空白填充
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const ds = dateStr(currentYear, currentMonth, d);
        const record = getRecord(currentUser, ds);
        const cell = document.createElement('div');
        let classes = ['calendar-day'];

        const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();

        if (isToday(ds)) classes.push('today');

        if (isHoliday(ds)) {
            classes.push('holiday');
        } else if (dayOfWeek === 0) {
            classes.push('weekend', 'sunday');
        } else if (dayOfWeek === 6) {
            classes.push('weekend', 'saturday');
        }

        if (record && record.type === 'typhoon') {
            classes.push('typhoon-day');
        } else if (record && record.clockIn) {
            if (record.type === 'makeup') {
                classes.push('makeup-day');
            } else {
                classes.push('present');
            }
        } else if (isPast(ds) && isWorkday(ds)) {
            classes.push('absent-day');
        }

        if (isFuture(ds) && !record) {
            classes.push('future');
        }

        cell.className = classes.join(' ');
        cell.onclick = () => openModal(ds);

        let inner = `<div class="day-number">${d}</div>`;

        if (isHoliday(ds)) {
            inner += `<div class="day-label">${getHolidayName(ds)}</div>`;
        }

        if (record && record.type === 'typhoon') {
            inner += '<div class="day-label">颱風假</div>';
            inner += '<div class="day-status"></div>';
        } else if (record && record.clockIn) {
            inner += `<div class="day-time">${record.clockIn}</div>`;
            inner += '<div class="day-status"></div>';
        } else if (isPast(ds) && isWorkday(ds)) {
            inner += '<div class="day-status"></div>';
        }

        cell.innerHTML = inner;
        grid.appendChild(cell);
    }
}

// ====== 統計 ======
function renderStats() {
    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    var workdays = 0;
    var presentCount = 0;
    var absentCount = 0;
    var makeupCount = 0;
    var typhoonCount = 0;
    var holidayCount = 0;

    for (var d = 1; d <= daysInMonth; d++) {
        var ds = dateStr(currentYear, currentMonth, d);
        var record = getRecord(currentUser, ds);

        if (isHoliday(ds)) {
            holidayCount++;
            continue;
        }
        if (isWeekend(ds)) continue;

        if (record && record.type === 'typhoon') {
            typhoonCount++;
            continue;
        }

        workdays++;

        if (record && record.clockIn) {
            if (record.type === 'makeup') {
                makeupCount++;
            }
            presentCount++;
        } else if (!isFuture(ds) && isWorkday(ds)) {
            absentCount++;
        }
    }

    var pastWorkdays = countPastWorkdays();
    var rate = pastWorkdays > 0 ? Math.round((presentCount / pastWorkdays) * 100) : 0;

    document.getElementById('statWorkdays').textContent = workdays;
    document.getElementById('statPresent').textContent = presentCount;
    document.getElementById('statAbsent').textContent = absentCount;
    document.getElementById('statMakeup').textContent = makeupCount;
    document.getElementById('statTyphoon').textContent = typhoonCount;
    document.getElementById('statHoliday').textContent = holidayCount;
    document.getElementById('statRate').textContent = rate + '%';
}

function countPastWorkdays() {
    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    var count = 0;
    for (var d = 1; d <= daysInMonth; d++) {
        var ds = dateStr(currentYear, currentMonth, d);
        var record = getRecord(currentUser, ds);
        if (record && record.type === 'typhoon') continue;
        if (isWorkday(ds) && !isFuture(ds)) count++;
    }
    return count;
}

// ====== 出勤明細 ======
function renderDetail() {
    const tbody = document.getElementById('detailBody');
    tbody.innerHTML = '';
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];

    for (let d = 1; d <= daysInMonth; d++) {
        const ds = dateStr(currentYear, currentMonth, d);
        const record = getRecord(currentUser, ds);
        const dow = getWeekday(ds);
        const tr = document.createElement('tr');

        let status = '';
        let statusClass = '';
        let clockInTime = '';
        let clockOutTime = '';
        let note = '';

        if (isHoliday(ds)) {
            status = getHolidayName(ds);
            statusClass = 'holiday';
        } else if (isWeekend(ds)) {
            status = '週末';
            statusClass = 'weekend';
        } else if (record && record.type === 'typhoon') {
            status = '颱風假';
            statusClass = 'typhoon';
            note = record.note || '';
        } else if (record && record.clockIn) {
            status = record.type === 'makeup' ? '補打卡' : '已出勤';
            statusClass = record.type === 'makeup' ? 'makeup' : 'present';
            clockInTime = record.clockIn || '';
            clockOutTime = record.clockOut || '';
            note = record.note || '';
        } else if (isFuture(ds)) {
            status = '未到';
            statusClass = 'future';
        } else {
            status = '缺勤';
            statusClass = 'absent';
        }

        const canEdit = !isFuture(ds) || record;

        tr.innerHTML = `
            <td>${currentMonth + 1}/${d}</td>
            <td>${weekdayNames[dow]}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${clockInTime}</td>
            <td>${clockOutTime}</td>
            <td>${note}</td>
            <td>${canEdit ? `<button class="btn btn-edit" onclick="openModal('${ds}')">編輯</button>` : ''}</td>
        `;
        tbody.appendChild(tr);
    }
}

// ====== Modal 打卡/補打卡 ======
function openModal(ds) {
    selectedDate = ds;
    const record = getRecord(currentUser, ds);
    const modal = document.getElementById('punchModal');

    document.getElementById('modalTitle').textContent =
        (isPast(ds) && !record) ? '補打卡' : (record ? '編輯打卡紀錄' : '打卡');

    document.getElementById('modalDate').textContent = formatDateDisplay(ds);

    if (isHoliday(ds)) {
        document.getElementById('modalExisting').textContent = `國定假日：${getHolidayName(ds)}`;
    } else if (isWeekend(ds)) {
        document.getElementById('modalExisting').textContent = '週末';
    } else {
        document.getElementById('modalExisting').textContent = '';
    }

    document.getElementById('modalClockIn').value = record ? (record.clockIn || '') : (isToday(ds) ? nowTimeStr() : '09:00');
    document.getElementById('modalClockOut').value = record ? (record.clockOut || '') : '';
    document.getElementById('modalNote').value = record ? (record.note || '') : '';

    const typeToSelect = record ? (record.type || 'normal') : (isPast(ds) ? 'makeup' : 'normal');
    document.querySelector(`input[name="modalType"][value="${typeToSelect}"]`).checked = true;

    document.getElementById('btnDeleteRecord').style.display = record ? 'inline-block' : 'none';

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('punchModal').style.display = 'none';
    selectedDate = null;
}

function savePunch() {
    if (!selectedDate) return;

    var selectedType = document.querySelector('input[name="modalType"]:checked').value;
    var clockIn = document.getElementById('modalClockIn').value;
    var clockOut = document.getElementById('modalClockOut').value;
    var note = document.getElementById('modalNote').value.trim();

    if (selectedType === 'typhoon') {
        var record = {
            clockIn: '',
            clockOut: '',
            note: note || '颱風假',
            type: 'typhoon'
        };
        setRecord(currentUser, selectedDate, record);
        closeModal();
        updateTodayStatus();
        renderCalendar();
        renderStats();
        renderDetail();
        return;
    }

    if (!clockIn) {
        alert('請輸入上班時間！');
        return;
    }

    if (clockOut && clockIn >= clockOut) {
        alert('下班時間必須晚於上班時間！');
        return;
    }

    var record = {
        clockIn: clockIn,
        clockOut: clockOut || '',
        note: note,
        type: selectedType
    };

    setRecord(currentUser, selectedDate, record);
    closeModal();
    updateTodayStatus();
    renderCalendar();
    renderStats();
    renderDetail();
}

function deleteRecord() {
    if (!selectedDate) return;
    if (!confirm('確定要刪除此筆打卡紀錄嗎？')) return;

    deleteRecordData(currentUser, selectedDate);
    closeModal();
    updateTodayStatus();
    renderCalendar();
    renderStats();
    renderDetail();
}

// ====== 本月自動打卡 ======
function autoClockMonth() {
    if (!currentUser) return;

    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    var today = todayStr();
    var count = 0;

    for (var d = 1; d <= daysInMonth; d++) {
        var ds = dateStr(currentYear, currentMonth, d);
        if (isFuture(ds)) continue;
        if (!isWorkday(ds)) continue;

        var existing = getRecord(currentUser, ds);
        if (existing) continue;

        var record = {
            clockIn: randomClockIn(),
            clockOut: randomClockOut(),
            note: '',
            type: 'normal'
        };
        setRecord(currentUser, ds, record);
        count++;
    }

    if (count > 0) {
        alert('已自動打卡 ' + count + ' 天（上班 8:50~9:00 / 下班 18:00~18:15 隨機）');
    } else {
        alert('本月沒有需要補打卡的工作日');
    }

    updateTodayStatus();
    renderCalendar();
    renderStats();
    renderDetail();
}

// ====== 初始化 ======
document.addEventListener('DOMContentLoaded', function () {
    renderUserList();

    document.getElementById('loginName').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') login();
    });

    const saved = localStorage.getItem('attendance_currentUser');
    if (saved) {
        currentUser = saved;
        showMainScreen();
    }
});
