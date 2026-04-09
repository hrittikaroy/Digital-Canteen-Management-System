from flask import Flask, request, jsonify, send_from_directory
from collections import Counter
from difflib import get_close_matches
import mysql.connector
from flask_cors import CORS
import os

# ⚡ Initialize Flask and point it to your 'public' folder
app = Flask(__name__, static_folder="public", static_url_path="")
CORS(app)

# --- Database connection (Using Environment Variables for Render) ---
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        autocommit=True
    )

# --- Data ---
recommendations = {
    "Pizza": ["Cold Coffee", "Burger"],
    "French Fries": ["Cold Coffee", "Samosa"],
    "Chow Mein": ["Spring Roll"],
    "Paneer Butter Masala": ["Veg Biryani", "Samosa"],
    "Burger": ["Cold Coffee", "Sushi"],
    "Veg Biryani": ["Paneer Butter Masala", "Cold Coffee"]
}

items = [
    "Paneer Butter Masala", "Veg Biryani", "Chicken Curry", "Chow Mein",
    "Grilled Chicken", "Veg Pasta", "Samosa", "Spring Roll",
    "French Fries", "Butter Chicken", "Sushi", "Fish and Chips",
    "Burger", "Cold Coffee", "Pizza"
]
_lower_items = {item.lower(): item for item in items}

user_history = {"user1": ["Pizza", "Pizza", "Cold Coffee"]}

# --- 1. THE FIX: WEBSITE ROUTES (Put these first) ---

@app.route('/')
def index():
    # This serves your HTML file instead of JSON
    return send_from_directory(app.static_folder, 'index.html')

# --- 2. API ENDPOINTS ---

@app.route('/api/menu', methods=['GET'])
def get_menu():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM menu")
        result = cursor.fetchall()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db: db.close()

@app.route('/search')
def search():
    query = (request.args.get('q') or '').strip().lower()
    if not query: return jsonify([])
    matches = get_close_matches(query, _lower_items.keys(), n=5, cutoff=0.4)
    return jsonify([_lower_items[m] for m in matches])

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json(silent=True) or {}
    item = data.get("item")
    if not item: return jsonify({"error": "Missing item"}), 400
    result = recommendations.get(item, ["No suggestion"])
    return jsonify({"recommendations": result})

def get_frequently_bought_together_suggestions(history):
    if not history:
        return []
    suggested = []
    for entry in history:
        if entry == "Pizza":
            suggested.append("Cold Coffee")
        suggested.extend(recommendations.get(entry, []))
    # preserve order and dedupe while keeping high-priority Pizza pairing first
    seen = set()
    filtered = []
    for item in suggested:
        if item not in seen and item not in history:
            seen.add(item)
            filtered.append(item)
    return filtered[:5]


def mood_based_suggestions(mood):
    mood_map = {
        "stressed": ["Butter Chicken", "Paneer Butter Masala", "Burger", "French Fries"],
        "productive": ["Salad", "Veg Biryani", "Grilled Chicken", "Sushi"]
    }
    return mood_map.get((mood or "").strip().lower(), [])


@app.route('/api/smart-suggest', methods=['POST'])
def smart_suggest():
    data = request.get_json(silent=True) or {}
    user = data.get("user")
    mood = data.get("mood")

    history = user_history.get(user, []) if user else []
    recommended_items = get_frequently_bought_together_suggestions(history)
    mood_items = mood_based_suggestions(mood)

    response = {
        "user": user or None,
        "mood": mood or None,
        "history": history,
        "frequently_bought_together": recommended_items,
        "mood_based_suggestions": mood_items
    }

    return jsonify(response)


@app.route('/analytics')
def analytics():
    counts = Counter(["Pizza", "Burger", "Pizza", "French Fries"])
    return jsonify(counts)

@app.route('/behavior')
def behavior():
    user = request.args.get('user', '')
    if user not in user_history: return jsonify({"suggestions": []})
    counts = Counter(user_history[user])
    return jsonify({"suggestions": [item for item, _ in counts.most_common(3)]})

# --- 3. CATCH-ALL FOR OTHER PAGES ---
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
