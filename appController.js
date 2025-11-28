const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// ----------------------------------------------------------

router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

// Farm Management System API endpoints

// Initialize all farm tables
router.post("/initialize-farm-tables", async (req, res) => {
    const result = await appService.initializeFarmTables();
    if (result) {
        res.json({ success: true, message: "Farm tables initialized successfully" });
    } else {
        res.status(500).json({ success: false, message: "Error initializing farm tables" });
    }
});


// Populate tables with sql script
router.post("/populate-tables", async (req, res) => {
    const result = await appService.populateTables();
    if (result) {
        res.json({ success: true, message: "Populated all tables with sample data" });
    } else {
        res.status(500).json({ success: false, message: "Error populating tables" });
    }
});


// GET functions

router.get('/farmers', async (req, res) => {
    const farmers = await appService.fetchFarmers();
    res.json({ data: farmers });
});

router.get('/farms', async (req, res) => {
    const farms = await appService.fetchFarms();
    res.json({ data: farms });
});

router.get('/fields', async (req, res) => {
    const fields = await appService.fetchFields();
    res.json({ data: fields });
});

router.get('/crops', async (req, res) => {
    const crops = await appService.fetchCrops();
    res.json({ data: crops });
});

router.get('/pesticides', async (req, res) => {
    const pesticides = await appService.fetchPesticides();
    res.json({ data: pesticides });
});

router.get('/certifications', async (req, res) => {
    const certifications = await appService.fetchCertifications();
    res.json({ data: certifications });
});

router.get('/grains', async (req, res) => {
    const grains = await appService.fetchGrains();
    res.json({ data: grains });
});

router.get('/vegetables', async (req, res) => {
    const vegetables = await appService.fetchVegetables();
    res.json({ data: vegetables });
});

router.get('/fruits', async (req, res) => {
    const fruits = await appService.fetchFruits();
    res.json({ data: fruits });
});

router.get('/cropyields', async (req, res) => {
    const yields = await appService.fetchCropYields();
    res.json({ data: yields });
});

router.get('/treatments', async (req, res) => {
    const treatments = await appService.fetchTreatments();
    res.json({ data: treatments });
});

router.get('/irrigation', async (req, res) => {
    const records = await appService.fetchIrrigationRecords();
    res.json({ data: records });
});

router.get('/soilrecords', async (req, res) => {
    const records = await appService.fetchSoilRecords();
    res.json({ data: records });
});

router.get('/moisture', async (req, res) => {
    const data = await appService.fetchMoistureData();
    res.json({ data: data });
});

router.get('/seasons', async (req, res) => {
    const seasons = await appService.fetchSeasons();
    res.json({ data: seasons });
});

router.get('/croptypes', async (req, res) => {
    const types = await appService.fetchCropTypes();
    res.json({ data: types });
});

router.get('/awardexpiries', async (req, res) => {
    const expiries = await appService.fetchAwardExpiries();
    res.json({ data: expiries });
});

router.get('/receives', async (req, res) => {
    const receives = await appService.fetchReceives();
    res.json({ data: receives });
});

router.get('/contactinfo', async (req, res) => {
    const info = await appService.fetchContactInfo();
    res.json({ data: info });
});


router.get('/join-fc_table', async (req, res) => {
    const farmID = req.query.farmID;
    const result = await appService.joinFarmCrop(farmID);
    res.json(result);
})

router.get('/highest-moisture-f', async (req, res) => {
    const result = await appService.fetchHighestMoistureField();
    res.json(result);
})

router.get('/average-irrigation', async (req, res) => {
    const result = await appService.fetchAverageVolume();
    res.json(result);
})

router.get('/healthy-field', async (req, res) => {
    const result = await appService.fetchHealthyFields();
    res.json(result);
})

// Project 
router.get("/projection", async(req, res) => {
    const filter = { display: req.query.display };
    const result = await appService.getFields(filter);
    res.json(result);
})

router.get('/all-pesticides', async (req, res) => {
    const result = await appService.fetchFieldsAllPesticides();
    res.json(result);
})

// POST functions

router.post("/add-farmer", async (req, res) => {
    const { farmerID, name, contactInfo } = req.body;
    const result = await appService.insertFarmer(farmerID, name, contactInfo);
    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

router.post("/add-farm", async (req, res) => {
    const { farmID, name, location, farmerID } = req.body;
    const result = await appService.insertFarm(farmID, name, location, farmerID);
    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

router.post("/add-field", async (req, res) => {
    const { fieldID, farmID, area } = req.body;
    const result = await appService.insertField(fieldID, farmID, area);
    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

router.post("/add-crop", async (req, res) => {
    const { cropID, fieldID, cropName, plantDate, harvestDate, season } = req.body;
    const result = await appService.insertCrop(cropID, fieldID, cropName, plantDate, harvestDate, season);
    if (result) {
        res.json({ success: true, message: "Crop added successfully" });
    } else {
        res.status(500).json({ success: false, message: "Error adding crop" });
    }
});

router.post("/add-pesticide", async (req, res) => {
    const { pestID, name } = req.body;
    const result = await appService.insertPesticide(pestID, name);
    if (result) {
        res.json({ success: true, message: "Pesticide added successfully" });
    } else {
        res.status(500).json({ success: false, message: "Error adding pesticide" });
    }
});

router.post("/add-certification", async (req, res) => {
    const { certID, name, awardDate, expiryDate, farmID } = req.body;
    const result = await appService.insertCertification(certID, name, awardDate, expiryDate, farmID);
    if (result) {
        res.json({ success: true, message: "Certification added successfully" });
    } else {
        res.status(500).json({ success: false, message: "Error adding certification" });
    }
});

router.post("/add-grain", async (req, res) => {
    const { cropID, glutenContent } = req.body;
    const result = await appService.insertGrain(cropID, glutenContent);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/add-vegetable", async (req, res) => {
    const { cropID, isLeafy } = req.body;
    const result = await appService.insertVegetable(cropID, isLeafy);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/add-fruit", async (req, res) => {
    const { cropID, sugarContent } = req.body;
    const result = await appService.insertFruit(cropID, sugarContent);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/add-cropyield", async (req, res) => {
    const { cropID, totalYield, healthRating } = req.body;
    const result = await appService.insertCropYield(cropID, totalYield, healthRating);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/add-treatment", async (req, res) => {
    const { cropID, pestID } = req.body;
    const result = await appService.insertTreatment(cropID, pestID);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/add-irrigation", async (req, res) => {
    const { irrigID, fieldID, eventDate, volume } = req.body;
    const result = await appService.insertIrrigationRecord(irrigID, fieldID, eventDate, volume);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/add-soilrecord", async (req, res) => {
    const { soilCondID, fieldID, sampleDate, pH, moisture } = req.body;
    const result = await appService.insertSoilRecord(soilCondID, fieldID, sampleDate, pH, moisture);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/add-moisture", async (req, res) => {
    const { sampleDate, pH, moisture } = req.body;
    const result = await appService.insertMoistureData(sampleDate, pH, moisture);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/add-receives", async (req, res) => {
    const { farmID, certID } = req.body;
    const result = await appService.insertReceives(farmID, certID);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-farms", async (req, res) => {
    const { farmID, farmName, location, farmerID } = req.body;
    const result = await appService.updateFarmInfo(farmID, farmName, location, farmerID);
    if (result.success) {
        res.json(result);
    } else {
        // client error
        res.status(400).json(result);
    }
})

// Delete 
router.post("/delete-farms", async (req, res) => {
    const { farmID } = req.body;
    const result = await appService.deleteFarmsInfo(farmID);
    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
})

// Selection
router.post("/selection", async (req, res) => {
    const result = await appService.selectFields(req.body);
    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
})

module.exports = router;