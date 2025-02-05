from flask import Flask, render_template, jsonify, request
from datetime import datetime
import json

app = Flask(__name__)

# 数据存储
addresses = {
    'A': [],
    'B': [],
    'C': []
}
wallets = []
trading_tasks = []

# 默认交易设置
default_settings = {
    "buyAmount": 0.1,
    "takeProfit": [
        {"percentage": 100, "sellAmount": 5},
        {"percentage": 200, "sellAmount": 5},
        {"percentage": 300, "sellAmount": 10},
        {"percentage": 400, "sellAmount": 10},
        {"percentage": 500, "sellAmount": 10},
    ],
    "stopLoss": 10,
    "trailingStop": True,
    "maxTradesPerDay": 2,
    "marketCapRange": {"min": 0, "max": 1000000000},
    "pumpOnly": True
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify({'tasks': trading_tasks})


@app.route('/api/tasks', methods=['POST'])
def create_task():
    task = request.json
    task['id'] = len(trading_tasks) + 1
    task['status'] = 'active'
    task['created_at'] = datetime.now().isoformat()
    trading_tasks.append(task)
    return jsonify({'success': True, 'task': task})


@app.route('/api/tasks/<int:task_id>/status', methods=['PUT'])
def toggle_task_status(task_id):
    task = next((t for t in trading_tasks if t['id'] == task_id), None)
    if task:
        task['status'] = 'inactive' if task['status'] == 'active' else 'active'
        return jsonify({'success': True, 'task': task})
    return jsonify({'success': False, 'error': '任务未找到'}), 404


@app.route('/api/addresses/<group>', methods=['GET'])
def get_addresses(group):
    return jsonify({
        'addresses': addresses.get(group, []),
        'total': len(addresses.get(group, []))
    })


@app.route('/api/addresses/<group>', methods=['POST'])
def add_addresses(group):
    if group not in addresses:
        addresses[group] = []
    new_addresses = request.json.get('addresses', [])
    addresses[group].extend([addr for addr in new_addresses if addr not in addresses[group]])
    return jsonify({'success': True})


@app.route('/api/settings/default', methods=['GET'])
def get_default_settings():
    return jsonify(default_settings)


if __name__ == '__main__':
    # 添加示例数据
    example_task = {
        'id': 1,
        'name': '测试任务',
        'group': 'A',
        'status': 'active',
        'settings': default_settings.copy(),
        'created_at': datetime.now().isoformat()
    }
    trading_tasks.append(example_task)

    app.run(debug=True, port=30001, host='0.0.0.0')