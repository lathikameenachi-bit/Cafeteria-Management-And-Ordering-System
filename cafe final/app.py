from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import json
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cafe_v2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-for-now'

db = SQLAlchemy(app)


# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    full_name = db.Column(db.String(100))
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='user') # 'admin' or 'user'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    image = db.Column(db.String(200))

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    customer_name = db.Column(db.String(100))
    table_number = db.Column(db.String(20))
    arrival_time = db.Column(db.String(20))
    items = db.Column(db.Text, nullable=False) # JSON string
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    persons = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    section = db.Column(db.String(50), nullable=False)
    table = db.Column(db.Integer)
    special_requests = db.Column(db.Text)
    status = db.Column(db.String(20), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Create tables and initial data
with app.app_context():
    db.create_all()
    
    # Check if admin exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', email='admin@cafeqoder.com', role='admin')
        admin.set_password('password123')
        db.session.add(admin)
        db.session.commit()

# --- API Routes ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    user = User(
        username=data['username'], 
        email=data['email'],
        full_name=data.get('fullName', '')
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'username': user.username,
            'email': user.email,
            'fullName': user.full_name,
            'role': user.role
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        return jsonify({
            'message': 'Login successful',
            'user': {
                'username': user.username,
                'email': user.email,
                'fullName': user.full_name,
                'role': user.role
            }
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/menu', methods=['GET', 'POST'])
def handle_menu():
    if request.method == 'GET':
        items = MenuItem.query.all()
        return jsonify([{
            'id': i.id,
            'name': i.name,
            'price': i.price,
            'category': i.category,
            'description': i.description,
            'image': i.image
        } for i in items])
    
    # POST for adding/editing items (Admin only)
    role = request.headers.get('X-User-Role')
    if role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    if 'id' in data and data['id']:
        item = MenuItem.query.get(data['id'])
        if item:
            item.name = data['name']
            item.price = data['price']
            item.category = data['category']
            item.description = data.get('description', '')
            item.image = data.get('image', '')
    else:
        item = MenuItem(
            name=data['name'],
            price=data['price'],
            category=data['category'],
            description=data.get('description', ''),
            image=data.get('image', '')
        )
        db.session.add(item)
    
@app.route('/api/menu/<int:item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    role = request.headers.get('X-User-Role')
    if role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    item = MenuItem.query.get(item_id)
    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item deleted successfully'}), 200
    return jsonify({'message': 'Item not found'}), 404

@app.route('/api/orders', methods=['GET', 'POST'])
def handle_orders():
    if request.method == 'GET':
        role = request.headers.get('X-User-Role')
        username = request.headers.get('X-User-Username')
        
        if role == 'admin':
            orders = Order.query.order_by(Order.created_at.desc()).all()
        elif username:
            user = User.query.filter_by(username=username).first()
            if not user:
                return jsonify({'message': 'User not found'}), 404
            orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
        else:
            return jsonify({'message': 'Unauthorized'}), 403
            
        return jsonify([{
            'id': o.id,
            'customer_name': o.customer_name,
            'table_number': o.table_number,
            'arrival_time': o.arrival_time,
            'items': json.loads(o.items),
            'total': o.total,
            'status': o.status,
            'date': o.created_at.isoformat()
        } for o in orders])
    
    data = request.json
    username = request.headers.get('X-User-Username') or data.get('username')
    user_id = None
    
    if username:
        user = User.query.filter_by(username=username).first()
        if user:
            user_id = user.id

    new_order = Order(
        user_id=user_id,
        customer_name=data.get('customer_name'),
        table_number=data.get('table_number'),
        arrival_time=data.get('arrival_time'),
        items=json.dumps(data['items']),
        total=data['total'],
        status='Pending'
    )
    db.session.add(new_order)
    db.session.commit()
    return jsonify({'message': 'Order placed successfully', 'order_id': new_order.id}), 201

@app.route('/api/orders/<int:order_id>/cancel', methods=['PUT'])
def cancel_order(order_id):
    username = request.headers.get('X-User-Username')
    if not username:
        return jsonify({'message': 'Unauthorized'}), 403
        
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    order = Order.query.filter_by(id=order_id, user_id=user.id).first()
    if not order:
        return jsonify({'message': 'Order not found or unauthorized'}), 404
        
    if order.status != 'Pending':
        return jsonify({'message': 'Cannot cancel order that is already being prepared'}), 400
        
    order.status = 'Cancelled'
    db.session.commit()
    return jsonify({'message': 'Order cancelled successfully'}), 200

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    role = request.headers.get('X-User-Role')
    if role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    order = Order.query.get(order_id)
    if order:
        order.status = data.get('status', order.status)
        db.session.commit()
        return jsonify({'message': 'Order status updated'}), 200
    return jsonify({'message': 'Order not found'}), 404

@app.route('/api/reservations', methods=['GET', 'POST'])
def handle_reservations():
    if request.method == 'GET':
        role = request.headers.get('X-User-Role')
        if role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
            
        reservations = Reservation.query.order_by(Reservation.created_at.desc()).all()
        return jsonify([{
            'id': r.id,
            'name': r.name,
            'phone': r.phone,
            'persons': r.persons,
            'date': r.date,
            'time': r.time,
            'section': r.section,
            'table': r.table,
            'status': r.status
        } for r in reservations])
    
    data = request.json
    new_res = Reservation(
        name=data['name'],
        phone=data['phone'],
        persons=data['persons'],
        date=data['date'],
        time=data['time'],
        section=data['section'],
        table=data.get('table'),
        special_requests=data.get('special_requests', ''),
        status='Pending'
    )
    db.session.add(new_res)
    db.session.commit()
    return jsonify({'message': 'Reservation confirmed', 'reservation_id': new_res.id}), 201

@app.route('/api/reservations/<int:res_id>/status', methods=['PUT'])
def update_reservation_status(res_id):
    role = request.headers.get('X-User-Role')
    if role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    res = Reservation.query.get(res_id)
    if res:
        res.status = data.get('status', res.status)
        db.session.commit()
        return jsonify({'message': 'Reservation status updated'}), 200
    return jsonify({'message': 'Reservation not found'}), 404

@app.route('/api/reservations/<int:res_id>', methods=['DELETE'])
def delete_reservation(res_id):
    role = request.headers.get('X-User-Role')
    if role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    res = Reservation.query.get(res_id)
    if res:
        db.session.delete(res)
        db.session.commit()
        return jsonify({'message': 'Reservation deleted'}), 200
    return jsonify({'message': 'Reservation not found'}), 404

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    # This serves any static file by its path
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
