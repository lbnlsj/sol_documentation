from flask import Flask, render_template, jsonify, request
from datetime import datetime
import json

app = Flask(__name__)

# Data storage
addresses = {}  # Group -> addresses mapping
wallets = []
trading_tasks = []

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
    "followRange": {"min": 0, "max": 100},
    "top10HoldingPercentage": 0,
    "pumpOnly": True
}

@app.route('/')
def index():
    return render_template('index.html')

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

@app.route('/api/addresses/<group>/<address>', methods=['DELETE'])
def delete_address(group, address):
    if group in addresses and address in addresses[group]:
        addresses[group].remove(address)
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Address not found'}), 404

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify({'tasks': trading_tasks})

@app.route('/api/tasks', methods=['POST'])
def create_task():
    task = request.json
    task['id'] = len(trading_tasks) + 1
    task['status'] = 'active'
    trading_tasks.append(task)
    return jsonify({'success': True, 'task': task})

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = next((t for t in trading_tasks if t['id'] == task_id), None)
    if task:
        updates = request.json
        task.update(updates)
        return jsonify({'success': True, 'task': task})
    return jsonify({'success': False, 'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>/status', methods=['PUT'])
def toggle_task_status(task_id):
    task = next((t for t in trading_tasks if t['id'] == task_id), None)
    if task:
        task['status'] = 'active' if task['status'] == 'inactive' else 'inactive'
        return jsonify({'success': True, 'task': task})
    return jsonify({'success': False, 'error': 'Task not found'}), 404

@app.route('/api/wallets', methods=['GET', 'POST'])
def handle_wallets():
    if request.method == 'POST':
        wallet = request.json
        wallets.append(wallet)
        return jsonify({'success': True})
    return jsonify({'wallets': wallets})

@app.route('/api/settings/default', methods=['GET'])
def get_default_settings():
    return jsonify(default_settings)

if __name__ == '__main__':
    app.run(debug=False, port=30000, host='0.0.0.0')