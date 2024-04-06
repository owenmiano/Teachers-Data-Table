document.addEventListener("DOMContentLoaded", function () {
    const logOut = document.getElementById("logOut");
    let sidebar = document.querySelector(".sidebar");
    let sidebarBtn = document.querySelector(".sidebarBtn");

    const activeUser = localStorage.getItem('username');
    if (activeUser) {
        document.getElementById('user').textContent = `Welcome, ${activeUser}`;
      }

    sidebarBtn.onclick = function() {
      sidebar.classList.toggle("active");
      if(sidebar.classList.contains("active")){
      sidebarBtn.classList.replace("bx-menu" ,"bx-menu-alt-right");
    }else
      sidebarBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
    // Function to toggle password visibility for currentPassword
    logOut.addEventListener("click", function(event) {
        event.preventDefault();
        logOutUser();
    });


    async function logOutUser() {
        alert("Are you sure you want to logout?");
        const requestBody = {
            username: localStorage.getItem('username'),
            role: localStorage.getItem('role')
        };
        try {
            const response = await fetch('http://localhost:2001/api/rest/auth/logout', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            if (response.ok) {
                // Remove userinfo from localStorage
                localStorage.clear();
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
                alert(errorData.message);
            }
        } catch (error) {
            console.error('Error:', error.message);
            alert("An error occurred during logging out",error.message);
        }
    }


});
