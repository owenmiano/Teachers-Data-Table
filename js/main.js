document.addEventListener("DOMContentLoaded", function() {
    const activeUser = localStorage.getItem('username');
    const expirationTime = localStorage.getItem('expirationTime');
    const currentTime = Date.now();
    const currentDate = new Date(currentTime);

    const expirationDate = expirationTime ? new Date(parseInt(expirationTime)) : null;

    if (!activeUser || (expirationDate && expirationDate < currentDate)) {
        if (window.location.pathname !== "/html/login.html") {
            // Clear stored user data
            localStorage.removeItem('username');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('expirationTime');
            window.location.href = "../html/login.html";
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
                const response = await fetch('http://172.20.94.24:2001/api/rest/auth/refresh-token', {
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
                    window.location.href = "../html/login.html";
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

