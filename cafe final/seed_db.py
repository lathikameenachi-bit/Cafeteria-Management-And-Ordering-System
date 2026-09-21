import sqlite3
import json

def seed_database():
    conn = sqlite3.connect('instance/cafe_v2.db')
    cursor = conn.cursor()

    # Initial Menu Items based on previous steps
    menu_items = [
        (1, 'Garlic Bread', 499, 'starters', 'Freshly baked bread with garlic butter', 'https://images.unsplash.com/photo-1598103442097-8b74394b98c6?w=800&q=80'),
        (2, 'Bruschetta', 699, 'starters', 'Grilled bread with tomatoes and basil', 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=800&q=80'),
        (3, 'Soup of the Day', 599, 'starters', 'Chef\'s special soup', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80'),
        (4, 'Caprese Salad', 799, 'starters', 'Fresh buffalo mozzarella and tomatoes', 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&q=80'),
        (5, 'Mozzarella Sticks', 649, 'starters', 'Golden fried mozzarella', 'https://images.unsplash.com/photo-1531478140961-78ef75970429?w=800&q=80'),
        (6, 'Chicken Wings', 899, 'starters', 'Spicy buffalo wings', 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80'),
        (7, 'Espresso', 350, 'beverages', 'Rich single shot espresso', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'),
        (8, 'Cappuccino', 450, 'beverages', 'Espresso with steamed milk', 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&q=80'),
        (9, 'Signature Latte', 499, 'beverages', 'Smooth espresso with milk', 'https://images.unsplash.com/photo-1541167760496-1628856ab752?w=800&q=80'),
        (10, 'Espresso Martini', 450, 'beverages', 'Chilled mocktail coffee', 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=800&q=80'),
        (11, 'Fresh Orange Juice', 399, 'beverages', 'Freshly squeezed orange juice', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80'),
        (12, 'Hot Chocolate', 425, 'beverages', 'Rich and creamy hot chocolate', 'https://images.unsplash.com/photo-1544787210-2213d6439977?w=800&q=80'),
        (13, 'Chocolate Lava Cake', 600, 'desserts', 'Decadent chocolate layer cake', 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80'),
        (14, 'Cheesecake', 550, 'desserts', 'Creamy New York style cheesecake', 'https://images.unsplash.com/photo-1524351199679-46cddfdb54c0?w=800&q=80'),
        (15, 'Artisanal Tiramisu', 650, 'desserts', 'Classic Italian coffee-flavored dessert', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80'),
        (16, 'Brownie with Ice Cream', 599, 'desserts', 'Warm fudgy brownie with vanilla ice cream', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80'),
        (17, 'Apple Pie', 525, 'desserts', 'Warm apple pie', 'https://images.unsplash.com/photo-1535927394931-97b779951151?w=800&q=80'),
        (18, 'Brownie', 450, 'desserts', 'Fudgy chocolate brownie', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80'),
        (19, 'Signature Brownie Delight', 750, 'desserts', 'House-special warm brownie with vanilla bean ice cream and gold flakes.', 'signature_dessert.png')
    ]

    cursor.executemany('''
        INSERT OR REPLACE INTO menu_item (id, name, price, category, description, image)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', menu_items)

    conn.commit()
    conn.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
