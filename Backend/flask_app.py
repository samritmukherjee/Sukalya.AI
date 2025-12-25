import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

# ---------------- MYSQL CONNECTION ----------------
conn = pymysql.connect(
    host="localhost",
    user="root",                
    password=",D9Gzk2-q6Y67",  
    database="healthbot",        
    charset='utf8mb4',
    autocommit=True
)
cursor = conn.cursor(pymysql.cursors.DictCursor)

# ---------------- FETCH DATA ----------------
cursor.execute("""
    SELECT d.id as disease_id,
           d.name as disease_name,
           d.description,
           d.symptom1,
           d.symptom2,
           d.symptom3,
           GROUP_CONCAT(p.precaution_text SEPARATOR '; ') AS precautions
    FROM diseases d
    LEFT JOIN precautions p ON d.id = p.disease_id
    GROUP BY d.id, d.name, d.description, d.symptom1, d.symptom2, d.symptom3;
""")
disease_data = cursor.fetchall()
disease_df = pd.DataFrame(disease_data)

if disease_df.empty:
    raise ValueError("No disease data found in database!")

print(f"Loaded {len(disease_df)} diseases from database")

#------------------Simple Search Function------------------------
def simple_disease_search(query: str):
    query_lower = query.lower().strip()
    
    # Direct name matching
    for _, row in disease_df.iterrows():
        disease_name = row['disease_name'].lower()
        
        # Exact match or contains match
        if query_lower == disease_name or query_lower in disease_name:
            # Format response with symptoms
            response = f"Symptom Description: {row['description']}\n\n"
            
            # Add symptoms if they exist
            symptoms = []
            if pd.notna(row['symptom1']) and row['symptom1'].strip():
                symptoms.append(f"• {row['symptom1'].strip()}")
            if pd.notna(row['symptom2']) and row['symptom2'].strip():
                symptoms.append(f"• {row['symptom2'].strip()}")
            if pd.notna(row['symptom3']) and row['symptom3'].strip():
                symptoms.append(f"• {row['symptom3'].strip()}")
            
            if symptoms:
                response += "Precautions:\n" + "\n".join(symptoms)
            
            return response
    
    return None

# ---------------- FLASK APP ----------------
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()
        
        if not user_message:
            return jsonify({"reply": "Please enter a valid message."})
        
        # Simple disease search
        reply = simple_disease_search(user_message)
        
        if not reply:
            # Log unknown query
            try:
                cursor.execute("INSERT INTO unknown_queries (query_text) VALUES (%s)", (user_message,))
                conn.commit()
            except:
                pass  # Ignore if table doesn't exist
            return jsonify({"reply": "Sorry, I don't have information on that disease."})
        
        return jsonify({"reply": reply})
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({"reply": "Sorry, I encountered an error. Please try again."})

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Flask backend is running"})

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, host="0.0.0.0", port=5000)
