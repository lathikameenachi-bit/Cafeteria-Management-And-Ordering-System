from app import app, db
import os

def reset_db():
    with app.app_context():
        # Drop all tables safely
        db.drop_all()
        print("Dropped all tables.")
        # Recreate all tables with new schema
        db.create_all()
        print("Recreated all tables.")
        
        # Admin is created automatically in app.py's with app.app_context() block,
        # but let's make sure it's there if app.py is not running.
        from app import User
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', email='admin@cafeqoder.com', role='admin')
            admin.set_password('password123')
            db.session.add(admin)
            db.session.commit()
            print("Admin user created.")

if __name__ == "__main__":
    reset_db()
