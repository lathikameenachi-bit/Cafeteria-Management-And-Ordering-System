from app import app, User
with app.app_context():
    user = User.query.filter_by(username='admin').first()
    print(f'Admin user found: {user is not None}')
    if user:
        print(f'Hash check with "password123": {user.check_password("password123")}')
