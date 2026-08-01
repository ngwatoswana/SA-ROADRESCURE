/* ==========================================
   ROADRESCUE SA
   ADMIN DASHBOARD
========================================== */

let requests = JSON.parse(localStorage.getItem("requests")) || [];
let currentFilter = "All";
let selectedRequestIndex = null;

loadDashboard();

function filterRequests(filterType, btn) {
    currentFilter = filterType;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    loadDashboard();
}

function loadDashboard() {
    requests = JSON.parse(localStorage.getItem("requests")) || [];

    document.getElementById("totalRequests").innerText = requests.length;
    document.getElementById("pendingRequests").innerText = requests.filter(r => r.status === "Pending").length;
    document.getElementById("activeRequests").innerText = requests.filter(r => r.status !== "Completed" && r.status !== "Declined").length;

    let container = document.getElementById("requestsContainer");
    container.innerHTML = "";

    let filtered = requests;
    if (currentFilter !== "All") {
        filtered = requests.filter(r =>
            r.service === currentFilter ||
            r.assignedTo === currentFilter ||
            (r.service && r.service.includes(currentFilter))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="request-item"><p>No emergency requests found for category: <strong>${currentFilter}</strong>.</p></div>`;
        return;
    }

    filtered.forEach((request) => {
        let actualIndex = requests.findIndex(r => r.id === request.id);

        let mapLink = "";
        if (request.latitude && request.longitude) {
            mapLink = `<a href="https://www.google.com/maps?q=${request.latitude},${request.longitude}" target="_blank" class="map-link">📍 View Map Location</a>`;
        }

        let photoPreview = "";
        if (request.photo) {
            photoPreview = `<div class="photo-thumb-container"><img src="${request.photo}" class="request-photo-thumb" alt="Accident Photo" onclick="openPhotoModal('${request.photo}')"></div>`;
        }

        let locationInfo = request.locationText || (request.latitude ? `${request.latitude}, ${request.longitude}` : "Not shared");

        container.innerHTML += `
            <div class="request-item ${request.status.toLowerCase()}">
                <div class="item-header">
                    <h3>🚨 ${request.service} (${request.id})</h3>
                    <span class="badge badge-${request.status.toLowerCase().replace(/\s+/g, '-')}">${request.status}</span>
                </div>
                <p><strong>Customer:</strong> ${request.name} | 📞 <a href="tel:${request.phone}">${request.phone}</a></p>
                <p><strong>Priority:</strong> <span class="priority-${(request.priority||'medium').toLowerCase()}">${request.priority || 'Medium'}</span></p>
                <p><strong>Problem:</strong> ${request.problem}</p>
                <p><strong>Location:</strong> ${locationInfo} ${mapLink}</p>
                ${photoPreview}
                ${request.providerFeedback ? `<p><strong>Feedback:</strong> ${request.providerFeedback}</p>` : ''}
                <p><strong>Date:</strong> ${request.created}</p>

                <div class="action-buttons">
                    <button class="btn-action view" onclick="viewRequest(${actualIndex})">Dispatch / Manage</button>
                    <button class="btn-action delete" onclick="deleteRequest('${request.id}')">Delete</button>
                </div>
            </div>
        `;
    });
}

function viewRequest(index) {
    selectedRequestIndex = index;
    let r = requests[index];
    let panel = document.getElementById("dispatchPanel");

    let mapLink = (r.latitude && r.longitude) ? `<br><a href="https://www.google.com/maps?q=${r.latitude},${r.longitude}" target="_blank">📍 Open in Google Maps</a>` : '';
    let photoHtml = r.photo ? `<br><img src="${r.photo}" style="max-width:100%; max-height:200px; border-radius:8px; margin-top:10px;">` : '';

    panel.innerHTML = `
        <h2>🚑 Dispatch & Manage Request</h2>
        <p><strong>Request ID:</strong> ${r.id}</p>
        <p><strong>Customer:</strong> ${r.name} (${r.phone})</p>
        <p><strong>Service Needed:</strong> ${r.service}</p>
        <p><strong>Problem:</strong> ${r.problem}</p>
        <p><strong>Location:</strong> ${r.locationText || 'Captured'} ${mapLink}</p>
        ${photoHtml}

        <h3 style="margin-top:15px;">Assign Service Provider</h3>
        <div class="dispatch-buttons" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:15px;">
            <button onclick="dispatch('Mechanic')" class="btn-dept">🔧 Mechanic</button>
            <button onclick="dispatch('Hospital')" class="btn-dept">🚑 Hospital</button>
            <button onclick="dispatch('Police')" class="btn-dept">👮 Police</button>
            <button onclick="dispatch('Towing')" class="btn-dept">🚛 Towing</button>
            <button onclick="dispatch('Fire Rescue')" class="btn-dept">🔥 Fire Rescue</button>
            <button onclick="dispatch('Fuel Delivery')" class="btn-dept">⛽ Fuel Delivery</button>
        </div>

        <h3>Provider Feedback / Note</h3>
        <input type="text" id="adminFeedback" placeholder="e.g. Dispatched Unit #12, ETA 15 mins..." value="${r.providerFeedback || ''}" style="width:100%; padding:8px; margin-bottom:10px; border-radius:5px; border:1px solid #ccc;">

        <h3>Update Request Status</h3>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <select id="statusSelect" class="status-select" style="padding:8px; border-radius:5px;">
                <option value="Pending" ${r.status==='Pending'?'selected':''}>Pending</option>
                <option value="Accepted" ${r.status==='Accepted'?'selected':''}>Accepted</option>
                <option value="Assigned" ${r.status==='Assigned'?'selected':''}>Assigned</option>
                <option value="On The Way" ${r.status==='On The Way'?'selected':''}>On The Way</option>
                <option value="Completed" ${r.status==='Completed'?'selected':''}>Completed</option>
                <option value="Declined" ${r.status==='Declined'?'selected':''}>Declined</option>
            </select>
            <button onclick="saveStatusAndFeedback()" class="btn-primary" style="padding:8px 15px;">Save Changes</button>
        </div>
    `;

    panel.scrollIntoView({ behavior: 'smooth' });
}

function dispatch(service) {
    if (selectedRequestIndex === null) return;
    let r = requests[selectedRequestIndex];
    r.assignedTo = service;
    r.status = "Assigned";
    let fb = document.getElementById("adminFeedback");
    if (fb && fb.value.trim()) {
        r.providerFeedback = fb.value.trim();
    } else {
        r.providerFeedback = `Assigned to ${service}.`;
    }

    localStorage.setItem("requests", JSON.stringify(requests));
    alert(`${service} has been assigned to request ${r.id}.`);
    loadDashboard();
    viewRequest(selectedRequestIndex);
}

function saveStatusAndFeedback() {
    if (selectedRequestIndex === null) return;
    let r = requests[selectedRequestIndex];
    let status = document.getElementById("statusSelect").value;
    let feedback = document.getElementById("adminFeedback").value.trim();

    r.status = status;
    r.providerFeedback = feedback;

    localStorage.setItem("requests", JSON.stringify(requests));
    alert(`Request ${r.id} updated to ${status}.`);
    loadDashboard();
    viewRequest(selectedRequestIndex);
}

function deleteRequest(id) {
    if (confirm("Are you sure you want to delete request " + id + "?")) {
        requests = requests.filter(r => r.id !== id);
        localStorage.setItem("requests", JSON.stringify(requests));
        loadDashboard();
        document.getElementById("dispatchPanel").innerHTML = "<h2>🚑 Dispatch Emergency Service</h2><p>Select a request first.</p>";
    }
}

function openPhotoModal(src) {
    let w = window.open("");
    w.document.write(`<img src="${src}" style="max-width:100%; height:auto; display:block; margin:20px auto;">`);
}