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
    } else {
        messageElement.textContent = 'Error initializing farm tables!';
        messageElement.style.color = 'red';
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

// Helper function to display table data
function displayTableData(tableId, data) {
    const tableElement = document.getElementById(tableId);
    const tableBody = tableElement.querySelector('tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    data.forEach(row => {
        const tr = tableBody.insertRow();
        row.forEach((cell, index) => {
            const td = tr.insertCell(index);
            td.textContent = cell;
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
window.onload = function() {
    checkDbConnection();
    
    // Auto-load all tables
    fetchFarmers();
    fetchFarms();
    fetchFields();
    fetchCrops();
    fetchPesticides();
    fetchCertifications();
    fetchGrains();
    fetchVegetables();
    fetchFruits();
    fetchYields();
    fetchIrrigation();
    fetchSoil();
    
    // Initialization
    document.getElementById("initializeFarmTables").addEventListener("click", initializeFarmTables);
    
    // Main entity forms
    document.getElementById("addFarmerForm").addEventListener("submit", addFarmer);
    document.getElementById("addFarmForm").addEventListener("submit", addFarm);
    document.getElementById("addFieldForm").addEventListener("submit", addField);
    document.getElementById("addCropForm").addEventListener("submit", addCrop);
    document.getElementById("addPesticideForm").addEventListener("submit", addPesticide);
    document.getElementById("addCertForm").addEventListener("submit", addCertification);
    
    // Additional table forms
    document.getElementById("addGrainForm").addEventListener("submit", addGrain);
    document.getElementById("addVegetableForm").addEventListener("submit", addVegetable);
    document.getElementById("addFruitForm").addEventListener("submit", addFruit);
    document.getElementById("addYieldForm").addEventListener("submit", addYield);
    document.getElementById("addIrrigationForm").addEventListener("submit", addIrrigation);
    document.getElementById("addSoilForm").addEventListener("submit", addSoil);
    
    // View buttons
    document.getElementById("viewFarmers").addEventListener("click", fetchFarmers);
    document.getElementById("viewFarms").addEventListener("click", fetchFarms);
    document.getElementById("viewFields").addEventListener("click", fetchFields);
    document.getElementById("viewCrops").addEventListener("click", fetchCrops);
    document.getElementById("viewPesticides").addEventListener("click", fetchPesticides);
    document.getElementById("viewCertifications").addEventListener("click", fetchCertifications);
    document.getElementById("viewGrains").addEventListener("click", fetchGrains);
    document.getElementById("viewVegetables").addEventListener("click", fetchVegetables);
    document.getElementById("viewFruits").addEventListener("click", fetchFruits);
    document.getElementById("viewYields").addEventListener("click", fetchYields);
    document.getElementById("viewIrrigation").addEventListener("click", fetchIrrigation);
    document.getElementById("viewSoil").addEventListener("click", fetchSoil);
};
