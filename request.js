/* ==========================================
   ROADRESCUE SA
   EMERGENCY REQUEST SYSTEM
========================================== */

let latitude = "";
let longitude = "";
let photoData = "";

/* ==========================
   GET LOCATION
========================== */
function getLocation() {
    const status = document.getElementById("locationStatus");

    if (!navigator.geolocation) {
        status.innerHTML = "❌ Geolocation is not supported by your browser.";
        return;
    }

    status.innerHTML = "📍 Capturing GPS location...";

    navigator.geolocation.getCurrentPosition(
        function(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            status.innerHTML = `✅ GPS Captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        },
        function(error) {
            status.innerHTML = "❌ Unable to capture GPS. You can enter an address manually below.";
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

/* ==========================
   PHOTO PREVIEW
========================== */
document.getElementById("photo").addEventListener("change", function() {
    const file = this.files[0];
    const preview = document.getElementById("preview");

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            photoData = e.target.result;
            preview.src = photoData;
            preview.style.display = "block";
        };

        reader.readAsDataURL(file);
    }
});

/* ==========================
   SUBMIT REQUEST
========================== */
document.getElementById("emergencyForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const selectedServiceEl = document.querySelector('input[name="service"]:checked');
    const service = selectedServiceEl ? selectedServiceEl.value : "General Emergency";

    const addressInput = document.getElementById("locationAddress");
    const locationText = addressInput ? addressInput.value.trim() : "";

    const request = {
        id: "RR" + Math.floor(100000 + Math.random() * 900000),
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        service: service,
        make: document.getElementById("make") ? document.getElementById("make").value.trim() : "",
        model: document.getElementById("model") ? document.getElementById("model").value.trim() : "",
        registration: document.getElementById("registration") ? document.getElementById("registration").value.trim() : "",
        colour: document.getElementById("colour") ? document.getElementById("colour").value.trim() : "",
        priority: document.getElementById("priority") ? document.getElementById("priority").value : "Medium",
        problem: document.getElementById("problem").value.trim(),
        latitude: latitude,
        longitude: longitude,
        locationText: locationText,
        photo: photoData,
        status: "Pending",
        assignedTo: "",
        providerFeedback: "",
        created: new Date().toLocaleString()
    };

    let requests = JSON.parse(localStorage.getItem("requests")) || [];
    requests.unshift(request); // Newest requests first

    localStorage.setItem("requests", JSON.stringify(requests));
    localStorage.setItem("currentRequest", request.id);

    alert("🚨 Emergency request submitted successfully! Tracking ID: " + request.id);
    window.location.href = "track.html";
});