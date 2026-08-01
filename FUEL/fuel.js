/* ==========================================
   ROADRESCUE SA
   FUEL DELIVERY DASHBOARD
========================================== */

let requests = JSON.parse(localStorage.getItem("requests")) || [];

loadFuelRequests();

function loadFuelRequests() {
    requests = JSON.parse(localStorage.getItem("requests")) || [];
    let container = document.getElementById("fuelContainer");
    container.innerHTML = "";

    let fuelRequests = requests.filter(r =>
        r.service === "Fuel Delivery" ||
        r.assignedTo === "Fuel Delivery" ||
        (!r.assignedTo && r.status === "Pending" && r.service === "Fuel Delivery")
    );

    if (fuelRequests.length === 0) {
        container.innerHTML = `
            <div class="request-item">
                <h3>No fuel delivery requests</h3>
                <p>Waiting for emergency fuel delivery requests.</p>
            </div>
        `;
        return;
    }

    fuelRequests.forEach(fuel => {
        let mapLink = (fuel.latitude && fuel.longitude)
            ? `<a href="https://www.google.com/maps?q=${fuel.latitude},${fuel.longitude}" target="_blank" class="map-link">📍 Open Google Maps Location</a>`
            : '';

        let photoHtml = fuel.photo
            ? `<div class="photo-box"><p><strong>Location/Vehicle Photo:</strong></p><img src="${fuel.photo}" class="request-img" style="max-width:250px; border-radius:8px; cursor:pointer;" onclick="window.open('${fuel.photo}')"></div>`
            : '';

        let vehicleInfo = [fuel.make, fuel.model, fuel.registration, fuel.colour].filter(Boolean).join(" - ");

        container.innerHTML += `
            <div class="request-item ${fuel.status.toLowerCase()}">
                <div class="item-header">
                    <h2>⛽ Fuel Delivery (${fuel.id})</h2>
                    <span class="badge badge-${fuel.status.toLowerCase().replace(/\s+/g, '-')}">${fuel.status}</span>
                </div>
                <p><strong>Customer:</strong> ${fuel.name} | 📞 <a href="tel:${fuel.phone}">${fuel.phone}</a></p>
                ${vehicleInfo ? `<p><strong>Vehicle:</strong> ${vehicleInfo}</p>` : ''}
                <p><strong>Priority:</strong> ${fuel.priority || 'Medium'}</p>
                <p><strong>Problem / Note:</strong> ${fuel.problem}</p>
                <p><strong>Location:</strong> ${fuel.locationText || 'Shared Coordinates'} ${mapLink}</p>
                ${photoHtml}

                ${fuel.providerFeedback ? `<p><strong>Fuel Delivery Feedback:</strong> ${fuel.providerFeedback}</p>` : ''}

                <div class="feedback-input-group" style="margin-top:10px;">
                    <input type="text" id="fb_${fuel.id}" placeholder="Type feedback message (e.g. Fuel truck dispatched, 10L Petrol, ETA 10m)..." value="${fuel.providerFeedback || ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; margin-bottom:8px;">
                </div>

                <div class="action-buttons" style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn-action accept" onclick="updateFuel('${fuel.id}', 'Accepted')">✅ Accept Request</button>
                    <button class="btn-action dispatch" onclick="updateFuel('${fuel.id}', 'On The Way')">🚚 Delivering Fuel</button>
                    <button class="btn-action complete" onclick="updateFuel('${fuel.id}', 'Completed')">✅ Fuel Delivered</button>
                    <button class="btn-action decline" onclick="updateFuel('${fuel.id}', 'Declined')">❌ Decline</button>
                </div>
            </div>
        `;
    });
}

function updateFuel(id, status) {
    let fbInput = document.getElementById(`fb_${id}`);
    let feedback = fbInput ? fbInput.value.trim() : "";

    let fuel = requests.find(r => r.id === id);
    if (fuel) {
        fuel.status = status;
        fuel.assignedTo = "Fuel Delivery";
        if (feedback) {
            fuel.providerFeedback = feedback;
        } else if (status === "Accepted") {
            fuel.providerFeedback = "Fuel delivery team accepted your request.";
        } else if (status === "On The Way") {
            fuel.providerFeedback = "Fuel delivery vehicle is on the way to your location.";
        }

        localStorage.setItem("requests", JSON.stringify(requests));
        alert(`Fuel request ${id} updated to: ${status}`);
        loadFuelRequests();
    }
}