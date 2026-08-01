/* ==========================================
   ROADRESCUE SA
   TOWING DASHBOARD
========================================== */

let requests = JSON.parse(localStorage.getItem("requests")) || [];

loadTowingJobs();

function loadTowingJobs() {
    requests = JSON.parse(localStorage.getItem("requests")) || [];
    let container = document.getElementById("towingContainer");
    container.innerHTML = "";

    let jobs = requests.filter(r =>
        r.service === "Towing" ||
        r.assignedTo === "Towing" ||
        (!r.assignedTo && r.status === "Pending" && r.service === "Towing")
    );

    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="request-item">
                <h3>No towing requests</h3>
                <p>Waiting for assigned vehicle recovery & towing requests.</p>
            </div>
        `;
        return;
    }

    jobs.forEach(job => {
        let mapLink = (job.latitude && job.longitude)
            ? `<a href="https://www.google.com/maps?q=${job.latitude},${job.longitude}" target="_blank" class="map-link">📍 Open Google Maps Pickup Location</a>`
            : '';

        let photoHtml = job.photo
            ? `<div class="photo-box"><p><strong>Vehicle Condition Photo:</strong></p><img src="${job.photo}" class="request-img" style="max-width:250px; border-radius:8px; cursor:pointer;" onclick="window.open('${job.photo}')"></div>`
            : '';

        let vehicleInfo = [job.make, job.model, job.registration, job.colour].filter(Boolean).join(" - ");

        container.innerHTML += `
            <div class="request-item ${job.status.toLowerCase()}">
                <div class="item-header">
                    <h2>🚛 Towing & Recovery (${job.id})</h2>
                    <span class="badge badge-${job.status.toLowerCase().replace(/\s+/g, '-')}">${job.status}</span>
                </div>
                <p><strong>Customer:</strong> ${job.name} | 📞 <a href="tel:${job.phone}">${job.phone}</a></p>
                ${vehicleInfo ? `<p><strong>Vehicle Details:</strong> ${vehicleInfo}</p>` : ''}
                <p><strong>Priority:</strong> ${job.priority || 'Medium'}</p>
                <p><strong>Problem Description:</strong> ${job.problem}</p>
                <p><strong>Pickup Location:</strong> ${job.locationText || 'Shared Coordinates'} ${mapLink}</p>
                ${photoHtml}

                ${job.providerFeedback ? `<p><strong>Towing Feedback:</strong> ${job.providerFeedback}</p>` : ''}

                <div class="feedback-input-group" style="margin-top:10px;">
                    <input type="text" id="fb_${job.id}" placeholder="Type feedback message (e.g. Tow truck dispatched, ETA 15m)..." value="${job.providerFeedback || ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; margin-bottom:8px;">
                </div>

                <div class="action-buttons" style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn-action accept" onclick="updateTowing('${job.id}', 'Accepted')">✅ Accept Job</button>
                    <button class="btn-action dispatch" onclick="updateTowing('${job.id}', 'On The Way')">🚛 Tow Truck Dispatched</button>
                    <button class="btn-action complete" onclick="updateTowing('${job.id}', 'Completed')">✅ Vehicle Towed</button>
                    <button class="btn-action decline" onclick="updateTowing('${job.id}', 'Declined')">❌ Decline Job</button>
                </div>
            </div>
        `;
    });
}

function updateTowing(id, status) {
    let fbInput = document.getElementById(`fb_${id}`);
    let feedback = fbInput ? fbInput.value.trim() : "";

    let job = requests.find(r => r.id === id);
    if (job) {
        job.status = status;
        job.assignedTo = "Towing";
        if (feedback) {
            job.providerFeedback = feedback;
        } else if (status === "Accepted") {
            job.providerFeedback = "Towing service accepted your request.";
        } else if (status === "On The Way") {
            job.providerFeedback = "Tow truck is heading to your pickup location.";
        }

        localStorage.setItem("requests", JSON.stringify(requests));
        alert(`Towing job ${id} updated to: ${status}`);
        loadTowingJobs();
    }
}