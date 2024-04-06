document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");

    
    togglePassword.addEventListener("click", function() {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.classList.remove("bx-hide");
            togglePassword.classList.add("bx-show");
        } else {
            passwordInput.type = "password";
            togglePassword.classList.remove("bx-show");
            togglePassword.classList.add("bx-hide");
        }
    });

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        // Get input values
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validation
        if (!username || !password) {
            displayErrorMessage("Both username and password fields are required");
            return;
        }

        // Call login API
        login(username, password);
    });

    document.getElementById("loginButton").addEventListener("click", function(event) {
        loginForm.dispatchEvent(new Event("submit"));
    });

    async function login(username, password) {
        // Hash the password
        const hashedPassword = await hashPassword(password);

        const requestBody = {
            username: username,
            password: hashedPassword
        };
        try {
            const response = await fetch('http://localhost:2001/api/rest/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            console.log("request body",)
            if (response.ok) {
                // Login successful
                const responseData = await response.json();     
                // Save userinfo in localStorage
                localStorage.setItem('username', responseData.userInfo.username);
                localStorage.setItem('token', responseData.userInfo.token);
                localStorage.setItem('role', responseData.userInfo.role);
                localStorage.setItem('expirationTime', responseData.userInfo.expirationTime);
                // Redirect to home page
                window.location.href = "/home/index.html";
                //Prevent going back to the login page
                window.history.pushState(null, "", window.location.href);
                window.addEventListener("popstate", function() {
                    window.history.pushState(null, "", window.location.href);
                });
            }
            else {
                // Login failed
                const errorData = await response.json();
                displayErrorMessage(errorData.message);
            }
        } catch (error) {
            console.error('Error:', errorData.message);
            displayErrorMessage("An error occurred during login",errorData.message);
        }
    }


async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function displayErrorMessage(message) {
    // Check if an error message with the same content already exists
    const existingErrorMessage = document.querySelector(".error-message");
    if (existingErrorMessage && existingErrorMessage.textContent === message) {
        return; 
    }

    const errorMessage = document.createElement("div");
    errorMessage.classList.add("error-message");
    errorMessage.textContent = message;

    clearErrorMessage();

    const errorMessages = document.getElementById("errorMessages");
    if (errorMessages) {
        errorMessages.appendChild(errorMessage);
    }
}


function clearErrorMessage() {
    const errorMessages = document.getElementById("errorMessages");
    if (errorMessages) {
        errorMessages.innerHTML = ""; 
    }
}

});
