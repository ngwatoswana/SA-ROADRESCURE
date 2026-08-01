/* ==========================================
   ROADRESCUE SA
   HOSPITAL DASHBOARD
========================================== */

let requests = JSON.parse(localStorage.getItem("requests")) || [];

loadMedicalCases();

function loadMedicalCases() {
    requests = JSON.parse(localStorage.getItem("requests")) || [];
    let container = document.getElementById("medicalContainer");
    container.innerHTML = "";

    let cases = requests.filter(r =>
        r.service === "Hospital" ||
        r.assignedTo === "Hospital" ||
        (!r.assignedTo && r.status === "Pending" && r.service === "Hospital")
    );

    if (cases.length === 0) {
        container.innerHTML = `
            <div class="request-item">
                <h3>No medical emergencies</h3>
                <p>Waiting for ambulance and hospital emergency requests.</p>
            </div>
        `;
        return;
    }

    cases.forEach(caseItem => {
        let mapLink = (caseItem.latitude && caseItem.longitude)
            ? `<a href="https://www.google.com/maps?q=${caseItem.latitude},${caseItem.longitude}" target="_blank" class="map-link">📍 Open Google Maps Medical Location</a>`
            : '';

        let photoHtml = caseItem.photo
            ? `<div class="photo-box"><p><strong>Patient / Emergency Photo:</strong></p><img src="${caseItem.photo}" class="request-img" style="max-width:250px; border-radius:8px; cursor:pointer;" onclick="window.open('${caseItem.photo}')"></div>`
            : '';

        container.innerHTML += `
            <div class="request-item ${caseItem.status.toLowerCase()}">
                <div class="item-header">
                    <h2>🚑 Medical Emergency (${caseItem.id})</h2>
                    <span class="badge badge-${caseItem.status.toLowerCase().replace(/\s+/g, '-')}">${caseItem.status}</span>
                </div>
                <p><strong>Patient / Contact Name:</strong> ${caseItem.name} | 📞 <a href="tel:${caseItem.phone}">${caseItem.phone}</a></p>
                <p><strong>Priority:</strong> <span class="priority-${(caseItem.priority||'medium').toLowerCase()}">${caseItem.priority || 'Medium'}</span></p>
                <p><strong>Medical Details:</strong> ${caseItem.problem}</p>
                <p><strong>Location:</strong> ${caseItem.locationText || 'Shared Location'} ${mapLink}</p>
                ${photoHtml}

                ${caseItem.providerFeedback ? `<p><strong>Hospital Feedback:</strong> ${caseItem.providerFeedback}</p>` : ''}

                <div class="feedback-input-group" style="margin-top:10px;">
                    <input type="text" id="fb_${caseItem.id}" placeholder="Type medical response (e.g. Ambulance #2 dispatched, ETA 6m)..." value="${caseItem.providerFeedback || ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; margin-bottom:8px;">
                </div>

                <div class="action-buttons" style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn-action accept" onclick="updateMedical('${caseItem.id}', 'Accepted')">✅ Accept Case</button>
                    <button class="btn-action dispatch" onclick="updateMedical('${caseItem.id}', 'On The Way')">🚑 Ambulance Dispatched</button>
                    <button class="btn-action complete" onclick="updateMedical('${caseItem.id}', 'Completed')">✅ Patient Handled</button>
                    <button class="btn-action decline" onclick="updateMedical('${caseItem.id}', 'Declined')">❌ Decline</button>
                </div>
            </div>
        `;
    });
}

function updateMedical(id, status) {
    let fbInput = document.getElementById(`fb_${id}`);
    let feedback = fbInput ? fbInput.value.trim() : "";

    let medicalCase = requests.find(r => r.id === id);
    if (medicalCase) {
        medicalCase.status = status;
        medicalCase.assignedTo = "Hospital";
        if (feedback) {
            medicalCase.providerFeedback = feedback;
        } else if (status === "Accepted") {
            medicalCase.providerFeedback = "Hospital emergency team accepted your call.";
        } else if (status === "On The Way") {
            medicalCase.providerFeedback = "Ambulance is en route to your medical location.";
        }

        localStorage.setItem("requests", JSON.stringify(requests));
        alert(`Medical case ${id} updated to: ${status}`);
        loadMedicalCases();
    }
}