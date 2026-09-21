from app import app, User
with app.app_context():
    users = User.query.all()
    print("Users in DB:")
    for u in users:
        print(f"Username: {u.username}, Role: {u.role}")
