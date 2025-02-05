// 全局状态管理
let currentGroup = 'A';
let currentTask = null;

// 任务管理
async function createTask() {
    const taskName = document.getElementById('taskName').value;
    const group = document.getElementById('addressGroup').value;
    const settings = {
        maxTradesPerDay: parseInt(document.getElementById('maxTradesPerDay').value),
        buyAmount: parseFloat(document.getElementById('buyAmount').value),
        pumpOnly: document.getElementById('pumpOnly').checked,
        marketCapRange: {
            min: parseInt(document.getElementById('marketCapMin').value) || 0,
            max: parseInt(document.getElementById('marketCapMax').value) || 1000000000
        },
        takeProfitLevels: getTakeProfitLevels(),
        stopLoss: parseFloat(document.getElementById('stopLoss').value),
        trailingStop: document.getElementById('trailingStop').checked
    };

    if (!taskName) {
        showError('请输入任务名称');
        return;
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: taskName, group, settings })
        });

        if (response.ok) {
            await loadTasks();
            closeTaskModal();
            showSuccess('任务创建成功');
        } else {
            showError('创建任务失败');
        }
    } catch (error) {
        showError('创建任务失败: ' + error.message);
    }
}

// 获取止盈设置
function getTakeProfitLevels() {
    const levels = [];
    document.querySelectorAll('#takeProfitLevels > div').forEach(div => {
        const percentage = parseFloat(div.querySelector('.tp-percentage').value);
        const amount = parseFloat(div.querySelector('.tp-amount').value);
        if (!isNaN(percentage) && !isNaN(amount)) {
            levels.push({ percentage, sellAmount: amount });
        }
    });
    return levels.sort((a, b) => a.percentage - b.percentage);
}

// 添加止盈档位
function addTakeProfitLevel(percentage = '', amount = '') {
    const container = document.getElementById('takeProfitLevels');
    const levelDiv = document.createElement('div');
    levelDiv.className = 'flex items-center space-x-2 mb-2';
    levelDiv.innerHTML = `
        <input type="number" value="${percentage}" placeholder="上涨比例" 
               class="tp-percentage block w-1/3 rounded border-gray-300"
               min="0" step="1">
        <input type="number" value="${amount}" placeholder="卖出比例" 
               class="tp-amount block w-1/3 rounded border-gray-300"
               min="0" max="100" step="1">
        <button onclick="removeTakeProfitLevel(this)" 
                class="text-red-600 hover:text-red-800">
            删除
        </button>
    `;
    container.appendChild(levelDiv);
}

// 删除止盈档位
function removeTakeProfitLevel(button) {
    const levelDiv = button.parentElement;
    if (document.querySelectorAll('#takeProfitLevels > div').length > 1) {
        levelDiv.remove();
    } else {
        showWarning('至少需要保留一个止盈档位');
    }
}

// 切换任务状态
async function toggleTaskStatus(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            await loadTasks();
        } else {
            showError('切换任务状态失败');
        }
    } catch (error) {
        showError('切换任务状态失败: ' + error.message);
    }
}

// 加载任务列表
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        updateTasksTable(data.tasks);
    } catch (error) {
        showError('加载任务列表失败');
    }
}

// 更新任务表格
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    initializeTaskForm();
});