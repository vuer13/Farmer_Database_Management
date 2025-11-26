// Farm Management System Functions

async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    loadingGifElem.style.display = 'none';
    statusElem.style.display = 'inline';

    response.text()
        .then((text) => {
            statusElem.textContent = text;
        })
        .catch((error) => {
            statusElem.textContent = 'connection timed out';
        });
}

// Initialize tables
async function initializeFarmTables() {
    const messageElement = document.getElementById('farmInitMsg');
    messageElement.textContent = 'Initializing tables...';

    const response = await fetch('/initialize-farm-tables', {
        method: 'POST'
    });

    const responseData = await response.json();

    if (responseData.success) {
        messageElement.textContent = 'Farm tables initialized successfully! Now you can add entities.';
        messageElement.style.color = 'green';

        fetchAllTables();
    } else {
        messageElement.textContent = 'Error initializing farm tables!';
        messageElement.style.color = 'red';
    }
}

// Populate tables with sql script
async function populateTables() {
    const messageElement = document.getElementById("populateMsg");
    messageElement.textContent = "Populating..."

    const response = await fetch("/populate-tables", {
        method: "POST"
    });

    const responseData = await response.json();

    if (responseData.success) {
        messageElement.textContent = "Tables populated successfully";
        messageElement.style.color = "green";

        // Refresh data
        fetchAllTables();
    } else {
        messageElement.textContent = "An error has occurred while populating tables";
        messageElement.style.color = "red";
    }
}

// Add new farmer
async function addFarmer(event) {
    event.preventDefault();

    const farmerID = document.getElementById('farmerID').value;
    const farmerName = document.getElementById('farmerName').value;
    const farmerContact = document.getElementById('farmerContact').value;

    const response = await fetch('/add-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            farmerID: farmerID,
            name: farmerName,
            contactInfo: farmerContact
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('farmerMsg');

    if (responseData.success) {
        messageElement.textContent = 'Farmer added successfully!';
        messageElement.style.color = 'green';
        document.getElementById('addFarmerForm').reset();
        fetchFarmers();
    } else {
        messageElement.textContent = 'Error adding farmer!';
        messageElement.style.color = 'red';
    }
}

// Add new farm
async function addFarm(event) {
    event.preventDefault();

    const farmID = document.getElementById('farmID').value;
    const farmName = document.getElementById('farmName').value;
    const farmLocation = document.getElementById('farmLocation').value;
    const farmFarmerID = document.getElementById('farmFarmerID').value;

    const response = await fetch('/add-farm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            farmID: farmID,
            name: farmName,
            location: farmLocation,
            farmerID: farmFarmerID
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('farmMsg');

    if (responseData.success) {
        messageElement.textContent = 'Farm added successfully!';
        messageElement.style.color = 'green';
        document.getElementById('addFarmForm').reset();
        fetchFarms();
    } else {
        messageElement.textContent = 'Error adding farm!';
        messageElement.style.color = 'red';
    }
}

// Add new field
async function addField(event) {
    event.preventDefault();

    const fieldID = document.getElementById('fieldID').value;
    const fieldFarmID = document.getElementById('fieldFarmID').value;
    const fieldArea = document.getElementById('fieldArea').value;

    const response = await fetch('/add-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fieldID: fieldID,
            farmID: fieldFarmID,
            area: fieldArea || null
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('fieldMsg');

    if (responseData.success) {
        messageElement.textContent = 'Field added successfully!';
        messageElement.style.color = 'green';
        document.getElementById('addFieldForm').reset();
        fetchFields();
    } else {
        messageElement.textContent = 'Error adding field!';
        messageElement.style.color = 'red';
    }
}

// Add new crop
async function addCrop(event) {
    event.preventDefault();

    const cropID = document.getElementById('cropID').value;
    const cropFieldID = document.getElementById('cropFieldID').value;
    const cropName = document.getElementById('cropName').value;
    const cropPlantDate = document.getElementById('cropPlantDate').value;
    const cropHarvestDate = document.getElementById('cropHarvestDate').value;
    const cropSeason = document.getElementById('cropSeason').value;

    const response = await fetch('/add-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cropID: cropID,
            fieldID: cropFieldID,
            cropName: cropName,
            plantDate: cropPlantDate,
            harvestDate: cropHarvestDate,
            season: cropSeason
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('cropMsg');

    if (responseData.success) {
        messageElement.textContent = 'Crop added successfully!';
        messageElement.style.color = 'green';
        document.getElementById('addCropForm').reset();
        fetchCrops();
    } else {
        messageElement.textContent = 'Error adding crop!';
        messageElement.style.color = 'red';
    }
}

// Add new pesticide
async function addPesticide(event) {
    event.preventDefault();

    const pestID = document.getElementById('pestID').value;
    const pestName = document.getElementById('pestName').value;

    const response = await fetch('/add-pesticide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pestID: pestID,
            name: pestName
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('pestMsg');

    if (responseData.success) {
        messageElement.textContent = 'Pesticide added successfully!';
        messageElement.style.color = 'green';
        document.getElementById('addPesticideForm').reset();
        fetchPesticides();
    } else {
        messageElement.textContent = 'Error adding pesticide!';
        messageElement.style.color = 'red';
    }
}

// Add new certification
async function addCertification(event) {
    event.preventDefault();

    const certID = document.getElementById('certID').value;
    const certName = document.getElementById('certName').value;
    const certAwardDate = document.getElementById('certAwardDate').value;
    const certExpiryDate = document.getElementById('certExpiryDate').value;
    const certFarmID = document.getElementById('certFarmID').value;

    const response = await fetch('/add-certification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            certID: certID,
            name: certName,
            awardDate: certAwardDate,
            expiryDate: certExpiryDate,
            farmID: certFarmID
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('certMsg');

    if (responseData.success) {
        messageElement.textContent = 'Certification added successfully!';
        messageElement.style.color = 'green';
        document.getElementById('addCertForm').reset();
        fetchCertifications();
    } else {
        messageElement.textContent = 'Error adding certification!';
        messageElement.style.color = 'red';
    }
}

// Update farm info
async function updateFarmInfo(event) {
    event.preventDefault();

    const farmID = document.getElementById('updatefarmID').value;
    const farmName = document.getElementById('updatefarmName').value;
    const location = document.getElementById('updatefarmLocation').value;
    const farmerID = document.getElementById('updatefarmerID').value;

    const response = await fetch('/update-farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            farmID: farmID,
            farmName: farmName,
            location: location,
            farmerID: farmerID
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateFarmMsg');

    messageElement.textContent = responseData.message;
    messageElement.style.color = responseData.success ? 'green' : 'red';

    // reset selections and reload table
    if (responseData.success) {
        document.getElementById('updateFarmForm').reset();
        fetchFarms();
    }
}

// Delete Farms
async function deleteFarmInfo(event) {
    event.preventDefault();

    const farmID = document.getElementById('deleteFarmID').value;
    const deleteMessage = document.getElementById('deleteFarmMsg');

    const response = await fetch('/delete-farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            farmID: farmID
        })
    });

    const responseData = await response.json();
    deleteMessage.textContent = responseData.message;
    deleteMessage.style.color = responseData.success ? 'green' : 'red';

    if (responseData.success) {
        document.getElementById('deleteFarmForm').reset();

        // Wait for cascade and backend to finish
        await new Promise(resolve => setTimeout(resolve, 200));
        fetchAllTables();
    }
}

// Fetch projection results
async function fetchProjection(event) {
    event.preventDefault();

    const messageElement = document.getElementById('projectionMsg');
    const selected = [...document.querySelectorAll('input[name="projectionField"]:checked')].map(x => x.value);

    const display = selected.join(",");

    try {
        const response = await fetch(`/projection?display=${encodeURIComponent(display)}`, {
            method: 'GET'
        });

        const responseData = await response.json();

        messageElement.textContent = responseData.message;
        messageElement.style.color = responseData.success ? 'green' : 'red';

        if (responseData.success) {
            const headerRow = document.querySelector("#projectionTable thead");
            headerRow.innerHTML = "";

            selected.forEach(col => {
                const th = document.createElement("th");
                th.textContent = col;
                headerRow.appendChild(th);
            });
            displayTableData('projectionTable', responseData.data);
        } else {
            const headerRow = document.querySelector("#projectionTable thead");
            headerRow.innerHTML = "";
            displayTableData('projectionTable', []);
        }
    } catch (err) {
        console.error('Error fetching projection:', err);
        messageElement.textContent = "Error fetching projection data.";
        messageElement.style.color = 'red';
    }
}

// adds condition for selections
function addCondition() {
    const container = document.getElementById("conditionsContainer");

    const div = document.createElement("div");
    div.className = "conditionRow";

    if (container.children.length > 0) {
        div.innerHTML += `
            <select name="connector" class="connector">
                <option value="AND">AND</option>
                <option value="OR">OR</option>
            </select>
        `;
    }

    div.innerHTML += `
        <select name="attribute">
            <option value="FieldID">FieldID</option>
            <option value="FarmID">FarmID</option>
            <option value="Area">Area</option>
        </select>

        <select name="operator">
            <option value="=">=</option>
            <option value="<>">&lt;&gt;</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value=">=">&gt;=</option>
            <option value="<=">&lt;=</option>
        </select>

        <input type="number" name="value" placeholder="Number" min="1" required>
    `;


    container.appendChild(div);
}

// Fetch selection
async function fetchSelection(event) {
    event.preventDefault();

    const rows = document.querySelectorAll(".conditionRow");
    const conditions = [];

    rows.forEach((row, idx) => {
        const attribute = row.querySelector('select[name="attribute"]').value;
        const operator = row.querySelector('select[name="operator"]').value;
        const value = row.querySelector('input[name="value"]').value;

        let connector = "AND";
        if (idx > 0) {
            connector = row.querySelector('select[name="connector"]').value;
        }

        if (value !== "") {
            conditions.push({ attribute, operator, value, connector });
        }
    });

    try {
        const response = await fetch(`/selection`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conditions })
        });

        const responseData = await response.json();
        const messageElement = document.getElementById("selectionMsg");

        messageElement.textContent = responseData.message;
        messageElement.style.color = responseData.success ? 'green' : 'red';

        const headerRow = document.querySelector("#selectionTable thead tr");
        headerRow.innerHTML = "";
        const tableBody = document.querySelector("#selectionTable tbody");
        tableBody.innerHTML = "";

        if (responseData.success) {
            ["FieldID", "FarmID", "Area"].forEach(col => {
                const th = document.createElement("th");
                th.textContent = col;
                headerRow.appendChild(th);
            });
            displayTableData('selectionTable', responseData.data);
        } else {
            displayTableData('selectionTable', []);
        }
    } catch (err) {
        console.error('Error fetching selection:', err);
        messageElement.textContent = "Error fetching selection data.";
        messageElement.style.color = 'red';
    }
}

// Fetch joined results (farm/crops)
async function fetchJoinedFC(event) {
    event.preventDefault();

    const farmID = document.getElementById('joinfarmID').value;
    const messageElement = document.getElementById('joinFCMsg');

    try {
        const response = await fetch(`/join-fc_table?farmID=${encodeURIComponent(farmID)}`, {
            method: 'GET'
        })
        const responseData = await response.json();

        messageElement.textContent = responseData.message;
        messageElement.style.color = responseData.success ? 'green' : 'red';

        if (responseData.success) {
            const groupedData = groupFarmData(responseData.data);
            displayTableData('joinfarmTable', groupedData);
        } else {
            // Clears table when no results
            displayTableData('joinFarmTable', []);
        }
        document.getElementById('joinFCForm').reset();
    } catch (err) {
        console.error('Error fetching crops by farm', err);
        messageElement.textContent = "Error fetching data.";
        messageElement.style.color = 'red';
    }
}

async function fetchAverageVolumes(event) {
    event.preventDefault();

    const tableElement = document.getElementById('averageVolumeTable');
    const tableBody = tableElement.querySelector('tbody');
    const messageElement = document.getElementById('averageVolumeMsg');

    try {
        const response = await fetch('/average-irrigation', {
            method: 'GET'
        });
        const responseData = await response.json();
        const fields = responseData.data;

        messageElement.textContent = responseData.message;
        messageElement.style.color = responseData.success ? 'green' : 'red';

        tableBody.innerHTML = '';

        if (responseData.success && fields && fields.length > 0) {
            displayTableData('averageVolumeTable', fields);
        } else {
            messageElement.textContent += " No data to display.";
        }
    } catch (err) {
        console.error('Error fetching average irrigation per field:', err);
        messageElement.textContent = "Error fetching data.";
        messageElement.style.color = 'red';
        tableBody.innerHTML = '';
    }
}

async function fetchHealthyField(event) {
    event.preventDefault();

    const tableElement = document.getElementById('healthyFieldTable');
    const tableBody = tableElement.querySelector('tbody');
    const messageElement = document.getElementById('healthyFieldMsg');

    try {
        const response = await fetch('/healthy-field', {
            method: 'GET'
        });
        const responseData = await response.json();
        const fields = responseData.data;

        messageElement.textContent = responseData.message;
        messageElement.style.color = responseData.success ? 'green' : 'red';

        tableBody.innerHTML = '';

        if (responseData.success && fields && fields.length > 0) {
            displayTableData('healthyFieldTable', fields);
        } else {
            messageElement.textContent += " No data to display.";
        }
    } catch (err) {
        console.error('Error fetching average irrigation per field:', err);
        messageElement.textContent = "Error fetching data.";
        messageElement.style.color = 'red';
        tableBody.innerHTML = '';
    }
}

async function fetchHighestMoistureField(event) {
    if (event) event.preventDefault();

    const tableElement = document.getElementById('highestMoistureF');
    const tableBody = tableElement.querySelector('tbody');
    const messageElement = document.getElementById('highestMoistureMsg');

    try {
        const response = await fetch('/highest-moisture-f', {
            method: 'GET'
        });
        const responseData = await response.json();
        const fields = responseData.data;

        // Show message
        messageElement.textContent = responseData.message;
        messageElement.style.color = responseData.success ? 'green' : 'red';

        // Clear old data
        tableBody.innerHTML = '';

        if (responseData.success && fields && fields.length > 0) {
            displayTableData('highestMoistureF', fields);
        } else {
            messageElement.textContent += " No data to display.";
        }
    } catch (err) {
        console.error('Error fetching highest moisture fields:', err);
        messageElement.textContent = "Error fetching data.";
        messageElement.style.color = 'red';
        tableBody.innerHTML = '';
    }
}

async function fetchFieldsAllPesticides(event) {
    if (event) event.preventDefault();

    const tableElement = document.getElementById('allPesticideTable');
    const tableBody = tableElement.querySelector('tbody');
    const messageElement = document.getElementById('allPesticideMsg');

    try {
        const response = await fetch('/all-pesticides', {
            method: 'GET'
        });
        const responseData = await response.json();
        const fields = responseData.data;

        // Show message
        messageElement.textContent = responseData.message;
        messageElement.style.color = responseData.success ? 'green' : 'red';

        // Clear old data
        tableBody.innerHTML = '';

        if (responseData.success && fields && fields.length > 0) {
            displayTableData('allPesticideTable', fields);
        } else {
            messageElement.textContent += " No data to display.";
        }
    } catch (err) {
        console.error('Error fetching fields that use all pesticides:', err);
        messageElement.textContent = "Error fetching data.";
        messageElement.style.color = 'red';
        tableBody.innerHTML = '';
    }
}

// Fetch and display farmers
async function fetchFarmers() {
    const tableElement = document.getElementById('farmersTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/farmers', {
        method: 'GET'
    });

    const responseData = await response.json();
    const farmers = responseData.data;

    // Clear old data
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    farmers.forEach(farmer => {
        const row = tableBody.insertRow();
        farmer.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Fetch and display farms
async function fetchFarms() {
    const tableElement = document.getElementById('farmsTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/farms', {
        method: 'GET'
    });

    const responseData = await response.json();
    const farms = responseData.data;

    // Clear old data
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    farms.forEach(farm => {
        const row = tableBody.insertRow();
        farm.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Fetch and display fields
async function fetchFields() {
    const tableElement = document.getElementById('fieldsTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/fields', {
        method: 'GET'
    });

    const responseData = await response.json();
    const fields = responseData.data;

    // Clear old data
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    fields.forEach(field => {
        const row = tableBody.insertRow();
        field.forEach((fieldData, index) => {
            const cell = row.insertCell(index);
            cell.textContent = fieldData;
        });
    });
}

// Fetch and display crops
async function fetchCrops() {
    const tableElement = document.getElementById('cropsTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/crops', {
        method: 'GET'
    });

    const responseData = await response.json();
    const crops = responseData.data;

    // Clear old data
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    crops.forEach(crop => {
        const row = tableBody.insertRow();
        crop.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Fetch and display pesticides
async function fetchPesticides() {
    const tableElement = document.getElementById('pesticidesTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/pesticides', {
        method: 'GET'
    });

    const responseData = await response.json();
    const pesticides = responseData.data;

    // Clear old data
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    pesticides.forEach(pesticide => {
        const row = tableBody.insertRow();
        pesticide.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Fetch and display certifications
async function fetchCertifications() {
    const tableElement = document.getElementById('certificationsTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/certifications', {
        method: 'GET'
    });

    const responseData = await response.json();
    const certifications = responseData.data;

    // Clear old data
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    certifications.forEach(cert => {
        const row = tableBody.insertRow();
        cert.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Helper function to refresh table gui
async function fetchAllTables() {
    await Promise.all([
        fetchFarmers(),
        fetchFarms(),
        fetchFields(),
        fetchCrops(),
        fetchPesticides(),
        fetchCertifications(),
        fetchGrains(),
        fetchVegetables(),
        fetchFruits(),
        fetchYields(),
        fetchIrrigation(),
        fetchSoil()
    ]);
}

/*
    Helper function to group crops by farm for display
    Used to process joinFarmCrop results
 */
function groupFarmData(rows) {
    if (!rows || rows.length === 0) {
        return [];
    }

    const farmID = rows[0][0];
    const farmerName = rows[0][1];
    const contactInfo = rows[0][2];
    const crops = rows.map(r => r[3]).filter(c => c !== null);

    return [
        [farmID, farmerName, contactInfo, crops]
    ];
}

// Helper function to display table data, including arrays as bulleted points
function displayTableData(tableId, data) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) return;

    const tableBody = tableElement.querySelector('tbody');
    if (!tableBody) return;

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    if (!data || data.length === 0) return;

    data.forEach(row => {
        const tr = tableBody.insertRow();
        row.forEach((cell, index) => {
            const td = tr.insertCell(index);

            if (Array.isArray(cell)) {
                // Create list
                const ul = document.createElement('ul');
                cell.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                td.appendChild(ul);
            } else {
                td.textContent = cell;
            }
        });
    });
}

// Helper function for form submissions
async function submitForm(endpoint, data, msgElementId, tableRefreshFn) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const responseData = await response.json();
    const messageElement = document.getElementById(msgElementId);
    if (responseData.success) {
        messageElement.textContent = 'Success!';
        messageElement.style.color = 'green';
        if (tableRefreshFn) tableRefreshFn();
    } else {
        messageElement.textContent = 'Error!';
        messageElement.style.color = 'red';
    }
}

// Fetch and display smaller tables

async function fetchGrains() {
    const response = await fetch('/grains');
    const data = await response.json();
    displayTableData('grainsTable', data.data);
}

async function fetchVegetables() {
    const response = await fetch('/vegetables');
    const data = await response.json();
    displayTableData('vegetablesTable', data.data);
}

async function fetchFruits() {
    const response = await fetch('/fruits');
    const data = await response.json();
    displayTableData('fruitsTable', data.data);
}

async function fetchYields() {
    const response = await fetch('/cropyields');
    const data = await response.json();
    displayTableData('yieldsTable', data.data);
}

async function fetchIrrigation() {
    const response = await fetch('/irrigation');
    const data = await response.json();
    displayTableData('irrigationTable', data.data);
}

async function fetchSoil() {
    const response = await fetch('/soilrecords');
    const data = await response.json();
    displayTableData('soilTable', data.data);
}

// Form handlers for smaller tables

async function addGrain(event) {
    event.preventDefault();
    await submitForm('/add-grain', {
        cropID: document.getElementById('grainCropID').value,
        glutenContent: document.getElementById('grainGluten').value || null
    }, 'grainMsg', fetchGrains);
    document.getElementById('addGrainForm').reset();
}

async function addVegetable(event) {
    event.preventDefault();
    await submitForm('/add-vegetable', {
        cropID: document.getElementById('vegCropID').value,
        isLeafy: document.getElementById('vegIsLeafy').value
    }, 'vegMsg', fetchVegetables);
    document.getElementById('addVegetableForm').reset();
}

async function addFruit(event) {
    event.preventDefault();
    await submitForm('/add-fruit', {
        cropID: document.getElementById('fruitCropID').value,
        sugarContent: document.getElementById('fruitSugar').value || null
    }, 'fruitMsg', fetchFruits);
    document.getElementById('addFruitForm').reset();
}

async function addYield(event) {
    event.preventDefault();
    await submitForm('/add-cropyield', {
        cropID: document.getElementById('yieldCropID').value,
        totalYield: document.getElementById('yieldTotal').value,
        healthRating: document.getElementById('yieldHealth').value
    }, 'yieldMsg', fetchYields);
    document.getElementById('addYieldForm').reset();
}

async function addIrrigation(event) {
    event.preventDefault();
    await submitForm('/add-irrigation', {
        irrigID: document.getElementById('irrigID').value,
        fieldID: document.getElementById('irrigFieldID').value,
        eventDate: document.getElementById('irrigDate').value,
        volume: document.getElementById('irrigVolume').value || null
    }, 'irrigMsg', fetchIrrigation);
    document.getElementById('addIrrigationForm').reset();
}

async function addSoil(event) {
    event.preventDefault();
    await submitForm('/add-soilrecord', {
        soilCondID: document.getElementById('soilCondID').value,
        fieldID: document.getElementById('soilFieldID').value,
        sampleDate: document.getElementById('soilDate').value,
        pH: document.getElementById('soilPH').value
    }, 'soilMsg', fetchSoil);
    document.getElementById('addSoilForm').reset();
}

// Initialize webpage on load
// ---------------------------------------------------------------
window.onload = function () {
    checkDbConnection();

    // Auto-load all tables on main page
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === '/') {
        fetchAllTables();
    }

    // Initialization
    const initBtn = document.getElementById("initializeFarmTables");
    if (initBtn) {
        initBtn.addEventListener("click", initializeFarmTables);
    }

    // Populate
    const populateBtn = document.getElementById("populateTables");
    if (populateBtn) {
        populateBtn.addEventListener("click", populateTables);
    }

    // Main entity forms
    const mainForms = [
        ["addFarmerForm", addFarmer],
        ["addFarmForm", addFarm],
        ["addFieldForm", addField],
        ["addCropForm", addCrop],
        ["addPesticideForm", addPesticide],
        ["addCertForm", addCertification]
    ];

    // Main entity dispatcher
    mainForms.forEach(([id, fn]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("submit", fn);
        }
    });

    // Additional table forms
    const additionalForms = [
        ["addGrainForm", addGrain],
        ["addVegetableForm", addVegetable],
        ["addFruitForm", addFruit],
        ["addYieldForm", addYield],
        ["addIrrigationForm", addIrrigation],
        ["addSoilForm", addSoil]
    ];

    // Additional table dispatcher
    additionalForms.forEach(([id, fn]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("submit", fn);
        }
    });

    // Update forms
    const updateFarm = document.getElementById("updateFarmForm");
    if (updateFarm) {
        updateFarm.addEventListener("submit", updateFarmInfo);
    }

    // Delete forms
    const deleteFarm = document.getElementById("deleteFarmForm");
    if (deleteFarm) {
        deleteFarm.addEventListener("submit", deleteFarmInfo);
    }

    // Joined forms
    const joinFC = document.getElementById("joinFCForm");
    if (joinFC) {
        joinFC.addEventListener("submit", fetchJoinedFC);
    }

    // Projection forms
    const projectionForm = document.getElementById("projectionForm");
    if (projectionForm) {
        projectionForm.addEventListener("submit", fetchProjection);
    }

    // Selection forms
    const selectionForm = document.getElementById("selectionForm");
    if (selectionForm) {
        selectionForm.addEventListener("submit", fetchSelection);
    }

    // View buttons
    const viewBtns = [
        ["viewFarmers", fetchFarmers],
        ["viewFarms", fetchFarms],
        ["viewFields", fetchFields],
        ["viewCrops", fetchCrops],
        ["viewPesticides", fetchPesticides],
        ["viewCertifications", fetchCertifications],
        ["viewGrains", fetchGrains],
        ["viewVegetables", fetchVegetables],
        ["viewFruits", fetchFruits],
        ["viewYields", fetchYields],
        ["viewIrrigation", fetchIrrigation],
        ["viewSoil", fetchSoil],
        ["highestMoistureBtn", fetchHighestMoistureField],
        ["averageVolume", fetchAverageVolumes],
        ["healthyFields", fetchHealthyField],
        ["allPesticideBtn", fetchFieldsAllPesticides]
    ];

    // View dispatcher
    viewBtns.forEach(([id, fn]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("click", fn);
        }
    });
};
