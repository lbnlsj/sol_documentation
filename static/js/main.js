// 状态管理
let wallets = [];
let tasks = [];
let currentGroup = 'A';

// 交易任务管理
async function createTask() {
    const name = document.getElementById('taskName').value;
    const group = document.getElementById('addressGroup').value;
    const settings = {
        maxTradesPerDay: parseInt(document.getElementById('maxTradesPerDay').value),
        buyAmount: parseFloat(document.getElementById('buyAmount').value),
        pumpOnly: document.getElementById('pumpOnly').checked,
        marketCapRange: {
            min: parseInt(document.getElementById('marketCapMin').value),
            max: parseInt(document.getElementById('marketCapMax').value)
        },
        takeProfitLevels: getTakeProfitLevels(),
        stopLoss: parseFloat(document.getElementById('stopLoss').value),
        trailingStop: document.getElementById('trailingStop').checked
    };

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, group, settings })
        });
        if (response.ok) {
            await loadTasks();
            closeTaskModal();
            showSuccess('任务创建成功');
        }
    } catch (error) {
        showError('创建任务失败');
    }
}

async function toggleTaskStatus(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        showError('切换任务状态失败');
    }
}

async function deleteTask(taskId) {
    const result = await Swal.fire({
        title: '确认删除',
        text: '确定要删除这个任务吗？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await loadTasks();
                showSuccess('任务已删除');
            }
        } catch (error) {
            showError('删除任务失败');
        }
    }
}

// 地址管理
async function addAddresses() {
    const addresses = document.getElementById('importAddresses').value
        .split('\n')
        .map(addr => addr.trim())
        .filter(addr => addr);

    if (!addresses.length) {
        showError('请输入至少一个地址');
        return;
    }

    try {
        const response = await fetch(`/api/addresses/${currentGroup}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses })
        });
        if (response.ok) {
            await loadAddresses();
            closeImportModal();
            showSuccess(`已成功导入 ${addresses.length} 个地址`);
        }
    } catch (error) {
        showError('导入地址失败');
    }
}

async function deleteAddress(address) {
    const result = await Swal.fire({
        title: '确认删除',
        text: '确定要删除这个监控地址吗？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/addresses/${currentGroup}/${address}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await loadAddresses();
                showSuccess('地址已删除');
            }
        } catch (error) {
            showError('删除地址失败');
        }
    }
}

async function changeGroup(group) {
    currentGroup = group;
    await loadAddresses();
}

// 钱包管理
async function addWallet() {
    const name = document.getElementById('walletName').value;
    const privateKey = document.getElementById('privateKey').value;

    if (!name || !privateKey) {
        showError('请填写所有字段');
        return;
    }

    try {
        const response = await fetch('/api/wallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, privateKey })
        });
        if (response.ok) {
            await loadWallets();
            closeAddWalletModal();
            showSuccess('钱包添加成功');
        }
    } catch (error) {
        showError('添加钱包失败');
    }
}

async function deleteWallet(publicKey) {
    const result = await Swal.fire({
        title: '确认删除',
        text: '确定要删除这个钱包吗？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/wallets/${publicKey}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await loadWallets();
                showSuccess('钱包已删除');
            }
        } catch (error) {
            showError('删除钱包失败');
        }
    }
}

// 数据加载函数
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
            tasks = await response.json();
            updateTasksTable(tasks);
        }
    } catch (error) {
        showError('加载任务列表失败');
    }
}

async function loadAddresses() {
    try {
        const response = await fetch(`/api/addresses/${currentGroup}`);
        if (response.ok) {
            const data = await response.json();
            updateAddressList(data.addresses);
        }
    } catch (error) {
        showError('加载地址列表失败');
    }
}

async function loadWallets() {
    try {
        const response = await fetch('/api/wallets');
        if (response.ok) {
            const data = await response.json();
            wallets = data.wallets;
            updateWalletsTable(wallets);
        }
    } catch (error) {
        showError('加载钱包列表失败');
    }
}

// 工具函数
function truncateAddress(address) {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadWallets(),
        loadTasks(),
        loadAddresses()
    ]);
});