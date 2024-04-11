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

    const showError = (field, errorText) => {
        field.classList.add("error");
        const errorElement = document.createElement("small");
        errorElement.classList.add("error-text");
        errorElement.innerText = errorText;
        const formGroup = field.closest(".form-group");
        formGroup.appendChild(errorElement);
    }    
    
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
    
        // Get input values
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
    
        // Clear any existing error messages
        document.querySelectorAll(".form-group .error").forEach(field => field.classList.remove("error"));
        document.querySelectorAll(".error-text").forEach(errorText => errorText.remove())
        document.getElementById("server-error").textContent = "";
        // Validation
        if (username === "") {
            showError(usernameInput, "Please enter your username");
            return;
        } 
        if (password === "") {
            showError(passwordInput, "Please enter your password");
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
            const response = await fetch('http://172.20.94.24:2001/api/rest/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            console.log("request body",requestBody)
            if (response.ok) {
                // Login successful
                const responseData = await response.json();     
                // Save userinfo in localStorage
                localStorage.setItem('username', responseData.userInfo.username);
                localStorage.setItem('token', responseData.userInfo.token);
                localStorage.setItem('role', responseData.userInfo.role);
                localStorage.setItem('expirationTime', responseData.userInfo.expirationTime);
                // Redirect to home page
                window.location.href = "../html/home.html";
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
    var hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    return hash;
}

// Function to display server error message 
function displayErrorMessage(message) {
    const errorMessage = document.getElementById("server-error");
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

});
