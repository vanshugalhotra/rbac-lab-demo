const API_BASE = "";

function getToken() {
    return localStorage.getItem("token");
}

function show(method, endpoint, status, data) {

    document.getElementById("method").innerText = method;
    document.getElementById("endpoint").innerText = endpoint;
    document.getElementById("status").innerText = status;
    document.getElementById("output").textContent =
        JSON.stringify(data, null, 4);

}

async function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_BASE}/login`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username,
            password
        })

    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail);
        return;
    }

    localStorage.setItem("token", data.access_token);

    window.location.href = "dashboard.html";

}

async function initializeDashboard() {

    await loadProfile();
    await loadPermissions();

}

async function loadProfile() {

    const token = getToken();

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const response = await fetch(`${API_BASE}/me`, {

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    if (!response.ok) {

        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;

    }

    const user = await response.json();

    document.getElementById("welcome").innerText =
        `Welcome, ${user.username}`;

    document.getElementById("role").innerText =
        `Role : ${user.role}`;

}

async function loadPermissions() {

    const response = await fetch(`${API_BASE}/permissions`, {

        headers: {
            Authorization: `Bearer ${getToken()}`
        }

    });

    const data = await response.json();

    const ul = document.getElementById("permissions");

    ul.innerHTML = "";

    data.permissions.forEach(permission => {

        const li = document.createElement("li");

        li.innerText = "✅ " + permission;

        ul.appendChild(li);

    });

}

async function getProfile() {

    const response = await fetch(`${API_BASE}/me`, {

        headers: {
            Authorization: `Bearer ${getToken()}`
        }

    });

    const data = await response.json();

    show(
        "GET",
        "/me",
        response.status,
        data
    );

}

async function getUsers() {

    const response = await fetch(`${API_BASE}/users`, {

        headers: {
            Authorization: `Bearer ${getToken()}`
        }

    });

    const data = await response.json();

    show(
        "GET",
        "/users",
        response.status,
        data
    );

}

async function getAnnouncements() {

    const response = await fetch(`${API_BASE}/announcements`, {

        headers: {
            Authorization: `Bearer ${getToken()}`
        }

    });

    const data = await response.json();

    show(
        "GET",
        "/announcements",
        response.status,
        data
    );

}

async function createAnnouncement() {

    const title = document.getElementById("announcementTitle").value.trim();

    const content = document.getElementById("announcementContent").value.trim();

    const response = await fetch(`${API_BASE}/announcements`, {

        method: "POST",

        headers: {

            "Content-Type": "application/json",

            Authorization: `Bearer ${getToken()}`

        },

        body: JSON.stringify({

            title,
            content

        })

    });

    const data = await response.json();

    show(
        "POST",
        "/announcements",
        response.status,
        data
    );

    if (response.ok) {

        document.getElementById("announcementTitle").value = "";
        document.getElementById("announcementContent").value = "";

    }

}

function logout() {

    localStorage.removeItem("token");

    window.location.href = "login.html";

}

async function signup() {

    const username = document.getElementById("username").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const role = document.getElementById("role").value;

    const response = await fetch(`${API_BASE}/signup`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            username,
            email,
            password,
            role

        })

    });

    const data = await response.json();

    if (!response.ok) {

        alert(data.detail);

        return;

    }

    alert("Account created successfully! Please login.");

    window.location.href = "login.html";

}