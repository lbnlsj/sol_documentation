// 弹窗管理
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// 任务管理弹窗
function showTaskModal() {
    showModal('taskModal');
    loadDefaultSettings();
    initializeTakeProfitLevels();
}

function closeTaskModal() {
    hideModal('taskModal');
    clearTaskForm();
}

// 地址导入弹窗
function showImportModal() {
    showModal('importModal');
}

function closeImportModal() {
    hideModal('importModal');
    document.getElementById('importAddresses').value = '';
}

// 钱包管理弹窗
function showAddWalletModal() {
    showModal('addWalletModal');
}

function closeAddWalletModal() {
    hideModal('addWalletModal');
    clearWalletForm();
}

// 止盈设置管理
function initializeTakeProfitLevels() {
    const container = document.getElementById('takeProfitLevels');
    container.innerHTML = '';

    // 添加默认止盈档位
    const defaultLevels = [
        {percentage: 100, amount: 5},
        {percentage: 200, amount: 5},
        {percentage: 300, amount: 10},
        {percentage: 400, amount: 10},
        {percentage: 500, amount: 10}
    ];

    defaultLevels.forEach(level => {
        addTakeProfitLevel(level.percentage, level.amount);
    });
}

function addTakeProfitLevel(percentage = '', amount = '') {
    const container = document.getElementById('takeProfitLevels');
    const levelDiv = document.createElement('div');
    levelDiv.className = 'flex items-center space-x-2';
    levelDiv.innerHTML = `
        <input type="number" value="${percentage}" placeholder="上涨比例" 
               class="tp-percentage mt-1 block w-1/2 rounded-md border-gray-300"
               min="0" max="10000">
        <input type="number" value="${amount}" placeholder="卖出比例" 
               class="tp-amount mt-1 block w-1/2 rounded-md border-gray-300"
               min="0" max="100">
        <button onclick="removeTakeProfitLevel(this)" 
                class="mt-1 text-red-600 hover:text-red-800 p-1">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;
    container.appendChild(levelDiv);
    validateTakeProfitInputs(levelDiv);
}

function removeTakeProfitLevel(button) {
    const levelDiv = button.parentElement;
    const container = levelDiv.parentElement;
    if (container.children.length > 1) {
        levelDiv.remove();
    } else {
        showWarning('至少需要保留一个止盈档位');
    }
}

function validateTakeProfitInputs(levelDiv) {
    const inputs = levelDiv.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            let value = parseFloat(this.value);
            if (this.classList.contains('tp-percentage')) {
                if (value < 0) this.value = 0;
                if (value > 10000) this.value = 10000;
            } else if (this.classList.contains('tp-amount')) {
                if (value < 0) this.value = 0;
                if (value > 100) this.value = 100;
            }
        });
    });
}

function getTakeProfitLevels() {
    const levels = [];
    document.querySelectorAll('#takeProfitLevels > div').forEach(div => {
        const percentage = parseFloat(div.querySelector('.tp-percentage').value);
        const amount = parseFloat(div.querySelector('.tp-amount').value);
        if (!isNaN(percentage) && !isNaN(amount)) {
            levels.push({percentage, sellAmount: amount});
        }
    });
    return levels.sort((a, b) => a.percentage - b.percentage);
}

// 表格更新
function updateTasksTable(tasks) {
    const tbody = document.getElementById('tasksTableBody');
    tbody.innerHTML = tasks.map(task => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">${task.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${task.group}组</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    ${task.status === 'active' ? '运行中' : '已停止'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2">
                <button onclick="toggleTaskStatus(${task.id})" 
                        class="text-blue-600 hover:text-blue-900">
                    ${task.status === 'active' ? '停止' : '启动'}
                </button>
                <button onclick="editTask(${task.id})"
                        class="text-indigo-600 hover:text-indigo-900">
                    编辑
                </button>
                <button onclick="deleteTask(${task.id})" 
                        class="text-red-600 hover:text-red-900">
                    删除
                </button>
            </td>
        </tr>
    `).join('');
}

function updateAddressList(addresses) {
    const container = document.getElementById('addressList');
    if (addresses.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-500">
                当前分组暂无监控地址
            </div>`;
        return;
    }

    container.innerHTML = addresses.map(address => `
        <div class="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
            <div class="flex justify-between items-center">
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900">${truncateAddress(address)}</span>
                    <span class="text-xs text-gray-500">添加时间: ${formatDate(new Date())}</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="copyAddress('${address}')"
                            class="text-gray-600 hover:text-gray-900">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    </button>
                    <button onclick="deleteAddress('${address}')"
                            class="text-red-600 hover:text-red-900">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateWalletsTable(wallets) {
    const tbody = document.getElementById('walletsTableBody');
    if (wallets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                    暂无交易钱包，请点击"添加钱包"按钮添加
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = wallets.map(wallet => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${wallet.name}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-900">${truncateAddress(wallet.publicKey)}</span>
                    <button onclick="copyAddress('${wallet.publicKey}')"
                            class="text-gray-400 hover:text-gray-600">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    </button>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${formatBalance(wallet.balance || 0)} SOL</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onclick="viewWalletDetails('${wallet.publicKey}')"
                        class="text-indigo-600 hover:text-indigo-900">
                    详情
                </button>
                <button onclick="deleteWallet('${wallet.publicKey}')"
                        class="text-red-600 hover:text-red-900">
                    删除
                </button>
            </td>
        </tr>
    `).join('');
}

// 工具函数
function truncateAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(date) {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function formatBalance(balance) {
    return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    }).format(balance);
}

async function copyAddress(address) {
    try {
        await navigator.clipboard.writeText(address);
        showSuccess('地址已复制到剪贴板');
    } catch (err) {
        showError('复制地址失败');
    }
}

// 表单处理
function clearTaskForm() {
    document.getElementById('taskName').value = '';
    document.getElementById('addressGroup').value = 'A';
    document.getElementById('maxTradesPerDay').value = '2';
    document.getElementById('buyAmount').value = '';
    document.getElementById('marketCapMin').value = '';
    document.getElementById('marketCapMax').value = '';
    document.getElementById('pumpOnly').checked = true;
    document.getElementById('stopLoss').value = '';
    document.getElementById('trailingStop').checked = false;
}

function clearWalletForm() {
    document.getElementById('walletName').value = '';
    document.getElementById('privateKey').value = '';
}

// 提示框
function showSuccess(message) {
    Swal.fire({
        title: '成功',
        text: message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

function showError(message) {
    Swal.fire({
        title: '错误',
        text: message,
        icon: 'error'
    });
}

function showWarning(message) {
    Swal.fire({
        title: '警告',
        text: message,
        icon: 'warning'
    });
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化弹窗关闭事件
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });

    // 初始化数字输入验证
// 初始化数字输入验证
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function () {
            let value = parseFloat(this.value);
            const min = this.hasAttribute('min') ? parseFloat(this.getAttribute('min')) : null;
            const max = this.hasAttribute('max') ? parseFloat(this.getAttribute('max')) : null;

            if (min !== null && value < min) this.value = min;
            if (max !== null && value > max) this.value = max;
        });
    });

    // 初始化工具提示
    initializeTooltips();
});

function initializeTooltips() {
    const tooltips = {
        'pumpOnly': '仅在币价快速上涨时买入',
        'trailingStop': '随着价格上涨动态调整止损价格',
        'maxTradesPerDay': '每个钱包每天最多交易次数',
        'marketCapRange': '目标代币的市值范围限制'
    };

    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            const label = element.closest('label') || element.parentElement;
            label.setAttribute('title', text);
        }
    });
}

// 任务编辑
async function loadTaskDetails(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) throw new Error('加载任务详情失败');

        const task = await response.json();
        populateTaskForm(task);
        showTaskModal();
    } catch (error) {
        showError(error.message);
    }
}

function populateTaskForm(task) {
    document.getElementById('taskName').value = task.name;
    document.getElementById('addressGroup').value = task.group;
    document.getElementById('maxTradesPerDay').value = task.settings.maxTradesPerDay;
    document.getElementById('buyAmount').value = task.settings.buyAmount;
    document.getElementById('marketCapMin').value = task.settings.marketCapRange.min;
    document.getElementById('marketCapMax').value = task.settings.marketCapRange.max;
    document.getElementById('pumpOnly').checked = task.settings.pumpOnly;
    document.getElementById('stopLoss').value = task.settings.stopLoss;
    document.getElementById('trailingStop').checked = task.settings.trailingStop;

    // 重置并填充止盈设置
    const container = document.getElementById('takeProfitLevels');
    container.innerHTML = '';
    task.settings.takeProfitLevels.forEach(level => {
        addTakeProfitLevel(level.percentage, level.sellAmount);
    });
}

// 钱包详情
async function viewWalletDetails(publicKey) {
    try {
        const response = await fetch(`/api/wallets/${publicKey}/details`);
        if (!response.ok) throw new Error('加载钱包详情失败');

        const details = await response.json();
        showWalletDetailsModal(details);
    } catch (error) {
        showError(error.message);
    }
}

function showWalletDetailsModal(details) {
    Swal.fire({
        title: '钱包详情',
        html: `
            <div class="text-left">
                <div class="mb-4">
                    <div class="text-sm text-gray-500">钱包名称</div>
                    <div class="font-medium">${details.name}</div>
                </div>
                <div class="mb-4">
                    <div class="text-sm text-gray-500">公钥地址</div>
                    <div class="font-medium break-all">${details.publicKey}</div>
                </div>
                <div class="mb-4">
                    <div class="text-sm text-gray-500">SOL余额</div>
                    <div class="font-medium">${formatBalance(details.balance)} SOL</div>
                </div>
                <div class="mb-4">
                    <div class="text-sm text-gray-500">今日交易次数</div>
                    <div class="font-medium">${details.todayTrades || 0} 次</div>
                </div>
                <div class="mb-4">
                    <div class="text-sm text-gray-500">创建时间</div>
                    <div class="font-medium">${formatDate(new Date(details.createdAt))}</div>
                </div>
            </div>
        `,
        width: 600,
        showConfirmButton: false,
        showCloseButton: true
    });
}

// 设置加载与保存
async function loadDefaultSettings() {
    try {
        const response = await fetch('/api/settings/default');
        if (!response.ok) throw new Error('加载默认设置失败');

        const settings = await response.json();
        document.getElementById('maxTradesPerDay').value = settings.maxTradesPerDay;
        document.getElementById('buyAmount').value = settings.buyAmount;
        document.getElementById('stopLoss').value = settings.stopLoss;
        document.getElementById('trailingStop').checked = settings.trailingStop;
    } catch (error) {
        console.error('加载默认设置失败:', error);
    }
}