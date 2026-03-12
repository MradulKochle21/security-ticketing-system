// State Management
let allTickets = [];
let filteredTickets = [];

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const ticketForm = document.getElementById('ticket-form');
const searchInput = document.getElementById('search-tickets');
const filterSeverity = document.getElementById('filter-severity');
const ticketsList = document.getElementById('tickets-list');
const recentTickets = document.getElementById('recent-tickets');
const modal = document.getElementById('ticket-modal');
const closeModal = document.querySelector('.close-modal');
const pageTitle = document.getElementById('page-title');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadTickets();
    loadStats();
    setInterval(loadTickets, 5000); // Auto-refresh every 5 seconds
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.dataset.view;
            switchView(viewName);
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Form
    ticketForm.addEventListener('submit', createTicket);

    // Search and Filter
    searchInput.addEventListener('input', filterTickets);
    filterSeverity.addEventListener('change', filterTickets);

    // Modal
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// View Management
function switchView(viewName) {
    views.forEach(view => view.classList.remove('active'));
    const view = document.getElementById(viewName);
    if (view) {
        view.classList.add('active');
    }

    // Update page title
    const titles = {
        dashboard: 'Security Dashboard',
        tickets: 'All Tickets',
        create: 'Create New Ticket'
    };
    pageTitle.textContent = titles[viewName] || 'Dashboard';
}

// Load Tickets
async function loadTickets() {
    try {
        const response = await fetch('/api/tickets');
        allTickets = await response.json();
        filteredTickets = allTickets;
        renderTickets();
        renderRecentTickets();
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// Load Stats
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-open').textContent = stats.open;
        document.getElementById('stat-critical').textContent = stats.critical;
        document.getElementById('stat-resolved').textContent = stats.resolved;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Create Ticket
async function createTicket(e) {
    e.preventDefault();
    const formStatus = document.getElementById('form-status');
    
    try {
        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            incident_type: document.getElementById('incident_type').value,
            severity: document.getElementById('severity').value,
            priority: document.getElementById('priority').value,
            assigned_to: document.getElementById('assigned_to').value || 'Unassigned',
            impact: document.getElementById('impact').value
        };

        const response = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            formStatus.textContent = `✅ Ticket ${result.ticket.ticket_id} created successfully!`;
            formStatus.classList.add('success');
            formStatus.classList.remove('error');
            ticketForm.reset();
            loadTickets();
            loadStats();
            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.classList.remove('success', 'error');
            }, 3000);
        } else {
            throw new Error('Failed to create ticket');
        }
    } catch (error) {
        console.error('Error creating ticket:', error);
        formStatus.textContent = '❌ Error creating ticket. Please try again.';
        formStatus.classList.add('error');
        formStatus.classList.remove('success');
    }
}

// Render Tickets
function renderTickets() {
    const emptyState = document.getElementById('empty-state');
    
    if (filteredTickets.length === 0) {
        ticketsList.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';
    ticketsList.innerHTML = filteredTickets.map(ticket => createTicketElement(ticket, false)).join('');
    attachTicketListeners();
}

// Render Recent Tickets
function renderRecentTickets() {
    const recent = allTickets.slice(0, 5);
    recentTickets.innerHTML = recent.map(ticket => createTicketElement(ticket, true)).join('');
    attachTicketListeners();
}

// Create Ticket Element
function createTicketElement(ticket, isRecent = false) {
    const severityClass = ticket.severity;
    const createdDate = new Date(ticket.created_at).toLocaleDateString();
    
    return `
        <div class="ticket-item" data-ticket-id="${ticket.id}">
            <div class="ticket-main">
                <div class="ticket-id">${ticket.ticket_id}</div>
                <div class="ticket-title">${ticket.title}</div>
                ${!isRecent ? `<div class="ticket-desc">${ticket.description}</div>` : ''}
            </div>
            <div class="ticket-badges">
                <span class="badge badge-severity ${severityClass}">
                    ${ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1)}
                </span>
                <span class="badge badge-status">${ticket.status}</span>
            </div>
            <div class="ticket-date">${ticket.assigned_to}</div>
            <div class="ticket-date">${createdDate}</div>
        </div>
    `;
}

// Attach Listeners to Tickets
function attachTicketListeners() {
    document.querySelectorAll('.ticket-item').forEach(item => {
        item.addEventListener('click', () => {
            const ticketId = item.dataset.ticketId;
            showTicketDetail(ticketId);
        });
    });
}

// Show Ticket Detail Modal
async function showTicketDetail(ticketId) {
    try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        const ticket = await response.json();
        
        let modalBody = document.getElementById('modal-body');
        const severityEmoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
        };

        const incidentEmoji = {
            vulnerability: '🔍',
            breach: '🔓',
            suspicious_activity: '🚨',
            misconfiguration: '⚙️'
        };

        modalBody.innerHTML = `
            <h3>${ticket.ticket_id}: ${ticket.title}</h3>
            
            <div class="ticket-detail-row">
                <span class="ticket-detail-label">Status</span>
                <span class="ticket-detail-value status-update">
                    <select class="status-select" data-ticket-id="${ticket.id}">
                        <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open</option>
                        <option value="investigating" ${ticket.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                        <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </span>
            </div>

            <div class="ticket-detail-row">
                <span class="ticket-detail-label">Severity</span>
                <span class="ticket-detail-value">${severityEmoji[ticket.severity]} ${ticket.severity}</span>
            </div>

            <div class="ticket-detail-row">
                <span class="ticket-detail-label">Type</span>
                <span class="ticket-detail-value">${incidentEmoji[ticket.incident_type]} ${ticket.incident_type.replace('_', ' ')}</span>
            </div>

            <div class="ticket-detail-row">
                <span class="ticket-detail-label">Priority</span>
                <span class="ticket-detail-value">${ticket.priority}</span>
            </div>

            <div class="ticket-detail-row">
                <span class="ticket-detail-label">Assigned To</span>
                <span class="ticket-detail-value">${ticket.assigned_to}</span>
            </div>

            <div class="ticket-detail-row">
                <span class="ticket-detail-label">Created</span>
                <span class="ticket-detail-value">${ticket.created_at}</span>
            </div>

            <div class="ticket-detail-row">
                <span class="ticket-detail-label">Description</span>
            </div>
            <p style="color: var(--text-secondary); padding: 0.5rem 0; border-bottom: 1px solid rgba(150, 170, 210, 0.1);">
                ${ticket.description}
            </p>

            ${ticket.impact ? `
                <div class="ticket-detail-row">
                    <span class="ticket-detail-label">Business Impact</span>
                </div>
                <p style="color: var(--text-secondary); padding: 0.5rem 0; border-bottom: 1px solid rgba(150, 170, 210, 0.1);">
                    ${ticket.impact}
                </p>
            ` : ''}

            <button class="submit-btn" style="width: 100%; margin-top: 1rem;" onclick="deleteTicket(${ticket.id})">Delete Ticket</button>
        `;

        // Attach status change listener
        const statusSelect = document.querySelector('.status-select');
        statusSelect.addEventListener('change', async (e) => {
            await updateTicket(ticket.id, { status: e.target.value });
            loadTickets();
            loadStats();
        });

        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading ticket detail:', error);
    }
}

// Update Ticket
async function updateTicket(ticketId, updates) {
    try {
        const response = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            loadTickets();
            loadStats();
        }
    } catch (error) {
        console.error('Error updating ticket:', error);
    }
}

// Delete Ticket
async function deleteTicket(ticketId) {
    if (confirm('Are you sure you want to delete this ticket?')) {
        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                modal.classList.remove('active');
                loadTickets();
                loadStats();
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
        }
    }
}

// Filter and Search
function filterTickets() {
    const searchTerm = searchInput.value.toLowerCase();
    const severityFilter = filterSeverity.value;

    filteredTickets = allTickets.filter(ticket => {
        const matchesSearch = 
            ticket.title.toLowerCase().includes(searchTerm) ||
            ticket.description.toLowerCase().includes(searchTerm) ||
            ticket.ticket_id.toLowerCase().includes(searchTerm);

        const matchesSeverity = !severityFilter || ticket.severity === severityFilter;

        return matchesSearch && matchesSeverity;
    });

    renderTickets();
}
