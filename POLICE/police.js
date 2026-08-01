/* ==========================================
   ROADRESCUE SA
   POLICE DASHBOARD
========================================== */

let requests = JSON.parse(localStorage.getItem("requests")) || [];

loadPoliceCases();

function loadPoliceCases() {
    requests = JSON.parse(localStorage.getItem("requests")) || [];
    let container = document.getElementById("policeContainer");
    container.innerHTML = "";

    let cases = requests.filter(r =>
        r.service === "Police" ||
        r.assignedTo === "Police" ||
        (!r.assignedTo && r.status === "Pending" && r.service === "Police")
    );

    if (cases.length === 0) {
        container.innerHTML = `
            <div class="request-item">
                <h3>No police emergency reports</h3>
                <p>Waiting for assigned police/accident incident reports.</p>
            </div>
        `;
        return;
    }

    cases.forEach(caseItem => {
        let mapLink = (caseItem.latitude && caseItem.longitude)
            ? `<a href="https://www.google.com/maps?q=${caseItem.latitude},${caseItem.longitude}" target="_blank" class="map-link">📍 Open Google Maps Location</a>`
            : '';

        let photoHtml = caseItem.photo
            ? `<div class="photo-box"><p><strong>Accident Scene Photo:</strong></p><img src="${caseItem.photo}" class="request-img" style="max-width:250px; border-radius:8px; cursor:pointer;" onclick="window.open('${caseItem.photo}')"></div>`
            : '';

        let vehicleInfo = [caseItem.make, caseItem.model, caseItem.registration, caseItem.colour].filter(Boolean).join(" - ");

        container.innerHTML += `
            <div class="request-item ${caseItem.status.toLowerCase()}">
                <div class="item-header">
                    <h2>👮 Police Emergency (${caseItem.id})</h2>
                    <span class="badge badge-${caseItem.status.toLowerCase().replace(/\s+/g, '-')}">${caseItem.status}</span>
                </div>
                <p><strong>Reporter Name:</strong> ${caseItem.name} | 📞 <a href="tel:${caseItem.phone}">${caseItem.phone}</a></p>
                ${vehicleInfo ? `<p><strong>Vehicle:</strong> ${vehicleInfo}</p>` : ''}
                <p><strong>Priority Level:</strong> ${caseItem.priority || 'Medium'}</p>
                <p><strong>Incident Description:</strong> ${caseItem.problem}</p>
                <p><strong>Location:</strong> ${caseItem.locationText || 'Shared Coordinates'} ${mapLink}</p>
                ${photoHtml}

                ${caseItem.providerFeedback ? `<p><strong>Police Feedback:</strong> ${caseItem.providerFeedback}</p>` : ''}

                <div class="feedback-input-group" style="margin-top:10px;">
                    <input type="text" id="fb_${caseItem.id}" placeholder="Type feedback message (e.g. Officers dispatched, ETA 8 mins)..." value="${caseItem.providerFeedback || ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; margin-bottom:8px;">
                </div>

                <div class="action-buttons" style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn-action accept" onclick="updatePolice('${caseItem.id}', 'Accepted')">✅ Accept Case</button>
                    <button class="btn-action dispatch" onclick="updatePolice('${caseItem.id}', 'On The Way')">🚓 Officers Dispatched</button>
                    <button class="btn-action complete" onclick="updatePolice('${caseItem.id}', 'Completed')">✅ Case Closed</button>
                    <button class="btn-action decline" onclick="updatePolice('${caseItem.id}', 'Declined')">❌ Decline Case</button>
                </div>
            </div>
        `;
    });
}

function updatePolice(id, status) {
    let fbInput = document.getElementById(`fb_${id}`);
    let feedback = fbInput ? fbInput.value.trim() : "";

    let policeCase = requests.find(r => r.id === id);
    if (policeCase) {
        policeCase.status = status;
        policeCase.assignedTo = "Police";
        if (feedback) {
            policeCase.providerFeedback = feedback;
        } else if (status === "Accepted") {
            policeCase.providerFeedback = "Police team accepted your emergency request.";
        } else if (status === "On The Way") {
            policeCase.providerFeedback = "Police units are en route to your incident location.";
        }

        localStorage.setItem("requests", JSON.stringify(requests));
        alert(`Police case ${id} updated to: ${status}`);
        loadPoliceCases();
    }
}