// UI管理和工具函数
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// 任务管理相关UI函数
function showTaskModal() {
    showModal('taskModal');
    initializeTaskForm();
}

function closeTaskModal() {
    hideModal('taskModal');
    clearTaskForm();
}

function initializeTaskForm() {
    // 初始化止盈档位
    const container = document.getElementById('takeProfitLevels');
    container.innerHTML = '';

    // 添加默认档位
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

// 地址管理相关UI函数
function showImportModal() {
    showModal('importModal');
}

function closeImportModal() {
    hideModal('importModal');
    document.getElementById('importAddresses').value = '';
}

// 钱包管理相关UI函数
function showAddWalletModal() {
    showModal('addWalletModal');
}

function closeAddWalletModal() {
    hideModal('addWalletModal');
    clearWalletForm();
}

// 表单处理函数
function clearTaskForm() {
    document.getElementById('taskName').value = '';
    document.getElementById('addressGroup').value = 'A';
    document.getElementById('maxTradesPerDay').value = '2';
    document.getElementById('buyAmount').value = '0.1';
    document.getElementById('marketCapMin').value = '';
    document.getElementById('marketCapMax').value = '';
    document.getElementById('pumpOnly').checked = true;
    document.getElementById('stopLoss').value = '10';
    document.getElementById('trailingStop').checked = false;
    initializeTaskForm();
}

function clearWalletForm() {
    document.getElementById('walletName').value = '';
    document.getElementById('privateKey').value = '';
}

// 提示框函数
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

// 数据展示格式化函数
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
    }).format(new Date(date));
}

function formatBalance(balance) {
    return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    }).format(balance);
}

// 复制功能
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess('已复制到剪贴板');
    } catch (err) {
        showError('复制失败');
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化模态框关闭事件
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });

    // 初始化数字输入验证
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            let value = parseFloat(this.value);
            const min = this.hasAttribute('min') ? parseFloat(this.getAttribute('min')) : null;
            const max = this.hasAttribute('max') ? parseFloat(this.getAttribute('max')) : null;

            if (min !== null && value < min) this.value = min;
            if (max !== null && value > max) this.value = max;
        });
    });

    // 加载初始数据
    loadTasks();
    // loadAddresses();
    // loadWallets();
});