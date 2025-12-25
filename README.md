# SUKALYA.ai - AI-Powered Health Assistant
**Deployed link:** https://sukalya-ai.vercel.app/ChatPage/Index_Chatpage.html

## 🏥 Project Overview

**SUKALYA.ai** is an intelligent health guidance chatbot designed to address healthcare accessibility challenges in rural India. It provides AI-powered medical assistance through an intuitive chat interface, helping users identify diseases and understand preventive measures.

## 🎯 Problem Statement

In rural India, healthcare access remains a critical challenge:
- **68% of India's population lives in rural areas** with limited access to reliable health guidance
- **Language barriers** - Most resources available only in English/Hindi
- **Poor connectivity** - Weak internet infrastructure in rural regions
- **Overloaded helplines** - Government medical services face heavy call volumes
- **Low awareness** - Limited preventive healthcare practices and early disease detection

## ✨ Key Features

1. **AI-Powered Disease Identification** - Search for diseases by name and get detailed information
2. **Symptom Information** - Access comprehensive symptom descriptions and precautions
3. **User-Friendly Chat Interface** - Intuitive conversational UI for easy interaction
4. **Responsive Design** - Works seamlessly on desktop and mobile devices
5. **Data Verification** - All health data verified by certified medical professionals
6. **Chat History** - Keep track of previous conversations
7. **Multiple Pages**:
   - Landing Page - Introduction and features
   - Chat Page - Main interaction interface
   - Authentication Page - Dataset verification credentials
   - Team Page - Project team information

## 🏗️ Project Structure

```
Sukalya AI/
├── Backend/
│   ├── flask_app.py              # Flask API server
│   ├── setup_healthbot.py        # Database initialization script
│   └── Health Data Sheet.xlsx    # Health data source (required)
│
└── Frontend/
    ├── Index_Chatpage.html       # Main chat interface
    ├── script.js                 # Chat functionality and animations
    ├── Style_Chatpage.css        # Chat page styling
    │
    ├── AuthenticationPage/
    │   ├── authentication_index.html
    │   ├── authentication_sc.js
    │   └── authentication_style.css
    │
    ├── LandingPage/
    │   ├── LandingPage.html
    │   ├── LandingPage.js
    │   └── LandingPage.css
    │
    └── TeamPage/
        ├── team_index.html
        └── team_style.css
```

## 🛠️ Technology Stack

### Backend
- **Python** - Core programming language
- **Flask** - Web framework
- **Flask-CORS** - Cross-Origin Resource Sharing support
- **PyMySQL** - MySQL database connector
- **Pandas** - Data manipulation and analysis

### Frontend
- **HTML5** - Markup structure
- **CSS3** - Styling with animations
- **JavaScript** - Interactive functionality
- **Particle Animation System** - Dynamic visual effects

### Database
- **MySQL** - Relational database for storing disease information

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- MySQL Server
- Node.js/npm (optional, for frontend development)

### Backend Setup

1. **Install Python Dependencies**
   ```bash
   pip install flask flask-cors pymysql pandas
   ```

2. **Configure MySQL Connection**
   - Update database credentials in `flask_app.py`:
     ```python
     conn = pymysql.connect(
         host="localhost",
         user="root",
         password="your_password",
         database="healthbot"
     )
     ```

3. **Prepare Health Data**
   - Place `Health Data Sheet.xlsx` in the Backend folder
   - The Excel file should contain columns: Name, Symptom Description, Precaution 1, Precaution 2, Precaution 3

4. **Initialize Database**
   ```bash
   python setup_healthbot.py
   ```
   This script will:
   - Drop and recreate the `healthbot` database
   - Create necessary tables (diseases, precautions, unknown_queries)
   - Import data from the Excel file into MySQL

5. **Run Flask Server**
   ```bash
   python flask_app.py
   ```
   The server will start on `http://localhost:5000`

### Frontend Setup

1. **Open Frontend Files**
   - Simply open `Index_Chatpage.html` in a web browser
   - Or use a local server for better development experience

2. **Frontend File Description**
   - **Index_Chatpage.html** - Main chat interface with sidebar and message display
   - **script.js** - Handles chat requests to backend, particle animations, and UI interactions
   - **Style_Chatpage.css** - Responsive styling and animations

## 📡 API Endpoints

### POST /chat
Send a message and receive health information

**Request:**
```json
{
  "message": "disease name or symptom"
}
```

**Response:**
```json
{
  "reply": "Symptom Description and precautions..."
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "message": "Flask backend is running"
}
```

## 🗄️ Database Schema

### diseases table
```sql
CREATE TABLE diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    symptom1 TEXT,
    symptom2 TEXT,
    symptom3 TEXT
);
```

### precautions table
```sql
CREATE TABLE precautions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT,
    precaution_text TEXT,
    FOREIGN KEY (disease_id) REFERENCES diseases(id)
);
```

### unknown_queries table
```sql
CREATE TABLE unknown_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Frontend Features

### Particle Animation System
- Dynamic particle effects that respond to mouse movement
- Creates an engaging visual experience
- Particles bounce off canvas edges and are attracted to cursor

### Responsive Design
- Mobile-friendly interface
- Hamburger menu for mobile navigation
- Sidebar for desktop chat history

### Page Navigation
- **Landing Page** - Welcoming introduction and project overview
- **Chat Page** - Main interactive health assistant
- **Authentication Page** - Medical professional verification
- **Team Page** - Project team information

## 🔒 Data Verification

All health data in SUKALYA.ai has been:
- **Reviewed and verified** by certified medical professionals
- **Authenticated by**: Dr. Debadeep Chakravarty, FDSRCS (Eng), Oral & Maxillofacial Surgeon
- Regularly updated with credible medical information

⚠️ **Disclaimer**: SUKALYA.ai is a supportive health guidance tool and does not replace professional medical diagnosis.

## 👥 Team

**Project Name**: CODE RENEGADES

- **Samrit Mukherjee** - Team Lead, Lead Full-Stack Developer (MSIT@CSE(AIML))
- **Richeek Mitra Mazumdar** - Frontend Developer (MSIT@CSE(AIML))
- **Aryabi Bhattacharjee** - Backend Developer and Research (MSIT@CSE(AIML))

## 📝 Usage Example

1. Open the application in your browser
2. Click "GET STARTED" on the landing page
3. Type a disease name (e.g., "Diabetes", "Fever") in the chat box
4. Receive comprehensive information including symptoms and precautions
5. Browse your chat history in the sidebar

## 🔧 Configuration

### Flask Configuration
- **CORS enabled** for frontend communication
- **Debug mode** can be toggled in `flask_app.py`
- **Database connection** uses UTF-8MB4 charset for full Unicode support

### Frontend Configuration
- Customize colors in CSS files
- Adjust particle animation parameters in `script.js`
- Modify API endpoints in fetch requests

## 📊 Logging & Monitoring

- Unknown queries are logged in the `unknown_queries` table for analysis
- Server health can be checked via `/health` endpoint
- Console logs available for debugging JavaScript issues

## 🐛 Troubleshooting

### Database Connection Error
- Verify MySQL server is running
- Check credentials in `flask_app.py`
- Ensure database name is correct

### CORS Errors
- Confirm Flask-CORS is installed
- Check frontend is making requests to correct backend URL

### No Data Displayed
- Verify `Health Data Sheet.xlsx` is in Backend folder
- Run `setup_healthbot.py` to populate database
- Check MySQL tables for imported data

## 🌟 Future Enhancements

- Multi-language support for local Indian languages
- SMS/WhatsApp integration for accessibility
- Voice input and output capabilities
- AI-powered symptom-based disease prediction
- User accounts and medical history tracking
- Integration with telehealth services
- Mobile application development

## 📄 License

This project is developed for Smart India Hackathon 2025 (Sukalya.AI Track)

## 📞 Support & Contact

For issues or inquiries, please refer to the team contact information on the Team Page.

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Status**: Active Development
