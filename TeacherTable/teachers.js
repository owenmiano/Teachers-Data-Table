document.addEventListener("DOMContentLoaded", function() {
    const paginationContainer = document.getElementById("pagination");
    const entriesDropdown = document.getElementById("entries-dropdown");
    const prevPageLink = document.getElementById("prev-page");
    const nextPageLink = document.getElementById("next-page");
    const firstPageLink = document.getElementById("first-page");
    const lastPageLink = document.getElementById("last-page");
    const pageInput = document.getElementById("page-input");

    let currentPage = 1;
    let totalPages, totalRecords;
    let pageSize = parseInt(entriesDropdown.value);

    // function updateShowingEntriesText(page, pageSize, totalRecords) {
    //     const showingEntriesText = paginationContainer.querySelector("span");
    //     const startEntry = (page - 1) * pageSize + 1;
    //     const endEntry = Math.min(startEntry + pageSize - 1, totalRecords);
    //     showingEntriesText.textContent = `Page ${page.toLocaleString()} of ${totalPages.toLocaleString()}`;
    // }

    fetchData(currentPage, pageSize);

    function clearTableAndDisplayError() {
        const noRecordsMessage = document.getElementById('no-records-message');
        const tableBody = document.getElementById('table-body');
        const tableWrapper = document.getElementById('table-wrapper');
        noRecordsMessage.style.display = 'block';
        tableBody.innerHTML = '';
        tableWrapper.style.display = 'none';
    }

    function showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
        const tableWrapper = document.getElementById('table-wrapper');
        tableWrapper.style.display = 'none';
    }

    function hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    function fetchData(page, pageSize, filter = '') {
        showLoading();
        const token = localStorage.getItem('token');
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        let url = `http://172.20.94.24:2001/api/rest/teachers?page=${page}&pageSize=${pageSize}`;
        if (filter !== '') {
            url += `&filter=${filter}`;
        }

        fetch(url, requestOptions)
            .then(response => response.json())
            .then(data => {
                const noRecordsMessage = document.getElementById('no-records-message');
                const tableBody = document.getElementById('table-body');
                const tableWrapper = document.getElementById('table-wrapper');

                hideLoading();

                if (!data) {
                    clearTableAndDisplayError();
                } else {
                    noRecordsMessage.style.display = 'none';
                    if (Array.isArray(data.data)) {
                        updateTable(data.data, tableBody);
                    } else {
                        updateTable([data.data], tableBody);
                    }
                    totalPages = data.total_Pages;
                    totalRecords = data.total_records;
                    tableWrapper.style.display = 'block';
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                hideLoading();
                clearTableAndDisplayError();
            });
    }

    function updateTable(data, tableBody) {
        tableBody.innerHTML = '';
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
        updateLinkStatus();
        updatePageInput();
    });

    nextPageLink.addEventListener("click", function(event) {
        event.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            fetchData(currentPage, pageSize);
        }
        updateLinkStatus();
        updatePageInput();
    });

    firstPageLink.addEventListener("click", function(event) {
        event.preventDefault();
        if (currentPage !== 1) {
            currentPage = 1;
            fetchData(currentPage, pageSize);
        }
        updateLinkStatus();
        updatePageInput();
    });

    lastPageLink.addEventListener("click", function(event) {
        event.preventDefault();
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            fetchData(currentPage, pageSize);
        }
        updateLinkStatus();
        updatePageInput();
    });

    function updateLinkStatus() {
        if (currentPage === 1) {
            firstPageLink.classList.add("disabled");
            prevPageLink.classList.add("disabled");
        } else {
            firstPageLink.classList.remove("disabled");
            prevPageLink.classList.remove("disabled");
        }

        if (currentPage === totalPages) {
            nextPageLink.classList.add("disabled");
            lastPageLink.classList.add("disabled");
        } else {
            nextPageLink.classList.remove("disabled");
            lastPageLink.classList.remove("disabled");
        }
    }

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

    const searchButton = document.getElementById("search-button");

    searchButton.addEventListener("click", function() {
        const columnSelect = document.getElementById("column-select");
        const searchInput = document.getElementById("search-input");
        const selectedColumn = columnSelect.value;
        const searchValue = searchInput.value.trim();

        if (selectedColumn === "" && searchValue === "") {
            fetchData(currentPage, pageSize);
        }
        else {
            const filter = `${selectedColumn}:eq:${searchValue}`;
            fetchData(currentPage, pageSize, filter);
        }
    });

    function updatePageInput() {
        pageInput.value = currentPage;
    }
    
    // Call updatePageInput initially to set the initial value
    updatePageInput();
    
    pageInput.addEventListener("change", function() {
        const newPage = parseInt(pageInput.value);
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            fetchData(currentPage, pageSize);
        } else {
            updatePageInput();
        }
    });
    
});
