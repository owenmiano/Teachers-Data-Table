document.addEventListener("DOMContentLoaded", function() {
    const paginationContainer = document.getElementById("pagination");
    const entriesDropdown = document.getElementById("entries-dropdown");
    const prevPageLink = document.getElementById("prev-page");
    const nextPageLink = document.getElementById("next-page");
    const firstPageLink = document.getElementById("first-page");
    const lastPageLink = document.getElementById("last-page");
    // const currentPageElement = document.getElementById("current-page");

    let currentPage = 1;
    let totalPages,totalRecords;
    let pageSize = parseInt(entriesDropdown.value);

    function updateShowingEntriesText(page, pageSize, totalRecords) {
        const paginationContainer = document.getElementById("pagination");
        const showingEntriesText = paginationContainer.querySelector("span");
    
       // Calculate the range of entries being shown
        const startEntry = (page - 1) * pageSize + 1;
        const endEntry = Math.min(startEntry + pageSize - 1, totalRecords);
    
        // Update the text
      //  showingEntriesText.textContent = `Showing ${page} to ${endEntry.toLocaleString()} of ${totalRecords.toLocaleString()} entries`;
        showingEntriesText.textContent = `Page ${page.toLocaleString()} of ${totalPages.toLocaleString()}`;

    }

    fetchData(currentPage, pageSize);

    function clearTableAndDisplayError() {
        const noRecordsMessage = document.getElementById('no-records-message');
        const tableBody = document.getElementById('table-body');
        const tableWrapper = document.getElementById('table-wrapper');
        noRecordsMessage.style.display = 'block'; // Show the message
        tableBody.innerHTML = ''; // Clear table body
        tableWrapper.style.display = 'none'; // Hide the table wrapper
    }
    
    function showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
        const tableWrapper = document.getElementById('table-wrapper');
        tableWrapper.style.display = 'none';
    }
    
    function hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
    
    function fetchData(page, pageSize) {
        showLoading(); // Show loading message
    
        const requestOptions = {
            method: 'GET',
        };
    
        fetch(`http://172.20.94.24:2001/api/rest/teachers?page=${page}&pageSize=${pageSize}`, requestOptions)
        .then(response => response.json())
        .then(data => {
            const noRecordsMessage = document.getElementById('no-records-message');
            const tableBody = document.getElementById('table-body');
            const tableWrapper = document.getElementById('table-wrapper');
    
            hideLoading(); // Hide loading message
    
            if (!data) {
                clearTableAndDisplayError();
            } else {
                noRecordsMessage.style.display = 'none'; 
    
                updateTable(data.data, tableBody);
                totalPages = data.total_Pages; 
                totalRecords=data.total_records;
                // updatePaginationLinks();
                updateShowingEntriesText(page, pageSize, totalRecords);
                tableWrapper.style.display = 'block'; // Show the table wrapper
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            hideLoading(); // Hide loading message
            clearTableAndDisplayError();
        });
    } 
    
    
        
    
    
    function updateTable(data, tableBody) {
        tableBody.innerHTML = ''; // Clear table body
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
                <td>${formatDate(item.date_created)}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    
    
    // function updatePaginationLinks() {
    //     currentPageElement.textContent = currentPage;
    //     const pagesContainer = paginationContainer.querySelector(".pages");
    
    //     if (pagesContainer) {
    //         pagesContainer.innerHTML = "";
    
    //         let startPage = Math.max(1, currentPage - 2);
    //         let endPage = Math.min(totalPages, currentPage + 2);
    
    //         for (let i = startPage; i <= endPage; i++) {
    //             const pageLink = document.createElement("a");
    //             pageLink.href = "#";
    //             pageLink.textContent = i;
    //             pageLink.id = `page-${i}`; 
    //             pageLink.classList.add("page-link");
    //             if (i === currentPage) {
    //             pageLink.classList.add("active"); 
    //             }
    //             pageLink.addEventListener("click", function(event) {
    //                 event.preventDefault();
    //                 currentPage = i;
    //                 fetchData(currentPage, pageSize);
    //             });
    //             pagesContainer.appendChild(pageLink);
    //         }
    //     }
    // }
    
    
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

    firstPageLink.addEventListener("click", function(event) {
        event.preventDefault();
        if (currentPage !== 1) {
            currentPage = 1;
            fetchData(currentPage, pageSize);
        }
    });
    
    lastPageLink.addEventListener("click", function(event) {
        event.preventDefault();
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            fetchData(currentPage, pageSize);
        }
    });

    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    

});
