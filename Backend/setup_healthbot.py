import pandas as pd
import pymysql

# ========= 1. Load Excel =========
excel_file = "Health Data Sheet.xlsx"   # make sure file is in same folder
df = pd.read_excel(excel_file)
print("Excel loaded:", df.shape)

# ========= 2. Connect MySQL =========
conn = pymysql.connect(
    host="localhost",
    user="root",              # using root user that works
    password=",D9Gzk2-q6Y67",   # your MySQL password
    charset='utf8mb4',
    autocommit=True
)
cursor = conn.cursor()

# ========= 3. Reset Database =========
cursor.execute("DROP DATABASE IF EXISTS healthbot;")
cursor.execute("CREATE DATABASE healthbot;")
cursor.execute("USE healthbot;")

# ========= 4. Create Tables =========
cursor.execute("""
CREATE TABLE diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    symptom1 TEXT,
    symptom2 TEXT,
    symptom3 TEXT
)
""")

cursor.execute("""
CREATE TABLE precautions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT,
    precaution_text TEXT,
    FOREIGN KEY (disease_id) REFERENCES diseases(id)
)
""")

cursor.execute("""
CREATE TABLE unknown_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# ========= 5. Insert Data =========
for _, row in df.iterrows():
    # Insert disease with symptoms (using precaution columns as symptoms)
    # Handle NaN values by converting them to empty strings
    symptom1 = row.get("Precaution 1", "") if pd.notna(row.get("Precaution 1", "")) else ""
    symptom2 = row.get("Precaution 2", "") if pd.notna(row.get("Precaution 2", "")) else ""
    symptom3 = row.get("Precaution 3", "") if pd.notna(row.get("Precaution 3", "")) else ""
    
    cursor.execute(
        "INSERT INTO diseases (name, description, symptom1, symptom2, symptom3) VALUES (%s, %s, %s, %s, %s)",
        (row["Name"], 
         row["Symptom Description"], 
         symptom1, 
         symptom2, 
         symptom3)
    )
    disease_id = cursor.lastrowid

    # Insert precautions (using precaution columns)
    for col in df.columns:
        if col.startswith("Precaution"):
            text = row[col]
            if pd.notna(text):
                cursor.execute(
                    "INSERT INTO precautions (disease_id, precaution_text) VALUES (%s, %s)",
                    (disease_id, text)
                )

conn.commit()
print("✅ Excel data imported into MySQL successfully!")

cursor.close()
conn.close()
