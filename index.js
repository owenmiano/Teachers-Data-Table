document.addEventListener("DOMContentLoaded", function() {
    const paginationContainer = document.getElementById("pagination");
    const entriesDropdown = document.getElementById("entries-dropdown");
    const prevPageLink = document.getElementById("prev-page");
    const nextPageLink = document.getElementById("next-page");
    const currentPageElement = document.getElementById("current-page");

    let currentPage = parseInt(currentPageElement.textContent);
    let totalPages,totalRecords;
    let pageSize = parseInt(entriesDropdown.value);
    const tableBody = document.getElementById("table-body");

    function updateShowingEntriesText(page, totalPages, totalRecords) {
        const paginationContainer = document.getElementById("pagination");
        const showingEntriesText = paginationContainer.querySelector("span");
    
        // Calculate the range of entries being shown
        // const startEntry = (page - 1) * pageSize + 1;
        // const endEntry = Math.min(startEntry + pageSize - 1, totalRecords);
    
        // Update the text
        showingEntriesText.textContent = `Showing ${page} to ${totalPages} pages of ${totalRecords} entries`;
    }
    
    
    // Call the function initially and whenever the page or total entries change
    function updateTable(data) {
        tableBody.innerHTML = ""; 
        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.teacher_id}</td>
                <td>${item.teacher_name}</td>
                <td>${item.tsc_number}</td>
                <td>${item.id_number}</td>
                <td>${item.kra_pin}</td>
                <td>${item.phone}</td>
                <td>${item.email}</td>
                <td>${item.date_of_birth}</td>
                <td>${item.class_name}</td>
                <td>${moment(item.date_created).format('YYYY-MM-DD HH:mm:ss')}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    fetchData(currentPage, pageSize);

    function fetchData(page, pageSize) {
        const requestOptions = {
            method: 'GET',
        };

        fetch(`http://172.20.94.24:2000/api/rest/teachers?page=${page}&pageSize=${pageSize}`, requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log("Fetched data:", data);
                const noRecordsMessage = document.getElementById('no-records-message');
                const pagination = document.getElementById('pagination');
        
                if (data.data.length === 0) {
                    noRecordsMessage.style.display = 'block'; 
                    pagination.style.display = 'none'; 
                } else {
                    noRecordsMessage.style.display = 'none'; 
                    pagination.style.display = 'flex'; 

                updateTable(data.data);
                totalPages = data.total_Pages; 
                totalRecords=data.total_records;
                updatePaginationLinks();
                updateShowingEntriesText(page, totalPages, totalRecords);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                const noRecordsMessage = document.getElementById('no-records-message');
                const pagination = document.getElementById('pagination');
                noRecordsMessage.style.display = 'block'; // Show the message
                pagination.style.display = 'none'; // Hide pagination
            });
    }
  
    function updatePaginationLinks() {
        currentPageElement.textContent = currentPage;
        const pagesContainer = paginationContainer.querySelector(".pages");
    
        if (pagesContainer) {
            pagesContainer.innerHTML = "";
    
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);
    
            for (let i = startPage; i <= endPage; i++) {
                const pageLink = document.createElement("a");
                pageLink.href = "#";
                pageLink.textContent = i;
                pageLink.id = `page-${i}`; 
                pageLink.classList.add("page-link");
                if (i === currentPage) {
                pageLink.classList.add("active"); 
                }
                pageLink.addEventListener("click", function(event) {
                    event.preventDefault();
                    currentPage = i;
                    fetchData(currentPage, pageSize);
                });
                pagesContainer.appendChild(pageLink);
            }
        }
    }
    
    
    
    
    entriesDropdown.addEventListener("change", function() {
        pageSize = parseInt(entriesDropdown.value);
        fetchData(currentPage, pageSize);
    });

    prevPageLink.addEventListener("click", function(event) {
        event.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            fetchData(currentPage, pageSize);
        }
    });

    nextPageLink.addEventListener("click", function(event) {
        event.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            fetchData(currentPage, pageSize);
        }
    });


});
