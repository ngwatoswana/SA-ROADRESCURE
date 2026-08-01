/* ==========================================
   ROADRESCUE SA
   MECHANIC DASHBOARD
========================================== */

let requests = JSON.parse(localStorage.getItem("requests")) || [];

loadJobs();

function loadJobs() {
    requests = JSON.parse(localStorage.getItem("requests")) || [];
    let container = document.getElementById("jobsContainer");
    container.innerHTML = "";

    let jobs = requests.filter(r =>
        r.service === "Mechanic" ||
        r.assignedTo === "Mechanic" ||
        (!r.assignedTo && r.status === "Pending" && r.service === "Mechanic")
    );

    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="request-item">
                <h3>No vehicle assistance requests</h3>
                <p>Waiting for roadside mechanic emergency requests.</p>
            </div>
        `;
        return;
    }

    jobs.forEach(job => {
        let mapLink = (job.latitude && job.longitude)
            ? `<a href="https://www.google.com/maps?q=${job.latitude},${job.longitude}" target="_blank" class="map-link">📍 Open Google Maps</a>`
            : '';

        let photoHtml = job.photo
            ? `<div class="photo-box"><p><strong>Attached Photo:</strong></p><img src="${job.photo}" class="request-img" style="max-width:250px; border-radius:8px; cursor:pointer;" onclick="window.open('${job.photo}')"></div>`
            : '';

        let vehicleInfo = [job.make, job.model, job.registration, job.colour].filter(Boolean).join(" - ");

        container.innerHTML += `
            <div class="request-item ${job.status.toLowerCase()}">
                <div class="item-header">
                    <h2>🔧 Mechanic Request (${job.id})</h2>
                    <span class="badge badge-${job.status.toLowerCase().replace(/\s+/g, '-')}">${job.status}</span>
                </div>
                <p><strong>Customer:</strong> ${job.name} | 📞 <a href="tel:${job.phone}">${job.phone}</a></p>
                ${vehicleInfo ? `<p><strong>Vehicle:</strong> ${vehicleInfo}</p>` : ''}
                <p><strong>Priority:</strong> ${job.priority || 'Medium'}</p>
                <p><strong>Problem Description:</strong> ${job.problem}</p>
                <p><strong>Location:</strong> ${job.locationText || 'Shared Location'} ${mapLink}</p>
                ${photoHtml}

                ${job.providerFeedback ? `<p><strong>Feedback Note:</strong> ${job.providerFeedback}</p>` : ''}

                <div class="feedback-input-group" style="margin-top:10px;">
                    <input type="text" id="fb_${job.id}" placeholder="Type feedback message (e.g. Unit 4 dispatched, ETA 10m)..." value="${job.providerFeedback || ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; margin-bottom:8px;">
                </div>

                <div class="action-buttons" style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn-action accept" onclick="updateJob('${job.id}', 'Accepted')">✅ Accept Request</button>
                    <button class="btn-action dispatch" onclick="updateJob('${job.id}', 'On The Way')">🚗 On The Way</button>
                    <button class="btn-action complete" onclick="updateJob('${job.id}', 'Completed')">✅ Completed</button>
                    <button class="btn-action decline" onclick="updateJob('${job.id}', 'Declined')">❌ Decline</button>
                </div>
            </div>
        `;
    });
}

function updateJob(id, status) {
    let fbInput = document.getElementById(`fb_${id}`);
    let feedback = fbInput ? fbInput.value.trim() : "";

    let job = requests.find(r => r.id === id);
    if (job) {
        job.status = status;
        job.assignedTo = "Mechanic";
        if (feedback) {
            job.providerFeedback = feedback;
        } else if (status === "Accepted") {
            job.providerFeedback = "Mechanic accepted your request.";
        } else if (status === "On The Way") {
            job.providerFeedback = "Mechanic is on the way to your location.";
        }

        localStorage.setItem("requests", JSON.stringify(requests));
        alert(`Request ${id} updated to: ${status}`);
        loadJobs();
    }
}