document.addEventListener("DOMContentLoaded", () => {
    const storedUserId = "gablyraemerson";
    const storedPassword = "gablyraemerson";

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const enteredUserId = document.getElementById("userid").value.trim();
            const enteredPassword = document.getElementById("password").value.trim();

            if (enteredUserId === storedUserId && enteredPassword === storedPassword) {
                localStorage.setItem("admin-logged-in", "true");
                window.location.href = "admin.html";
            } else {
                document.getElementById("error-message").style.display = "block";
            }
        });
    }

    if (window.location.pathname.endsWith("admin.html")) {
        if (localStorage.getItem("admin-logged-in") !== "true") {
            alert("Unauthorized access! Redirecting to login...");
            window.location.href = "admin-login.html";
        }
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("admin-logged-in");
            alert("Logged out successfully!");
            window.location.href = "admin-login.html";
        });
    }
});

