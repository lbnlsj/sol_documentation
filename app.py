from flask import Flask, render_template, jsonify, request
from datetime import datetime
import json

app = Flask(__name__)

# Mock data storage
addresses = []
wallets = []
settings = {
    "buyAmount": 0.1,
    "takeProfit": 20,
    "stopLoss": 10
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/addresses', methods=['GET'])
def get_addresses():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify({
        'addresses': addresses[start:end],
        'total': len(addresses),
        'page': page,
        'per_page': per_page
    })


@app.route('/api/addresses', methods=['POST'])
def add_addresses():
    new_addresses = request.json.get('addresses', [])
    for addr in new_addresses:
        if addr not in addresses:
            addresses.append(addr)
    return jsonify({'success': True})


@app.route('/api/addresses/<address>', methods=['DELETE'])
def delete_address(address):
    if address in addresses:
        addresses.remove(address)
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Address not found'}), 404


@app.route('/api/wallets', methods=['GET'])
def get_wallets():
    return jsonify({'wallets': wallets})


@app.route('/api/wallets', methods=['POST'])
def add_wallet():
    wallet = request.json
    wallets.append(wallet)
    return jsonify({'success': True})


@app.route('/api/wallets/<wallet_id>', methods=['DELETE'])
def delete_wallet(wallet_id):
    for wallet in wallets:
        if wallet['id'] == wallet_id:
            wallets.remove(wallet)
            return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Wallet not found'}), 404


@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify(settings)


@app.route('/api/settings', methods=['POST'])
def update_settings():
    new_settings = request.json
    settings.update(new_settings)
    return jsonify(settings)


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    # Mock transaction data
    return jsonify({
        'transactions': [
            {
                'id': '1',
                'address': '0x123...',
                'token': 'SOL',
                'type': 'BUY',
                'amount': 0.1,
                'timestamp': datetime.now().isoformat()
            }
        ]
    })


if __name__ == '__main__':
    app.run(debug=False, port=30000, host='0.0.0.0')
