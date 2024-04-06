document.addEventListener("DOMContentLoaded", function() {
    const changePasswordForm = document.getElementById("changePasswordForm");
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
    const togglePassword1 = document.getElementById("togglePassword1");
    const togglePassword2 = document.getElementById("togglePassword2");
    const togglePassword3 = document.getElementById("togglePassword3");

    // Function to toggle password visibility for currentPassword
    togglePassword1.addEventListener("click", function() {
        togglePasswordVisibility(currentPasswordInput, togglePassword1);
    });

    // Function to toggle password visibility for newPassword
    togglePassword2.addEventListener("click", function() {
        togglePasswordVisibility(newPasswordInput, togglePassword2);
    });

    // Function to toggle password visibility for confirmNewPassword
    togglePassword3.addEventListener("click", function() {
        togglePasswordVisibility(confirmNewPasswordInput, togglePassword3);
    });

    // Function to toggle password visibility
    function togglePasswordVisibility(inputField, toggleButton) {
        if (inputField.type === "password") {
            inputField.type = "text";
            toggleButton.classList.remove("bx-hide");
            toggleButton.classList.add("bx-show");
        } else {
            inputField.type = "password";
            toggleButton.classList.remove("bx-show");
            toggleButton.classList.add("bx-hide");
        }
    }

    changePasswordForm.addEventListener("submit", function(event) {
        event.preventDefault(); 
        // Get input values
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();
        // Validation
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            displayErrorMessage("All fields are required");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            displayErrorMessage("Passwords don't match");
            return;
        }

        // Call change password API
        changePassword(currentPassword, newPassword);
    });
    document.getElementById("resetButton").addEventListener("click", function(event) {
        changePasswordForm.dispatchEvent(new Event("submit"));
    });

    async function changePassword(currentPassword, newPassword) {
        // Hash the password
        const hashedCurrentPassword = await hashPassword(currentPassword);
        const hashedNewPassword = await hashPassword(newPassword);

        const token = localStorage.getItem('token');
        const requestBody = {
            currentPassword: hashedCurrentPassword,
            newPassword: hashedNewPassword
        };
        try {
            const response = await fetch('http://localhost:2001/api/rest/auth/change-password', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            if (response.ok) {
                // Remove userinfo from localStorage
                localStorage.removeItem('username');
                localStorage.removeItem('token');
                // Redirect to login page
                window.location.href = "/login/index.html";
               // Prevent going back to the previous page
                window.history.pushState(null, "", window.location.href);
                window.addEventListener("popstate", function(event) {
                    // Restore the state without navigating back
                    window.history.pushState(null, "", window.location.href);
                });
            }
            else {
                // Login failed
                const errorData = await response.json();
                displayErrorMessage(errorData.message);
            }
        } catch (error) {
            console.error('Error:', error.message);
            displayErrorMessage("An error occurred during login",error.message);
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
