from app import app, Order
with app.app_context():
    from app import User
    orders = Order.query.all()
    print("Orders in DB:")
    for o in orders:
        user = User.query.get(o.user_id) if o.user_id else None
        username = user.username if user else "GUEST"
        print(f"ID: {o.id}, User: {username}, Status: {o.status}, Total: {o.total}")
