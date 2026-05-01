# 🛡️ Security Incident & Vulnerability Ticketing System

A full-stack web application for managing security incidents, vulnerabilities, and breach reports. Built with Python Flask, SQLite, and a modern dark glassmorphism UI.

## Features

✅ **Ticket Management**
- Create, view, update, and delete security tickets
- Auto-generated ticket IDs (SEC-XXXXX)
- Real-time ticket list with search and filtering

✅ **Incident Classification**
- Incident Types: Vulnerability, Security Breach, Suspicious Activity, Misconfiguration
- Severity Levels: Critical, High, Medium, Low
- Priority Levels: Critical, High, Medium, Low
- Status Tracking: Open, Investigating, Resolved, Closed

✅ **Dashboard Analytics**
- Real-time statistics (Total Tickets, Open Issues, Critical Alerts, Resolved)
- Recent activity feed
- Severity-based filtering

✅ **Professional UI**
- Dark glassmorphism design with premium aesthetics
- Responsive sidebar navigation
- Mobile-optimized layouts (900px, 640px breakpoints)
- Real-time modal details for ticket inspection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5 / CSS3 / JavaScript (Vanilla) |
| **Backend** | Python Flask 3.1.0 |
| **Database** | SQLite |
| **ORM** | Flask-SQLAlchemy 3.1.1 |
| **Environment** | python-dotenv 1.0.1 |

## Directory Structure

```
security-ticketing-system/
├── app.py                    # Flask backend
├── requirements.txt          # Python dependencies
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── templates/
│   └── index.html            # Main UI
└── static/
    ├── style.css             # Glassmorphism styling
    └── script.js             # Frontend logic
```

## Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/MradulKochle21/security-ticketing-system.git
cd security-ticketing-system
```

### 2. Create Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# OR
.venv\Scripts\activate  # Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Application
```bash
python app.py
```

The application will be available at **http://127.0.0.1:5001**

## Deploying To GitHub And Vercel

### 1. Push The Project To GitHub
```bash
git init
git add .
git commit -m "Initial deployment setup"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Create A Vercel Project
1. Sign in to Vercel and import the GitHub repository.
2. Keep the default framework detection.
3. Add an environment variable named `DATABASE_URL`.

### 3. Use A Production Database
SQLite is fine for local development, but Vercel functions do not provide persistent local disk storage. For a real deployment, point `DATABASE_URL` to a managed Postgres database such as Neon, Supabase, or Railway.

### 4. Deploy
After import, Vercel will use the Python function entrypoint in `api/index.py` and the route mapping in `vercel.json`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serve main UI |
| `GET` | `/api/tickets` | Get all tickets |
| `POST` | `/api/tickets` | Create new ticket |
| `GET` | `/api/tickets/<id>` | Get ticket details |
| `PUT` | `/api/tickets/<id>` | Update ticket |
| `DELETE` | `/api/tickets/<id>` | Delete ticket |
| `GET` | `/api/stats` | Get dashboard statistics |

## Usage Guide

### Creating a Ticket
1. Navigate to **New Ticket** in sidebar
2. Fill in required fields:
   - **Title**: Brief incident description
   - **Incident Type**: Select category (Vulnerability, Breach, etc.)
   - **Severity**: Impact level (Critical/High/Medium/Low)
   - **Description**: Detailed incident report
3. Click **Create Ticket**

### Managing Tickets
1. View all tickets in **All Tickets** section
2. Search by keyword or filter by severity
3. Click on any ticket to view details
4. Update status (Open → Investigating → Resolved → Closed)
5. Delete tickets as needed

### Dashboard Monitoring
- **Total Tickets**: Overall incident count
- **Open Issues**: Active tickets requiring attention
- **Critical Alerts**: High-severity incidents
- **Resolved**: Closed incidents

## Database Schema

### Ticket Model
```python
- id: Integer (Primary Key)
- ticket_id: String (Unique, e.g., "SEC-00001")
- title: String (200 chars)
- description: Text
- incident_type: String (vulnerability, breach, suspicious_activity, misconfiguration)
- severity: String (critical, high, medium, low)
- status: String (open, investigating, resolved, closed)
- priority: String (critical, high, medium, low)
- assigned_to: String (Team member or "Unassigned")
- created_at: DateTime (Auto-timestamp)
- updated_at: DateTime (Auto-update)
- resolved_at: DateTime (Optional)
- impact: String (Business impact description)
- remediation: Text (Resolution details)
```

## Configuration

Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Configure as needed:
```
FLASK_ENV=development
FLASK_DEBUG=True
SQLALCHEMY_DATABASE_URI=sqlite:///security_tickets.db
DATABASE_URL=
```

## Security Features

🔒 **Built-in Safeguards:**
- CSRF protection (via Flask)
- SQL injection prevention (SQLAlchemy ORM)
- Input validation on all forms
- Datetime tracking of all changes
- Audit trail with created_at/updated_at timestamps

## Performance

- ⚡ Real-time auto-refresh (5-second intervals)
- 📦 Lightweight SQLite for rapid queries
- 🎨 Optimized CSS with GPU acceleration via transforms
- 🔄 Efficient JavaScript DOM updates

## Browser Compatibility

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- 🔐 Authentication & role-based access control
- 📊 Advanced analytics & reporting
- 🔔 Email notifications for critical incidents
- 🏷️ Custom tags and labels
- 💬 Ticket commenting/collaboration
- 📲 Mobile app integration
- 🔗 API key management for integrations

## License

MIT License - Feel free to use and modify

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ by MradulKochle21**
