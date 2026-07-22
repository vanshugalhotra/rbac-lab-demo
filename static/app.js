const API_BASE = "";

function getToken() {
    return localStorage.getItem("token");
}

/* ----------------------- */
/* Utility Render Helpers  */
/* ----------------------- */

function setStatus(text, success = true) {

    const badge = document.getElementById("statusBadge");

    badge.innerText = text;

    badge.style.background = success ? "#dcfce7" : "#fee2e2";
    badge.style.color = success ? "#166534" : "#991b1b";

}

function renderLoading() {

    document.getElementById("responseArea").innerHTML = `
        <div class="placeholder">
            <div class="placeholder-icon">⏳</div>
            <h3>Loading...</h3>
        </div>
    `;

}

function renderError(message) {

    setStatus("Error", false);

    document.getElementById("responseArea").innerHTML = `
        <div class="alert error">

            ❌ ${message}

        </div>
    `;

}

function renderSuccess(message) {

    setStatus("Success");

    document.getElementById("responseArea").innerHTML = `
        <div class="alert success">

            ✅ ${message}

        </div>
    `;

}

/* ----------------------- */
/* Dashboard Init          */
/* ----------------------- */

async function initializeDashboard() {

    await loadProfile();

    await loadPermissions();

}

/* ----------------------- */
/* Profile                 */
/* ----------------------- */

async function loadProfile() {

    const token = getToken();

    if (!token) {

        window.location.href = "/static/login.html";

        return;

    }

    const response = await fetch(`${API_BASE}/me`, {

        headers: {

            Authorization: `Bearer ${token}`

        }

    });

    if (!response.ok) {

        logout();

        return;

    }

    const user = await response.json();

    document.getElementById("welcome").innerText =
        user.username;

    document.getElementById("role").innerText =
        user.role.toUpperCase();

}

async function getProfile() {

    renderLoading();

    const response = await fetch(`${API_BASE}/me`, {

        headers: {

            Authorization: `Bearer ${getToken()}`

        }

    });

    const data = await response.json();

    if (!response.ok) {

        renderError(data.detail);

        return;

    }

    setStatus("200 OK");

    document.getElementById("responseArea").innerHTML = `

        <div class="profile-view">

            <div class="profile-item">

                <strong>Username</strong>

                ${data.username}

            </div>

            <div class="profile-item">

                <strong>Email</strong>

                ${data.email}

            </div>

            <div class="profile-item">

                <strong>Role</strong>

                ${data.role}

            </div>

        </div>

    `;

}

/* ----------------------- */
/* Permissions             */
/* ----------------------- */

async function loadPermissions() {

    const response = await fetch(`${API_BASE}/permissions`, {

        headers: {

            Authorization: `Bearer ${getToken()}`

        }

    });

    const data = await response.json();

    const container = document.getElementById("permissions");

    container.innerHTML = "";

    data.permissions.forEach(permission => {

        container.innerHTML += `

            <span class="permission-chip">

                ✓ ${permission}

            </span>

        `;

    });

}

/* ----------------------- */
/* Users                   */
/* ----------------------- */

async function getUsers() {

    renderLoading();

    const response = await fetch(`${API_BASE}/users`, {

        headers: {

            Authorization: `Bearer ${getToken()}`

        }

    });

    const data = await response.json();

    if (!response.ok) {

        renderError(data.detail);

        return;

    }

    setStatus("200 OK");

    let html = `

        <table>

            <thead>

                <tr>

                    <th>Username</th>

                    <th>Email</th>

                    <th>Role</th>

                </tr>

            </thead>

            <tbody>

    `;

    data.forEach(user => {

        html += `

            <tr>

                <td>${user.username}</td>

                <td>${user.email}</td>

                <td>${user.role}</td>

            </tr>

        `;

    });

    html += `

            </tbody>

        </table>

    `;

    document.getElementById("responseArea").innerHTML = html;

}

/* ----------------------- */
/* Announcements           */
/* ----------------------- */

async function getAnnouncements() {

    renderLoading();

    const response = await fetch(`${API_BASE}/announcements`, {

        headers: {

            Authorization: `Bearer ${getToken()}`

        }

    });

    const data = await response.json();

    if (!response.ok) {

        renderError(data.detail);

        return;

    }

    setStatus("200 OK");

    let html = "";

    data.forEach(item => {

        html += `

            <div class="announcement">

                <h3>

                    📢 ${item.title}

                </h3>

                <p>

                    ${item.content}

                </p>

                <small>

                    Created by: ${item.created_by}

                </small>

            </div>

        `;

    });

    document.getElementById("responseArea").innerHTML = html;

}

/* ----------------------- */
/* Create Announcement     */
/* ----------------------- */

async function createAnnouncement() {

    const title =
        document.getElementById("announcementTitle").value.trim();

    const content =
        document.getElementById("announcementContent").value.trim();

    if (!title || !content) {

        renderError("Please fill all fields.");

        return;

    }

    renderLoading();

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

    if (!response.ok) {

        renderError(data.detail);

        return;

    }

    document.getElementById("announcementTitle").value = "";

    document.getElementById("announcementContent").value = "";

    renderSuccess("Announcement created successfully!");

}

/* ----------------------- */
/* Login                   */
/* ----------------------- */

async function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

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

    localStorage.setItem(
        "token",
        data.access_token
    );

    window.location.href =
        "/static/dashboard.html";

}

/* ----------------------- */
/* Signup                  */
/* ----------------------- */

async function signup() {

    const username =
        document.getElementById("username").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const role =
        document.getElementById("role").value;

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

    alert("Account created successfully!");

    window.location.href =
        "/static/login.html";

}

/* ----------------------- */
/* Logout                  */
/* ----------------------- */

function logout() {

    localStorage.removeItem("token");

    window.location.href =
        "/static/login.html";

}
