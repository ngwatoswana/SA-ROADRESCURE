/* ==========================================
   ROADRESCUE SA
   TRACK REQUEST SYSTEM
========================================== */

let currentID = localStorage.getItem("currentRequest");
let requests = JSON.parse(localStorage.getItem("requests")) || [];

document.addEventListener("DOMContentLoaded", function() {
    let searchInput = document.getElementById("trackSearchInput");
    if (searchInput && currentID) {
        searchInput.value = currentID;
    }
    loadRequest(currentID);
});

function searchRequest() {
    let input = document.getElementById("trackSearchInput");
    if (input && input.value.trim()) {
        let reqId = input.value.trim();
        loadRequest(reqId);
    }
}

function loadRequest(targetID) {
    requests = JSON.parse(localStorage.getItem("requests")) || [];

    if (!targetID && requests.length > 0) {
        targetID = requests[0].id;
    }

    const request = requests.find(item => item.id === targetID);

    const statusEl = document.getElementById("status");
    const idEl = document.getElementById("requestID");
    const serviceEl = document.getElementById("service");
    const assignedEl = document.getElementById("assigned");
    const dateEl = document.getElementById("date");
    const feedbackEl = document.getElementById("providerFeedback");
    const locationEl = document.getElementById("locationText");
    const photoContainer = document.getElementById("photoPreviewContainer");

    if (!request) {
        statusEl.innerText = "No active request found";
        idEl.innerText = targetID || "-";
        serviceEl.innerText = "-";
        assignedEl.innerText = "Waiting...";
        if (feedbackEl) feedbackEl.innerText = "None";
        if (locationEl) locationEl.innerText = "-";
        if (photoContainer) photoContainer.innerHTML = "";
        updateProgress("Pending");
        return;
    }

    idEl.innerText = request.id;
    serviceEl.innerText = request.service;
    assignedEl.innerText = request.assignedTo || "Waiting for dispatch";
    dateEl.innerText = request.created;
    statusEl.innerText = request.status;

    if (feedbackEl) {
        feedbackEl.innerText = request.providerFeedback || "Waiting for provider feedback...";
    }

    if (locationEl) {
        let mapLink = (request.latitude && request.longitude)
            ? ` <a href="https://www.google.com/maps?q=${request.latitude},${request.longitude}" target="_blank" style="color:#007bff; text-decoration:underline;">📍 View Map</a>`
            : "";
        locationEl.innerHTML = (request.locationText || (request.latitude ? `${request.latitude}, ${request.longitude}` : "Captured")) + mapLink;
    }

    if (photoContainer) {
        if (request.photo) {
            photoContainer.innerHTML = `<strong>Attached Photo:</strong><br><img src="${request.photo}" style="max-width:200px; border-radius:8px; margin-top:5px; border:2px solid #ccc; cursor:pointer;" onclick="window.open('${request.photo}')">`;
        } else {
            photoContainer.innerHTML = "";
        }
    }

    updateProgress(request.status);
}

function updateProgress(status) {
    const steps = document.querySelectorAll(".progress-step");

    steps.forEach(step => {
        step.classList.remove("active");
    });

    if (status === "Pending") {
        if (steps[0]) steps[0].classList.add("active");
    } else if (status === "Accepted" || status === "Assigned") {
        if (steps[0]) steps[0].classList.add("active");
        if (steps[1]) steps[1].classList.add("active");
    } else if (status === "Dispatched" || status === "On The Way") {
        if (steps[0]) steps[0].classList.add("active");
        if (steps[1]) steps[1].classList.add("active");
        if (steps[2]) steps[2].classList.add("active");
    } else if (status === "Completed") {
        steps.forEach(step => {
            step.classList.add("active");
        });
    } else if (status === "Declined") {
        document.getElementById("status").innerText = "❌ Request Declined";
    }
}