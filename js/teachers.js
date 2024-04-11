document.addEventListener("DOMContentLoaded", function() {
    const advancedFilterButton = document.getElementById("advanced-filter");
    const filterDrawer = document.getElementById("filter-drawer");
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
    function openFilterDrawer() {
        filterDrawer.classList.add("open"); // Add the 'open' class to show the drawer
    }
    
    // Function to close the filter drawer
    function closeFilterDrawer() {
        filterDrawer.classList.remove("open"); // Remove the 'open' class to hide the drawer
    }
    
    // Add event listener to the advanced filter button
    advancedFilterButton.addEventListener("click", function() {
        openFilterDrawer();
    });

    const closeButton = document.querySelector(".closebtn");
    // Add event listener to the close button
    closeButton.addEventListener("click", function() {
        closeFilterDrawer();
    });
    
    // Add event listener to close the drawer when clicked outside
    // window.addEventListener("click", function(event) {
    //     if (event.target === filterDrawer) {
    //         closeFilterDrawer();
    //     }
    // });


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
            currentPage = 1;
            url = `http://172.20.94.24:2001/api/rest/teachers?page=${currentPage}&pageSize=${pageSize}&filter=${filter}`;
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
                    updateLinkStatus();
                    updatePageInput();
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
    updateLinkStatus();
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


document.getElementById("add-filter-button").addEventListener("click", function(event) {
    event.preventDefault(); 
    addFilter(); 
});

// Array of logical operators
const logicalOperators = [
    { value: "AND", label: "AND" },
    { value: "OR", label: "OR" },
    // { value: "not", label: "NOT" }
  ];

  function generateLogicalOperatorSelect() {
    const select = document.createElement("select");
    select.id = "advanced-logical-operator"; // Set the ID
    logicalOperators.forEach(operator => {
      const option = document.createElement("option");
      option.value = operator.value;
      option.textContent = operator.label;
      select.appendChild(option);
    });
    return select;
  }
  

function addFilter() {
    // Clone the filter container
    const filterContainer = document.querySelector(".filter-container").cloneNode(true);

    // Clear input values in the cloned filter container
    filterContainer.querySelector("#advanced-filter-column").value = "";
    filterContainer.querySelector("#advanced-filter-relation").value = "";
    filterContainer.querySelector("#advanced-filter-value").value = "";

 

    // Append the filter container inside the cloned filter container
    const clonedFilterContainer = document.getElementById("cloned-filter-container");
    clonedFilterContainer.appendChild(filterContainer);
    const logicalOperatorSelect = generateLogicalOperatorSelect();
    // logicalOperatorSelect.style.marginTop = "10px";
    logicalOperatorSelect.style.marginLeft = "20px";
    logicalOperatorSelect.style.marginRight = "5px";
    logicalOperatorSelect.style.borderRadius = "5px";
    filterContainer.insertBefore(logicalOperatorSelect, filterContainer.firstChild);

    filterContainer.style.marginTop = "10px";


    // Get remove buttons inside the newly added filter container
    const removeButtons = filterContainer.querySelectorAll("#remove-filter-button");
    removeButtons.forEach(button => {
        button.addEventListener("click", removeFilter);
    });
}

function removeFilter(event) {
    event.preventDefault();
    const button = event.target;
    const containerToRemove = button.closest('.filter-container'); // Target the filter container
    if (containerToRemove) {
        containerToRemove.remove();
    }
}

const submitFilterButton = document.getElementById("submit-filter");
submitFilterButton.addEventListener("click", function (event) {
    event.preventDefault(); 
   gatherFilterData();

});

function gatherFilterData() {
    const filterContainers = document.querySelectorAll('.filter-container');
    let filters = '';

    filterContainers.forEach((container, index) => {
        const select = container.querySelector('#advanced-filter-column');
        const relation = container.querySelector('#advanced-filter-relation');
        const filterValueElement = container.querySelector('#advanced-filter-value');
        const search = filterValueElement.value.trim();
        const logicalOperator = container.querySelector('#advanced-logical-operator'); // Update to select by ID

        if (select && relation && filterValueElement) {
            const logicalOperatorValue = logicalOperator ? logicalOperator.value : '';

            // Encode the logical operator to match the Java code logic
            let encodedLogicalOperator = '';
            if (logicalOperatorValue === 'AND') {
                encodedLogicalOperator = '|AND|';
            } else if (logicalOperatorValue === 'OR') {
                encodedLogicalOperator = '|OR|';
            }
            let separator = '';
            if (index !== 0 && encodedLogicalOperator) {
                separator = encodedLogicalOperator;
            }
            else if (index !== 0) {
                separator = '|AND'; 
            }
            const filterString = `${separator}${select.value}:${relation.value}:${search}`;
            filters += filterString + '';
        }
    });

    
    const encodedFilters = filters.replace(/\|AND\|/g, "%7CAND%7C").replace(/\|OR\|/g, "%7COR%7C");
    fetchData(currentPage, pageSize, encodedFilters);
}




// Attach an event listener to the reset button
const resetFilterButton = document.getElementById("reset-filter");
resetFilterButton.addEventListener("click", resetFilter);

function resetFilter() {
    const clonedFilterContainer = document.getElementById("cloned-filter-container");
    clonedFilterContainer.innerHTML = ''; 
    fetchData(currentPage,pageSize)
}

});
