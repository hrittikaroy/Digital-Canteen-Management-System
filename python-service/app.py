from flask import Flask, request, jsonify
from collections import Counter
from difflib import get_close_matches
import mysql.connector
from flask_cors import CORS  # <-- FIX 1: Allow Frontend to talk to Backend

app = Flask(__name__)
CORS(app) # This prevents "CORS" errors in your browser console

# Database connection helper
def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='140622',
        database='digital_canteen',
        autocommit=True
    )

# --- THE FIX: UPDATED GLOBAL DATA ---
# These MUST match your new 15 items so the Search/Recommendation works
recommendations = {
    "Pizza": ["Cold Coffee", "Burger"],
    "French Fries": ["Cold Coffee", "Samosa"],
    "Chow Mein": ["Spring Roll"],
    "Paneer Butter Masala": ["Veg Biryani", "Samosa"],
    "Burger": ["Cold Coffee", "Sushi"],
    "Veg Biryani": ["Paneer Butter Masala", "Cold Coffee"]
}

# Updated search list to include ALL items from your SQL
items = [
    "Paneer Butter Masala", "Veg Biryani", "Chicken Curry", "Chow Mein",
    "Grilled Chicken", "Veg Pasta", "Samosa", "Spring Roll",
    "French Fries", "Butter Chicken", "Sushi", "Fish and Chips",
    "Burger", "Cold Coffee", "Pizza"
]
_lower_items = {item.lower(): item for item in items}

# User behavior history
user_history = {
    "user1": ["Pizza", "Pizza", "Cold Coffee"]
}

@app.route('/')
def index():
    return jsonify({
        "service": "Python recommendation service",
        "status": "running",
        "endpoints": ["/recommend", "/analytics", "/search", "/behavior", "/api/menu"]
    })

@app.route('/api/menu', methods=['GET'])
def get_menu():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True) # Dictionary=True is key for JS
        cursor.execute("SELECT * FROM menu")
        result = cursor.fetchall()
        return jsonify(result)
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db: db.close()

@app.route('/search')
def search():
    query = (request.args.get('q') or '').strip().lower()
    if not query:
        return jsonify([])

    matches = get_close_matches(query, _lower_items.keys(), n=5, cutoff=0.4)
    return jsonify([_lower_items[match] for match in matches])

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json(silent=True) or {}
    item = data.get("item")
    if not item:
        return jsonify({"error": "Missing item"}), 400

    result = recommendations.get(item, ["No suggestion"])
    return jsonify({"recommendations": result})

@app.route('/analytics')
def analytics():
    data = {
        "item": ["Pizza", "Burger", "Pizza", "French Fries"],
    }
    counts = Counter(data["item"])
    return jsonify(counts)

@app.route('/behavior')
def behavior():
    user = request.args.get('user', '')
    if user not in user_history:
        return jsonify({"suggestions": []})

    counts = Counter(user_history[user])
    suggestions = [item for item, _ in counts.most_common(3)]
    return jsonify({"suggestions": suggestions})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True) 