document.addEventListener("DOMContentLoaded", function () {
  const changePasswordForm = document.getElementById("changePasswordForm");
  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
  const togglePassword1 = document.getElementById("togglePassword1");
  const togglePassword2 = document.getElementById("togglePassword2");
  const togglePassword3 = document.getElementById("togglePassword3");

  // Function to toggle password visibility for currentPassword
  togglePassword1.addEventListener("click", function () {
    togglePasswordVisibility(currentPasswordInput, togglePassword1);
  });

  // Function to toggle password visibility for newPassword
  togglePassword2.addEventListener("click", function () {
    togglePasswordVisibility(newPasswordInput, togglePassword2);
  });

  // Function to toggle password visibility for confirmNewPassword
  togglePassword3.addEventListener("click", function () {
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

  const showError = (field, errorText) => {
    field.classList.add("error");
    const errorElement = document.createElement("small");
    errorElement.classList.add("error-text");
    errorElement.innerText = errorText;
    const formGroup = field.closest(".form-group");
    formGroup.appendChild(errorElement);
  };
  changePasswordForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // Get input values
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmNewPassword = confirmNewPasswordInput.value.trim();

    // Clear any existing error messages
    document
      .querySelectorAll(".form-group .error")
      .forEach((field) => field.classList.remove("error"));
    document
      .querySelectorAll(".error-text")
      .forEach((errorText) => errorText.remove());
    document.getElementById("server-error").textContent = "";
    // Validation

    if (currentPassword === "") {
      showError(currentPasswordInput, "Please enter your current password");
      return;
    }

    if (newPassword === "") {
      showError(newPasswordInput, "Please enter your new password");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showError(confirmNewPasswordInput, "Passwords do not match");
      return;
    }

    // Call change password API
    changePassword(currentPassword, newPassword);
  });
  document
    .getElementById("resetButton")
    .addEventListener("click", function (event) {
      changePasswordForm.dispatchEvent(new Event("submit"));
    });

  async function changePassword(currentPassword, newPassword) {
    // Hash the password
    const hashedCurrentPassword = await hashPassword(currentPassword);
    const hashedNewPassword = await hashPassword(newPassword);

    const token = localStorage.getItem("token");
    const requestBody = {
      currentPassword: hashedCurrentPassword,
      newPassword: hashedNewPassword,
    };
    try {
      const response = await fetch(
        "http://172.20.94.24:2001/api/rest/auth/change-password",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (response.ok) {
        // Remove userinfo from localStorage
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        // Redirect to login page
        window.location.href = "../html/login.html";
        // Prevent going back to the previous page
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", function (event) {
          // Restore the state without navigating back
          window.history.pushState(null, "", window.location.href);
        });
      } else {
        // Login failed
        const errorData = await response.json();
        displayErrorMessage(errorData.message);
      }
    } catch (error) {
      console.error("Error:", error.message);
      displayErrorMessage("An error occurred during login", error.message);
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
