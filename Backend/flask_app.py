import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

disease_df = pd.DataFrame()

# ================== TRY MYSQL FIRST ==================
try:
    import pymysql

    conn = pymysql.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        database=os.environ.get("DB_NAME", "healthbot"),
        charset="utf8mb4",
        autocommit=True
    )

    cursor = conn.cursor(pymysql.cursors.DictCursor)

    cursor.execute("""
        SELECT d.id as disease_id,
               d.name as disease_name,
               d.description,
               d.symptom1,
               d.symptom2,
               d.symptom3
        FROM diseases d;
    """)

    data = cursor.fetchall()
    disease_df = pd.DataFrame(data)
    print(f"✅ Loaded {len(disease_df)} diseases from MySQL")

except Exception as db_error:
    print("⚠️ MySQL not available, switching to Excel mode")

    EXCEL_FILE = "Health Data Sheet.xlsx"

    if os.path.exists(EXCEL_FILE):
        disease_df = pd.read_excel(EXCEL_FILE)
        print(f"✅ Loaded {len(disease_df)} diseases from Excel")
    else:
        print("❌ No database or Excel file found")

# ================== SEARCH FUNCTION ==================
def simple_disease_search(query: str):
    if disease_df.empty:
        return "Medical database is not available right now."

    query = query.lower().strip()

    for _, row in disease_df.iterrows():
        name = str(row.get("disease_name", "")).lower()

        if query == name or query in name:
            response = f"Description: {row.get('description', 'N/A')}\n\n"

            symptoms = []
            for col in ["symptom1", "symptom2", "symptom2"]:
                val = row.get(col)
                if pd.notna(val):
                    symptoms.append(f"• {val}")

            if symptoms:
                response += "Symptoms:\n" + "\n".join(symptoms)

            return response

    return None

# ================== ROUTES ==================
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        msg = data.get("message", "").strip()

        if not msg:
            return jsonify({"reply": "Please enter a valid message."})

        reply = simple_disease_search(msg)

        if not reply:
            return jsonify({"reply": "Sorry, I don't have information on that disease."})

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"reply": "Server error occurred."})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running"})


# ================== START ==================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
