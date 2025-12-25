import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# ==================================================
# GLOBAL DATAFRAME
# ==================================================
disease_df = pd.DataFrame()

# ==================================================
# TRY MYSQL FIRST
# ==================================================
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
        SELECT 
            d.name AS disease_name,
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
    print("Reason:", str(db_error))

    # ==================================================
    # EXCEL FALLBACK (RENDER SAFE PATH)
    # ==================================================
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    EXCEL_FILE = os.path.join(BASE_DIR, "Health Data Sheet.xlsx")

    if os.path.exists(EXCEL_FILE):
        disease_df = pd.read_excel(EXCEL_FILE)

        # SAFE COLUMN MAPPING
        column_mapping = {
            "Name": "disease_name",
            "Symptom Description": "description",
            "Precaution 1": "symptom1",
            "Precaution 2": "symptom2",
            "Precaution 3": "symptom3"
        }

        # Apply mapping only if column exists
        column_mapping = {
            k: v for k, v in column_mapping.items() if k in disease_df.columns
        }

        disease_df = disease_df.rename(columns=column_mapping)

        print(f"✅ Loaded {len(disease_df)} diseases from Excel")
        print("📋 Columns:", disease_df.columns.tolist())
        print("📊 Sample rows:\n", disease_df.head())

    else:
        print("❌ Excel file NOT FOUND at:", EXCEL_FILE)

# ==================================================
# SEARCH FUNCTION (FIXED)
# ==================================================
def simple_disease_search(query: str):
    if disease_df.empty:
        return "Medical database is not available right now."

    query = query.lower().strip()

    for _, row in disease_df.iterrows():
        disease_name = str(row.get("disease_name", "")).lower().strip()

        if disease_name and (query == disease_name or query in disease_name):
            response = f"Description:\n{row.get('description', 'N/A')}\n\n"

            symptoms = []
            for col in ["symptom1", "symptom2", "symptom3"]:
                value = row.get(col)
                if pd.notna(value) and str(value).strip():
                    symptoms.append(f"• {value}")

            if symptoms:
                response += "Symptoms / Precautions:\n" + "\n".join(symptoms)

            return response

    return None

# ==================================================
# ROUTES
# ==================================================
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        message = data.get("message", "").strip()

        if not message:
            return jsonify({"reply": "Please enter a valid message."})

        reply = simple_disease_search(message)

        if not reply:
            return jsonify({"reply": "Sorry, I don't have information on that disease."})

        return jsonify({"reply": reply})

    except Exception as e:
        print("❌ Chat Error:", str(e))
        return jsonify({"reply": "Server error occurred."})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running"})

# ==================================================
# START SERVER
# ==================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("🚀 Flask server starting on port", port)
    app.run(host="0.0.0.0", port=port)
