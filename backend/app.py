from flask import Flask, request, jsonify
from flask import send_from_directory
from flask_cors import CORS
import psycopg2
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from flask_mail import Mail, Message
import random
from dotenv import load_dotenv
import os



app = Flask(__name__)
CORS(app)
load_dotenv()  # Load environment variables from .env
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Now use them
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')      # replace with app password

mail = Mail(app)
verified_emails = set()  # Add this globally at the top


# Temporary storage for OTPs (for demo; use DB in real app)
otp_store = {}
# Supabase settings
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_API_KEY = os.getenv('SUPABASE_API_KEY')

# PostgreSQL login-only credentials
DB_HOST = 'aws-0-ap-south-1.pooler.supabase.com'
DB_NAME = 'postgres'
DB_USER = 'postgres.djpbchdskdsfbjegvfor'
DB_PASS = 'Pzw6dXVoSyMwV2KP'
DB_PORT = 5432

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- REGISTER ---
@app.route('/register', methods=['POST'])
def register():
    try:
        # Handle multipart/form-data (for seller image upload)
        if request.content_type.startswith('multipart/form-data'):
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            role = request.form.get('role')
            seller_image_file = request.files.get('sellerImage') if role == 'seller' else None
        else:
            data = request.get_json()
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role')
            seller_image_file = None

        # Validate required fields
        if not all([username, email, password, role]):
            return jsonify({'error': 'All fields are required.'}), 400

        # Check if email was OTP-verified
        if email not in verified_emails:
            return jsonify({'error': 'Email not verified. Please verify OTP first.'}), 403

        # Handle seller image upload
        profile_image_url = None
        if role == 'seller' and seller_image_file:
            if not allowed_file(seller_image_file.filename):
                return jsonify({'error': 'Only .jpg and .png files allowed for seller image'}), 400

            filename = secure_filename(seller_image_file.filename)
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            seller_image_file.save(path)
            profile_image_url = f"http://localhost:5000/uploads/{filename}"

        # Hash the password
        hashed_pw = generate_password_hash(password)

        # Prepare request to Supabase
        headers = {
            "apikey": SUPABASE_API_KEY,
            "Authorization": f"Bearer {SUPABASE_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "username": username,
            "email": email,
            "password": hashed_pw,
            "role": role,
            "profile_image_url": profile_image_url
        }

        # Send to Supabase
        res = requests.post(f"{SUPABASE_URL}/rest/v1/users", headers=headers, json=payload)

        if res.status_code not in [200, 201]:
            print("Supabase error:", res.text)
            return jsonify({'error': 'Failed to register user'}), 500

        # Clear from verified email set
        verified_emails.discard(email)
        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        print("Registration error:", e)
        return jsonify({'error': 'Registration failed'}), 500

# --- LOGIN ---
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password required"}), 400

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT,
            sslmode='require'
        )
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, password, role FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_id, username, email, hashed_pw, role = user
        if not check_password_hash(hashed_pw, password):
            return jsonify({"error": "Invalid credentials"}), 401

        return jsonify({
            "id": str(user_id),
            "name": username,
            "email": email,
            "role": role
        }), 200

    except Exception as e:
        print("Login error:", e)
        return jsonify({"error": "Login failed"}), 500

# --- ADD ART ---
@app.route('/add-art', methods=['POST'])
def add_art():
    try:
        seller_id = request.form.get('seller_id')
        title = request.form.get('title')
        description = request.form.get('description')
        category = request.form.get('category')
        price = request.form.get('price')

        image_file = request.files.get('image_file')

        # ✅ Validate required fields
        if not all([seller_id, title, price, image_file]):
            return jsonify({'error': 'All fields including image file are required'}), 400

        # ✅ Validate file type
        if not allowed_file(image_file.filename):
            return jsonify({'error': 'Only .jpg and .png files allowed'}), 400

        # ✅ Save artwork image to local uploads folder
        image_filename = secure_filename(image_file.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        image_file.save(image_path)
        image_url = f"http://localhost:5000/uploads/{image_filename}"

        # ✅ Prepare Supabase payload
        headers = {
            "apikey": SUPABASE_API_KEY,
            "Authorization": f"Bearer {SUPABASE_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "title": title,
            "description": description,
            "category": category,
            "price": price,
            "image_url": image_url,
            "seller_id": seller_id
        }

        # ✅ POST to Supabase
        res = requests.post(f"{SUPABASE_URL}/rest/v1/arts", headers=headers, json=payload)
        if res.status_code not in [200, 201]:
            print("Supabase Error:", res.text)
            return jsonify({"error": "Supabase upload failed"}), 500

        return jsonify({"message": "✅ Artwork uploaded successfully!"}), 201

    except Exception as e:
        print("Add art error:", e)
        return jsonify({"error": "Failed to add artwork"}), 500

    

# --- UPDATE ARTWORK ---
@app.route('/update-art/<art_id>', methods=['PUT'])
def update_art(art_id):
    data = request.get_json()
    seller_id = data.get('seller_id')  # Optional but recommended for RLS check

    if not seller_id:
        return jsonify({"error": "Seller ID required for update"}), 400

    try:
        headers = {
            "apikey": SUPABASE_API_KEY,
            "Authorization": f"Bearer {SUPABASE_API_KEY}",
            "Content-Type": "application/json"
        }

        res = requests.patch(
            f"{SUPABASE_URL}/rest/v1/arts?id=eq.{art_id}&seller_id=eq.{seller_id}",
            headers=headers,
            json=data
        )

        if res.status_code != 204:
            print("Supabase update error:", res.text)
            return jsonify({"error": "Failed to update artwork"}), 500

        return jsonify({"message": "Artwork updated successfully"}), 200

    except Exception as e:
        print("Update art error:", e)
        return jsonify({"error": "Failed to update artwork"}), 500

# --- FETCH ALL ARTWORKS ---
@app.route('/arts', methods=['GET'])
def get_arts():
    try:
        category = request.args.get('category')  # from query string

        headers = {
            "apikey": SUPABASE_API_KEY,
            "Authorization": f"Bearer {SUPABASE_API_KEY}"
        }

        # Match the category case-sensitively or use ilike for case-insensitive
        if category:
            url = f"{SUPABASE_URL}/rest/v1/arts?category=ilike.{category}&select=*"
        else:
            url = f"{SUPABASE_URL}/rest/v1/arts?select=*"

        res = requests.get(url, headers=headers)

        if res.status_code != 200:
            print("Supabase error:", res.text)
            return jsonify({"error": "Supabase fetch failed"}), 500

        return jsonify({"products": res.json()}), 200

    except Exception as e:
        print("Fetch arts error:", e)
        return jsonify({"error": "Failed to fetch artworks"}), 500



    

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    msg = Message(subject='Your OTP for Sanskriti Verification',
                  sender=app.config['MAIL_USERNAME'],
                  recipients=[email])
    msg.body = f'Your OTP is: {otp}'
    mail.send(msg)

    return jsonify({'message': 'OTP sent successfully'}), 200


@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    user_otp = data.get('otp')

    if not email or not user_otp:
        return jsonify({'error': 'Email and OTP are required'}), 400

    valid_otp = otp_store.get(email)
    if valid_otp and user_otp == valid_otp:
        del otp_store[email]
        verified_emails.add(email)  # ✅ Add to verified list
        return jsonify({'message': 'OTP verified'}), 200
    else:
        return jsonify({'error': 'Invalid OTP'}), 400

@app.route('/arts/seller/<seller_id>', methods=['GET'])
def get_seller_arts(seller_id):
    try:
        headers = {
            "apikey": SUPABASE_API_KEY,
            "Authorization": f"Bearer {SUPABASE_API_KEY}"
        }

        res = requests.get(
            f"{SUPABASE_URL}/rest/v1/arts?seller_id=eq.{seller_id}&select=*",
            headers=headers
        )

        if res.status_code != 200:
            print("Supabase fetch error:", res.text)
            return jsonify({"error": "Failed to fetch seller's artworks"}), 500

        return jsonify(res.json()), 200

    except Exception as e:
        print("Seller art fetch error:", e)
        return jsonify({"error": "Server error"}), 500
    
# --- DELETE ARTWORK ---
@app.route('/delete-art/<art_id>', methods=['DELETE'])
def delete_art(art_id):
    data = request.get_json()
    seller_id = data.get('seller_id')
    if not seller_id:
        return jsonify({"error": "Seller ID required"}), 400

    try:
        headers = {
            "apikey": SUPABASE_API_KEY,
            "Authorization": f"Bearer {SUPABASE_API_KEY}",
            "Content-Type": "application/json"
        }

        res = requests.delete(
            f"{SUPABASE_URL}/rest/v1/arts?id=eq.{art_id}&seller_id=eq.{seller_id}",
            headers=headers
        )

        if res.status_code != 204:
            print("Delete error:", res.text)
            return jsonify({"error": "Failed to delete artwork"}), 500

        return jsonify({"message": "Artwork deleted successfully"}), 200

    except Exception as e:
        print("Delete art error:", e)
        return jsonify({"error": "Failed to delete artwork"}), 500
# --- ADD TO CART ---
<<<<<<< HEAD
@app.route('/cart/add', methods=['POST'])
def add_to_cart():

    data = request.get_json()
    print("Incoming JSON:", data)

    buyer_id = data.get("buyer_id") if data else None
=======
from flask import request, jsonify
import requests

@app.route('/cart/add', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    print("Incoming JSON:", data)

    buyer_id = data.get("user_id") if data else None
>>>>>>> 9e97610 (Fixed backend)
    art_id = data.get("art_id") if data else None

    print("buyer_id:", buyer_id, "art_id:", art_id)

    if not all([buyer_id, art_id]):
<<<<<<< HEAD
        return jsonify({"error": "buyer_id and art_id required"}), 400
    data = request.get_json()
    buyer_id = data.get("buyer_id")
    art_id = data.get("art_id")

    if not all([buyer_id, art_id]):
        return jsonify({"error": "buyer_id and art_id required"}), 400
=======
        return jsonify({"error": "user_id and art_id required"}), 400
>>>>>>> 9e97610 (Fixed backend)

    headers = {
        "apikey": SUPABASE_API_KEY,
        "Authorization": f"Bearer {SUPABASE_API_KEY}",
        "Content-Type": "application/json"
    }

<<<<<<< HEAD
    payload = {
        "buyer_id": buyer_id,
        "art_id": art_id
=======
    # Match column names in your Supabase table
    payload = {
        "buyer_id": buyer_id,  # FK to users table
        "art_id": art_id      # FK to arts table
>>>>>>> 9e97610 (Fixed backend)
    }

    res = requests.post(f"{SUPABASE_URL}/rest/v1/cart", headers=headers, json=payload)
    if res.status_code not in [200, 201]:
<<<<<<< HEAD
=======
        print("Supabase error:", res.text)
>>>>>>> 9e97610 (Fixed backend)
        return jsonify({"error": "Failed to add to cart"}), 500

    return jsonify({"message": "Item added to cart"}), 201

<<<<<<< HEAD
=======

>>>>>>> 9e97610 (Fixed backend)
# --- GET CART ITEMS ---
@app.route('/cart/<buyer_id>', methods=['GET'])
def get_cart(buyer_id):
    headers = {
        "apikey": SUPABASE_API_KEY,
        "Authorization": f"Bearer {SUPABASE_API_KEY}"
    }

    query = f"{SUPABASE_URL}/rest/v1/cart?buyer_id=eq.{buyer_id}&select=id,art:art_id(title,price,image_url)"
    res = requests.get(query, headers=headers)

    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch cart"}), 500

    return jsonify(res.json()), 200

# --- REMOVE FROM CART ---
@app.route('/cart/remove/<cart_id>', methods=['DELETE'])
def remove_from_cart(cart_id):
    headers = {
        "apikey": SUPABASE_API_KEY,
        "Authorization": f"Bearer {SUPABASE_API_KEY}"
    }

    res = requests.delete(f"{SUPABASE_URL}/rest/v1/cart?id=eq.{cart_id}", headers=headers)
    if res.status_code != 204:
        return jsonify({"error": "Failed to remove item from cart"}), 500

    return jsonify({"message": "Item removed from cart"}), 200


# --- MAIN ---
if __name__ == '__main__':
    print("Available routes:", app.url_map)
    app.run(debug=True)
