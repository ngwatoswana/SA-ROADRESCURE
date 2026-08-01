/* ==========================================
   ROADRESCUE SA
   FIRE RESCUE DASHBOARD
========================================== */

let requests = JSON.parse(localStorage.getItem("requests")) || [];

loadFireCases();

function loadFireCases() {
    requests = JSON.parse(localStorage.getItem("requests")) || [];
    let container = document.getElementById("fireContainer");
    container.innerHTML = "";

    let fireCases = requests.filter(r =>
        r.service === "Fire Rescue" ||
        r.assignedTo === "Fire Rescue" ||
        (!r.assignedTo && r.status === "Pending" && r.service === "Fire Rescue")
    );

    if (fireCases.length === 0) {
        container.innerHTML = `
            <div class="request-item">
                <h3>No fire rescue requests</h3>
                <p>Waiting for assigned fire and rescue emergency calls.</p>
            </div>
        `;
        return;
    }

    fireCases.forEach(fire => {
        let mapLink = (fire.latitude && fire.longitude)
            ? `<a href="https://www.google.com/maps?q=${fire.latitude},${fire.longitude}" target="_blank" class="map-link">📍 Open Google Maps Incident Location</a>`
            : '';

        let photoHtml = fire.photo
            ? `<div class="photo-box"><p><strong>Fire Scene Photo:</strong></p><img src="${fire.photo}" class="request-img" style="max-width:250px; border-radius:8px; cursor:pointer;" onclick="window.open('${fire.photo}')"></div>`
            : '';

        container.innerHTML += `
            <div class="request-item ${fire.status.toLowerCase()}">
                <div class="item-header">
                    <h2>🔥 Fire & Rescue (${fire.id})</h2>
                    <span class="badge badge-${fire.status.toLowerCase().replace(/\s+/g, '-')}">${fire.status}</span>
                </div>
                <p><strong>Caller Name:</strong> ${fire.name} | 📞 <a href="tel:${fire.phone}">${fire.phone}</a></p>
                <p><strong>Priority:</strong> <span class="priority-${(fire.priority||'critical').toLowerCase()}">${fire.priority || 'Critical'}</span></p>
                <p><strong>Emergency Description:</strong> ${fire.problem}</p>
                <p><strong>Location:</strong> ${fire.locationText || 'Shared Coordinates'} ${mapLink}</p>
                ${photoHtml}

                ${fire.providerFeedback ? `<p><strong>Rescue Team Feedback:</strong> ${fire.providerFeedback}</p>` : ''}

                <div class="feedback-input-group" style="margin-top:10px;">
                    <input type="text" id="fb_${fire.id}" placeholder="Type feedback message (e.g. Fire engine dispatched, ETA 5m)..." value="${fire.providerFeedback || ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; margin-bottom:8px;">
                </div>

                <div class="action-buttons" style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn-action accept" onclick="updateFire('${fire.id}', 'Accepted')">✅ Accept Call</button>
                    <button class="btn-action dispatch" onclick="updateFire('${fire.id}', 'On The Way')">🚒 Fire Truck Dispatched</button>
                    <button class="btn-action complete" onclick="updateFire('${fire.id}', 'Completed')">✅ Fire Extinguished / Rescue Done</button>
                    <button class="btn-action decline" onclick="updateFire('${fire.id}', 'Declined')">❌ Decline</button>
                </div>
            </div>
        `;
    });
}

function updateFire(id, status) {
    let fbInput = document.getElementById(`fb_${id}`);
    let feedback = fbInput ? fbInput.value.trim() : "";

    let fire = requests.find(r => r.id === id);
    if (fire) {
        fire.status = status;
        fire.assignedTo = "Fire Rescue";
        if (feedback) {
            fire.providerFeedback = feedback;
        } else if (status === "Accepted") {
            fire.providerFeedback = "Fire Rescue team accepted your emergency request.";
        } else if (status === "On The Way") {
            fire.providerFeedback = "Fire response team is dispatched and en route.";
        }

        localStorage.setItem("requests", JSON.stringify(requests));
        alert(`Fire rescue status updated for ${id}: ${status}`);
        loadFireCases();
    }
}