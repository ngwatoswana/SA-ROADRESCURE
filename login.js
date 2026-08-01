/* ==========================================
   ROADRESCUE SA
   LOGIN SYSTEM
========================================== */

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let role = document.getElementById("role").value;

    /* Demo accounts */
    let users = {
        admin: {
            username: "admin",
            password: "1234",
            page: "../admin/admin.html"
        },
        mechanic: {
            username: "mechanic",
            password: "1234",
            page: "../mechanic/mechanic.html"
        },
        hospital: {
            username: "hospital",
            password: "1234",
            page: "../hospital/hospital.html"
        },
        police: {
            username: "police",
            password: "1234",
            page: "../police/police.html"
        },
        towing: {
            username: "powing",
            password: "1234",
            page: "../towing/towing.html"
        },
        fire: {
            username: "fire",
            password: "1234",
            page: "../fire-rescue/fire-rescue.html"
        },
        fuel: {
            username: "madileng",
            password: "1504swana",
            page: "../fuel/fuel.html"
        }
    };

    let account = users[role];

    if (account && username.toLowerCase() === account.username && password === account.password) {
        localStorage.setItem("userRole", role);
        localStorage.setItem("userLoggedIn", "true");
        window.location.href = account.page;
    } else {
        document.getElementById("loginMessage").innerText = "❌ Invalid username or password for selected role.";
    }
});