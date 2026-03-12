from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///security_tickets.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    incident_type = db.Column(db.String(50), nullable=False)  # vulnerability, breach, suspicious_activity, misconfiguration
    severity = db.Column(db.String(20), nullable=False)  # critical, high, medium, low
    status = db.Column(db.String(20), default='open')  # open, investigating, resolved, closed
    priority = db.Column(db.String(20), default='medium')  # critical, high, medium, low
    assigned_to = db.Column(db.String(100), default='Unassigned')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    impact = db.Column(db.String(200), default='')
    remediation = db.Column(db.Text, default='')

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'title': self.title,
            'description': self.description,
            'incident_type': self.incident_type,
            'severity': self.severity,
            'status': self.status,
            'priority': self.priority,
            'assigned_to': self.assigned_to,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M'),
            'impact': self.impact,
            'remediation': self.remediation
        }

# Create database tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
    return jsonify([ticket.to_dict() for ticket in tickets])

@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    data = request.get_json()
    
    # Generate ticket ID
    last_ticket = Ticket.query.order_by(Ticket.id.desc()).first()
    ticket_number = (last_ticket.id + 1) if last_ticket else 1
    ticket_id = f"SEC-{ticket_number:05d}"
    
    ticket = Ticket(
        ticket_id=ticket_id,
        title=data.get('title', ''),
        description=data.get('description', ''),
        incident_type=data.get('incident_type', 'suspicious_activity'),
        severity=data.get('severity', 'medium'),
        priority=data.get('priority', 'medium'),
        assigned_to=data.get('assigned_to', 'Unassigned'),
        impact=data.get('impact', '')
    )
    
    db.session.add(ticket)
    db.session.commit()
    
    return jsonify({'success': True, 'ticket': ticket.to_dict()}), 201

@app.route('/api/tickets/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    return jsonify(ticket.to_dict())

@app.route('/api/tickets/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    data = request.get_json()
    
    if 'status' in data:
        ticket.status = data['status']
        if data['status'] == 'resolved':
            ticket.resolved_at = datetime.utcnow()
    if 'priority' in data:
        ticket.priority = data['priority']
    if 'severity' in data:
        ticket.severity = data['severity']
    if 'assigned_to' in data:
        ticket.assigned_to = data['assigned_to']
    if 'remediation' in data:
        ticket.remediation = data['remediation']
    
    ticket.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'success': True, 'ticket': ticket.to_dict()})

@app.route('/api/tickets/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    db.session.delete(ticket)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Ticket deleted'})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total = Ticket.query.count()
    open_tickets = Ticket.query.filter_by(status='open').count()
    critical = Ticket.query.filter_by(severity='critical').count()
    resolved = Ticket.query.filter_by(status='resolved').count()
    
    return jsonify({
        'total': total,
        'open': open_tickets,
        'critical': critical,
        'resolved': resolved
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
