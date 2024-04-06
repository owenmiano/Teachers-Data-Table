document.addEventListener("DOMContentLoaded", function() {
    const activeUser = localStorage.getItem('username');
    const expirationTime = localStorage.getItem('expirationTime');
    const currentTime = Date.now();
    const currentDate = new Date(currentTime);

    const expirationDate = expirationTime ? new Date(parseInt(expirationTime)) : null;

    if (!activeUser || (expirationDate && expirationDate < currentDate)) {
        if (window.location.pathname !== "/login/index.html") {
             // Clear stored user data
            localStorage.removeItem('username');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('expirationTime');
            window.location.href = "/login/index.html";
        }
    } else {
        // User is logged in and session is valid

        // Set interval to periodically check for token refresh every minute
        setInterval(() => {
            const currentTime = Date.now();
            const currentDate = new Date(currentTime);
            if (expirationDate.getTime() - currentDate.getTime() < 60000) {
                refreshToken();
            }
        }, 60000); //1 minute

        async function refreshToken() {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:2001/api/rest/auth/refresh-token', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                if (response.ok) {
                    const responseData = await response.json();     
                    // Save userinfo in localStorage
                    localStorage.setItem('username', responseData.userInfo.username);
                    localStorage.setItem('token', responseData.userInfo.token);
                    localStorage.setItem('role', responseData.userInfo.role);
                    localStorage.setItem('expirationTime', responseData.userInfo.expirationTime);
                }
                else {
                    const errorData = await response.json();
                    alert(errorData.message);
                }
            } catch (error) {
                console.error('Error:', error.message);
                alert(error.message);
            }
     
        };
    
    }
});

