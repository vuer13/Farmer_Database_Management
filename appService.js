const fs = require("fs").promises;

const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');
const validate = require('./validation');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// ----------------------------------------------------------

async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

// Helper functions
function splitSqlStatements(sqlfile) {
    return sqlfile
      .split(";")
      .map(s => {
            return s.split("\n")
                    .map(line => line.replace(/--.*$/, '').trim())
                    .filter(line => line.length > 0)
                    .join(" ");
        })
      .filter(s => s.length > 0);
}

//Farm Management System Functions

// Initialize tables

async function initializeFarmTables() {
    return await withOracleDB(async (connection) => {
        try {
            // Drop tables
            const dropTables = [
                'Receives', 'Certification', 'AwardExpiry',
                'SoilRecords', 'MoistureByChemistry', 'IrrigationRecords',
                'Treats', 'Pesticide', 'CropYieldProduces',
                'Fruit', 'Vegetable', 'Grain', 'GrowsCrop',
                'CropType', 'SeasonByPlantDate', 'ContainsField',
                'OwnsFarm', 'Farmer', 'ContactInfoName'
            ];

            for (const table of dropTables) {
                try {
                    await connection.execute(`DROP TABLE ${table} CASCADE CONSTRAINTS`);
                } catch(err) {
                    // Table might not exist
                }
            }

            // Create tables
            await connection.execute(`
                CREATE TABLE ContactInfoName (
                    ContactInfo VARCHAR2(80) PRIMARY KEY,
                    Name VARCHAR2(20) NOT NULL
                )
            `);

            // Farmer table
            await connection.execute(`
                CREATE TABLE Farmer (
                    FarmerID NUMBER PRIMARY KEY,
                    ContactInfo VARCHAR2(80) NOT NULL UNIQUE,
                    CONSTRAINT fk_farmer_contact
                        FOREIGN KEY (ContactInfo) REFERENCES ContactInfoName(ContactInfo)
                )
            `);

            // OwnsFarm table
            await connection.execute(`
                CREATE TABLE OwnsFarm (
                    FarmID NUMBER PRIMARY KEY,
                    Name VARCHAR2(20) NOT NULL,
                    Location VARCHAR2(20) NOT NULL,
                    FarmerID NUMBER NOT NULL,
                    CONSTRAINT fk_farm_farmer
                        FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID)
                )
            `);

            // ContainsField table
            await connection.execute(`
                CREATE TABLE ContainsField (
                    FieldID NUMBER PRIMARY KEY,
                    FarmID NUMBER NOT NULL,
                    Area NUMBER,
                    CONSTRAINT fk_field_farm
                        FOREIGN KEY (FarmID) REFERENCES OwnsFarm(FarmID)
                        ON DELETE CASCADE
                )
            `);

            // SeasonByPlantDate table
            await connection.execute(`
                CREATE TABLE SeasonByPlantDate (
                    PlantingDate DATE PRIMARY KEY,
                    Season VARCHAR2(20) NOT NULL
                )
            `);

            // CropType table
            await connection.execute(`
                CREATE TABLE CropType (
                    Name VARCHAR2(60) PRIMARY KEY,
                    PlantingDate DATE NOT NULL,
                    HarvestDate DATE NOT NULL,
                    CONSTRAINT fk_croptype_plantdate
                        FOREIGN KEY (PlantingDate) REFERENCES SeasonByPlantDate(PlantingDate)
                )
            `);

            // GrowsCrop table
            await connection.execute(`
                CREATE TABLE GrowsCrop (
                    CropID NUMBER PRIMARY KEY,
                    FieldID NUMBER NOT NULL,
                    Name VARCHAR2(60) NOT NULL,
                    CONSTRAINT fk_crop_field
                        FOREIGN KEY (FieldID) REFERENCES ContainsField(FieldID)
                        ON DELETE CASCADE,
                    CONSTRAINT fk_crop_name
                        FOREIGN KEY (Name) REFERENCES CropType(Name)
                )
            `);

            // Grain table
            await connection.execute(`
                CREATE TABLE Grain (
                    CropID NUMBER PRIMARY KEY,
                    GlutenContent NUMBER(10,2),
                    CONSTRAINT fk_grain_crop
                        FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
                        ON DELETE CASCADE
                )
            `);

            // Vegetable table
            await connection.execute(`
                CREATE TABLE Vegetable (
                    CropID NUMBER PRIMARY KEY,
                    IsLeafy NUMBER(1) NOT NULL,
                    CONSTRAINT ck_veg_bool CHECK (IsLeafy IN (0,1)),
                    CONSTRAINT fk_veg_crop
                        FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
                        ON DELETE CASCADE
                )
            `);

            // Fruit table
            await connection.execute(`
                CREATE TABLE Fruit (
                    CropID NUMBER PRIMARY KEY,
                    SugarContent NUMBER(10,2),
                    CONSTRAINT fk_fruit_crop
                        FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
                        ON DELETE CASCADE
                )
            `);

            // CropYieldProduces table
            await connection.execute(`
                CREATE TABLE CropYieldProduces (
                    CropID NUMBER PRIMARY KEY,
                    Total_Yield NUMBER(10,2) NOT NULL,
                    Health_Rating NUMBER NOT NULL,
                    CONSTRAINT fk_yield_crop
                        FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
                        ON DELETE CASCADE
                )
            `);

            // Pesticide table
            await connection.execute(`
                CREATE TABLE Pesticide (
                    PestID NUMBER PRIMARY KEY,
                    Name VARCHAR2(60)
                )
            `);

            // Treats table
            await connection.execute(`
                CREATE TABLE Treats (
                    CropID NUMBER,
                    PestID NUMBER,
                    PRIMARY KEY (CropID, PestID),
                    CONSTRAINT fk_treats_crop
                        FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
                        ON DELETE CASCADE,
                    CONSTRAINT fk_treats_pest
                        FOREIGN KEY (PestID) REFERENCES Pesticide(PestID)
                        ON DELETE CASCADE
                )
            `);

            // IrrigationRecords table
            await connection.execute(`
                CREATE TABLE IrrigationRecords (
                    IrrigID NUMBER PRIMARY KEY,
                    FieldID NUMBER NOT NULL,
                    EventDate DATE,
                    Volume NUMBER(10,2),
                    CONSTRAINT fk_irrig_field
                        FOREIGN KEY (FieldID) REFERENCES ContainsField(FieldID)
                        ON DELETE CASCADE
                )
            `);

            // MoistureByChemistry table
            await connection.execute(`
                CREATE TABLE MoistureByChemistry (
                    SampleDate DATE,
                    pH NUMBER(4,2),
                    Moisture NUMBER(6,2) NOT NULL,
                    PRIMARY KEY (SampleDate, pH)
                )
            `);

            // SoilRecords table
            await connection.execute(`
                CREATE TABLE SoilRecords (
                    SoilCondID NUMBER PRIMARY KEY,
                    FieldID NUMBER NOT NULL,
                    SampleDate DATE NOT NULL,
                    pH NUMBER(4,2) NOT NULL,
                    CONSTRAINT fk_soil_field
                        FOREIGN KEY (FieldID) REFERENCES ContainsField(FieldID)
                        ON DELETE CASCADE,
                    CONSTRAINT fk_soil_rule
                        FOREIGN KEY (SampleDate, pH) REFERENCES MoistureByChemistry(SampleDate, pH)
                )
            `);

            // AwardExpiry table
            await connection.execute(`
                CREATE TABLE AwardExpiry (
                    AwardedDate DATE PRIMARY KEY,
                    ExpiryDate DATE NOT NULL
                )
            `);

            // Certification table
            await connection.execute(`
                CREATE TABLE Certification (
                    CertID NUMBER PRIMARY KEY,
                    Name VARCHAR2(80) NOT NULL,
                    AwardedDate DATE NOT NULL,
                    CONSTRAINT fk_cert_award
                        FOREIGN KEY (AwardedDate) REFERENCES AwardExpiry(AwardedDate)
                )
            `);

            // Receives table
            await connection.execute(`
                CREATE TABLE Receives (
                    FarmID NUMBER,
                    CertID NUMBER,
                    PRIMARY KEY (FarmID, CertID),
                    CONSTRAINT fk_recv_farm
                        FOREIGN KEY (FarmID) REFERENCES OwnsFarm(FarmID)
                        ON DELETE CASCADE,
                    CONSTRAINT fk_recv_cert
                        FOREIGN KEY (CertID) REFERENCES Certification(CertID)
                )
            `);

            return true;
        } catch (err) {
            console.error('Error initializing farm tables:', err);
            return false;
        }
    }).catch(() => {
        return false;
    });
}

// Populate tables with sql script
async function populateTables() {
    return await withOracleDB(async (connection) => {
        try {
        const sqlFile = await fs.readFile("project.sql", "utf-8");
        const statements = splitSqlStatements(sqlFile);

        for (const statement of statements) {
            try {
                await connection.execute(statement);
                await connection.commit();
            } catch (err) {
                // dropping a table that does not exist (errno 942) should not cause failure, anything else should
                if (err.errorNum !== 942) {
                    console.error(`Error executing SQL statement:\n ${statement}\n`, err);
                    return false;
                }
            }
        }

        return true;
        } catch (err) {
            console.error("Failed to read SQL file or parse statements:", err);
            return false;
        }
    }).catch(() => {
        return false;
    });
    
}


// Fetch functions

async function fetchFarmers() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT f.FarmerID, f.ContactInfo, c.Name 
             FROM Farmer f 
             JOIN ContactInfoName c ON f.ContactInfo = c.ContactInfo 
             ORDER BY f.FarmerID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchFarms() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT o.FarmID, o.Name, o.Location, o.FarmerID, c.Name as FarmerName
             FROM OwnsFarm o
             JOIN Farmer f ON o.FarmerID = f.FarmerID
             JOIN ContactInfoName c ON f.ContactInfo = c.ContactInfo
             ORDER BY o.FarmID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchFields() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT cf.FieldID, cf.FarmID, cf.Area, o.Name as FarmName
             FROM ContainsField cf
             JOIN OwnsFarm o ON cf.FarmID = o.FarmID
             ORDER BY cf.FieldID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchCrops() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT g.CropID, g.FieldID, g.Name, ct.PlantingDate, ct.HarvestDate
             FROM GrowsCrop g
             JOIN CropType ct ON g.Name = ct.Name
             ORDER BY g.CropID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchPesticides() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT PestID, Name FROM Pesticide ORDER BY PestID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchCertifications() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT c.CertID, c.Name, c.AwardedDate, a.ExpiryDate
             FROM Certification c
             JOIN AwardExpiry a ON c.AwardedDate = a.AwardedDate
             ORDER BY c.CertID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchGrains() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Grain ORDER BY CropID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchVegetables() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Vegetable ORDER BY CropID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchFruits() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Fruit ORDER BY CropID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchCropYields() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM CropYieldProduces ORDER BY CropID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchIrrigationRecords() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM IrrigationRecords ORDER BY IrrigID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchSoilRecords() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM SoilRecords ORDER BY SoilCondID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchTreatments() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Treats ORDER BY CropID, PestID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchMoistureData() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM MoistureByChemistry ORDER BY SampleDate`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchSeasons() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM SeasonByPlantDate ORDER BY PlantingDate`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchCropTypes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM CropType ORDER BY Name`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchAwardExpiries() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM AwardExpiry ORDER BY AwardedDate`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchReceives() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Receives ORDER BY FarmID, CertID`
        );
        return result.rows;
    }).catch(() => { return []; });
}

async function fetchContactInfo() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM ContactInfoName ORDER BY ContactInfo`
        );
        return result.rows;
    }).catch(() => { return []; });
}

// Insert functions

async function insertFarmer(farmerID, name, contactInfo) {
    // Validation with error handling
    if (!validate.isPositiveInteger(farmerID)) {
        return { success: false, message: "Farmer ID must be a positive integer." };
    }
    if (!validate.isValidString(name, 20)) {
        return { success: false, message: "Name must be between 1-20 characters." };
    }
    if (!validate.isValidEmail(contactInfo)) {
        return { success: false, message: "Please enter a valid email address." };
    }

    return await withOracleDB(async (connection) => {
        try {
            // Insert ContactInfoName
            await connection.execute(
                `INSERT INTO ContactInfoName VALUES (:contactInfo, :name)`,
                [contactInfo, name],
                { autoCommit: false }
            );
            // Insert Farmer
            await connection.execute(
                `INSERT INTO Farmer VALUES (:farmerID, :contactInfo)`,
                [farmerID, contactInfo],
                { autoCommit: false }
            );
            await connection.commit();
            return { success: true, message: "Farmer added successfully!" };
        } catch (err) {
            console.error('Error inserting farmer:', err);
            await connection.rollback();
            
            // Handle specific Oracle errors
            if (err.errorNum === 1) {
                return { success: false, message: "Farmer ID or email already exists. Please use different values." };
            } else if (err.errorNum === 1400) {
                return { success: false, message: "Missing required field. All fields are required." };
            } else if (err.errorNum === 12899) {
                return { success: false, message: "Input too long. Name max 20 chars, email max 80 chars." };
            }
            
            return { success: false, message: "Database error: " + err.message };
        }
    }).catch((err) => {
        console.error("Connection error:", err);
        return { success: false, message: "Unable to connect to database." };
    });
}

async function insertFarm(farmID, name, location, farmerID) {
    // Validation with error handling
    if (!validate.isPositiveInteger(farmID)) {
        return { success: false, message: "Farm ID must be a positive integer." };
    }
    if (!validate.isValidString(name, 20)) {
        return { success: false, message: "Farm name must be between 1-20 characters." };
    }
    if (!validate.isValidString(location, 20)) {
        return { success: false, message: "Location must be between 1-20 characters." };
    }
    if (!validate.isPositiveInteger(farmerID)) {
        return { success: false, message: "Farmer ID must be a positive integer." };
    }

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `INSERT INTO OwnsFarm VALUES (:farmID, :name, :location, :farmerID)`,
                [farmID, name, location, farmerID],
                { autoCommit: true }
            );
            if (result.rowsAffected && result.rowsAffected > 0) {
                return { success: true, message: "Farm added successfully!" };
            }
            return { success: false, message: "Failed to add farm." };
        } catch (err) {
            console.error("Insert farm error:", err);
            
            // Handle specific Oracle errors
            if (err.errorNum === 1) {
                return { success: false, message: "Farm ID already exists. Please use a different ID." };
            } else if (err.errorNum === 2291) {
                return { success: false, message: "Farmer ID not found. Please enter a valid Farmer ID." };
            } else if (err.errorNum === 1400) {
                return { success: false, message: "Missing required field. All fields are required." };
            } else if (err.errorNum === 12899) {
                return { success: false, message: "Input too long. Please shorten your entries." };
            }
            
            return { success: false, message: "Database error: " + err.message };
        }
    }).catch((err) => {
        console.error("Connection error:", err);
        return { success: false, message: "Unable to connect to database." };
    });
}

async function insertField(fieldID, farmID, area) {
    // Validation with error handling
    if (!validate.isPositiveInteger(fieldID)) {
        return { success: false, message: "Field ID must be a positive integer." };
    }
    if (!validate.isPositiveInteger(farmID)) {
        return { success: false, message: "Farm ID must be a positive integer." };
    }
    if (area !== null && area !== undefined && !validate.isNonNegativeNumber(area)) {
        return { success: false, message: "Area must be a non-negative number." };
    }

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `INSERT INTO ContainsField VALUES (:fieldID, :farmID, :area)`,
                [fieldID, farmID, area],
                { autoCommit: true }
            );
            if (result.rowsAffected && result.rowsAffected > 0) {
                return { success: true, message: "Field added successfully!" };
            }
            return { success: false, message: "Failed to add field." };
        } catch (err) {
            console.error("Insert field error:", err);
            
            // Handle specific Oracle errors
            if (err.errorNum === 1) {
                return { success: false, message: "Field ID already exists. Please use a different ID." };
            } else if (err.errorNum === 2291) {
                return { success: false, message: "Farm ID not found. Please enter a valid Farm ID." };
            } else if (err.errorNum === 1400) {
                return { success: false, message: "Missing required field. Field ID and Farm ID are required." };
            } else if (err.errorNum === 1722) {
                return { success: false, message: "Invalid number format. Please enter valid numbers." };
            }
            
            return { success: false, message: "Database error: " + err.message };
        }
    }).catch((err) => {
        console.error("Connection error:", err);
        return { success: false, message: "Unable to connect to database." };
    });
}

async function insertCrop(cropID, fieldID, cropName, plantDate, harvestDate, season) {
    if (!validate.isPositiveInteger(cropID) || 
        !validate.isPositiveInteger(fieldID) || 
        !validate.isValidString(cropName, 60) || 
        !validate.isValidDate(plantDate) || 
        !validate.isValidDate(harvestDate) || 
        !validate.isValidString(season, 20)) {
        return false;
    }
    // Harvest must be after planting
    if (new Date(harvestDate) <= new Date(plantDate)) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        try {
            // Insert SeasonByPlantDate
            try {
                await connection.execute(
                    `INSERT INTO SeasonByPlantDate VALUES (TO_DATE(:plantDate, 'YYYY-MM-DD'), :season)`,
                    [plantDate, season],
                    { autoCommit: false }
                );
            } catch (err) {
                // Error if Season/Date already exists
            }
            
            // Insert CropType
            try {
                await connection.execute(
                    `INSERT INTO CropType VALUES (:cropName, TO_DATE(:plantDate, 'YYYY-MM-DD'), TO_DATE(:harvestDate, 'YYYY-MM-DD'))`,
                    [cropName, plantDate, harvestDate],
                    { autoCommit: false }
                );
            } catch (err) {
                // Error if Crop already exists
            }
            
            // Insert GrowsCrop
            await connection.execute(
                `INSERT INTO GrowsCrop VALUES (:cropID, :fieldID, :cropName)`,
                [cropID, fieldID, cropName],
                { autoCommit: false }
            );
            
            await connection.commit();
            return true;
        } catch (err) {
            console.error('Error inserting crop:', err);
            await connection.rollback();
            return false;
        }
    }).catch(() => {
        return false;
    });
}

async function insertPesticide(pestID, name) {
    if (!validate.isPositiveInteger(pestID) || 
        !validate.isValidString(name, 60)) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Pesticide VALUES (:pestID, :name)`,
            [pestID, name],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function insertCertification(certID, name, awardDate, expiryDate, farmID) {
    if (!validate.isPositiveInteger(certID) || 
        !validate.isValidString(name, 80) || 
        !validate.isValidDate(awardDate) || 
        !validate.isValidDate(expiryDate) || 
        !validate.isPositiveInteger(farmID)) {
        return false;
    }
    // Expiry must be after award
    if (new Date(expiryDate) <= new Date(awardDate)) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        try {
            // Insert AwardExpiry
            try {
                await connection.execute(
                    `INSERT INTO AwardExpiry VALUES (TO_DATE(:awardDate, 'YYYY-MM-DD'), TO_DATE(:expiryDate, 'YYYY-MM-DD'))`,
                    [awardDate, expiryDate],
                    { autoCommit: false }
                );
            } catch (err) {
                // Error if Award date already exists
            }
            
            // Insert Certification
            await connection.execute(
                `INSERT INTO Certification VALUES (:certID, :name, TO_DATE(:awardDate, 'YYYY-MM-DD'))`,
                [certID, name, awardDate],
                { autoCommit: false }
            );
            
            // Insert Receives
            await connection.execute(
                `INSERT INTO Receives VALUES (:farmID, :certID)`,
                [farmID, certID],
                { autoCommit: false }
            );
            
            await connection.commit();
            return true;
        } catch (err) {
            console.error('Error inserting certification:', err);
            await connection.rollback();
            return false;
        }
    }).catch(() => {
        return false;
    });
}

async function insertGrain(cropID, glutenContent) {
    if (!validate.isPositiveInteger(cropID) || 
        (glutenContent !== null && glutenContent !== undefined && !validate.isNonNegativeNumber(glutenContent))) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Grain VALUES (:cropID, :glutenContent)`,
            [cropID, glutenContent],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertVegetable(cropID, isLeafy) {
    if (!validate.isPositiveInteger(cropID) || 
        !validate.isValidBoolean(isLeafy)) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Vegetable VALUES (:cropID, :isLeafy)`,
            [cropID, isLeafy],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertFruit(cropID, sugarContent) {
    if (!validate.isPositiveInteger(cropID) || 
        (sugarContent !== null && sugarContent !== undefined && !validate.isNonNegativeNumber(sugarContent))) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Fruit VALUES (:cropID, :sugarContent)`,
            [cropID, sugarContent],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertCropYield(cropID, totalYield, healthRating) {
    if (!validate.isPositiveInteger(cropID) || 
        !validate.isNonNegativeNumber(totalYield) || 
        !validate.isValidHealthRating(healthRating)) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO CropYieldProduces VALUES (:cropID, :totalYield, :healthRating)`,
            [cropID, totalYield, healthRating],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertTreatment(cropID, pestID) {
    if (!validate.isPositiveInteger(cropID) || 
        !validate.isPositiveInteger(pestID)) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Treats VALUES (:cropID, :pestID)`,
            [cropID, pestID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertIrrigationRecord(irrigID, fieldID, eventDate, volume) {
    if (!validate.isPositiveInteger(irrigID) || 
        !validate.isPositiveInteger(fieldID) || 
        (eventDate && !validate.isValidDate(eventDate)) || 
        (volume !== null && volume !== undefined && !validate.isNonNegativeNumber(volume))) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO IrrigationRecords VALUES (:irrigID, :fieldID, TO_DATE(:eventDate, 'YYYY-MM-DD'), :volume)`,
            [irrigID, fieldID, eventDate, volume],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertSoilRecord(soilCondID, fieldID, sampleDate, pH, moisture) {
    if (!validate.isPositiveInteger(soilCondID) || 
        !validate.isPositiveInteger(fieldID) || 
        !validate.isValidDate(sampleDate) || 
        !validate.isValidpH(pH) ||
        !validate.isNonNegativeNumber(moisture)) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        // Insert MoistureByChemistry if not exists
        try {
            await connection.execute(
                `INSERT INTO MoistureByChemistry VALUES (TO_DATE(:sampleDate, 'YYYY-MM-DD'), :pH, :moisture)`,
                [sampleDate, pH, moisture],
                { autoCommit: true }
            );
        } catch (err) {
            // Entry already exists
        }
        
        const result = await connection.execute(
            `INSERT INTO SoilRecords VALUES (:soilCondID, :fieldID, TO_DATE(:sampleDate, 'YYYY-MM-DD'), :pH)`,
            [soilCondID, fieldID, sampleDate, pH],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertMoistureData(sampleDate, pH, moisture) {
    if (!validate.isValidDate(sampleDate) || 
        !validate.isValidpH(pH) || 
        !validate.isNonNegativeNumber(moisture)) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO MoistureByChemistry VALUES (TO_DATE(:sampleDate, 'YYYY-MM-DD'), :pH, :moisture)`,
            [sampleDate, pH, moisture],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertReceives(farmID, certID) {
    if (!validate.isPositiveInteger(farmID) || 
        !validate.isPositiveInteger(certID)) {
        return false;
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Receives VALUES (:farmID, :certID)`,
            [farmID, certID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

// Allows transfer of farm to new farmer, or change name/location of farm
async function updateFarmInfo(farmID, farmName, location, farmerID) {
    // Validate farmID is required and positive
    if (!validate.isPositiveInteger(farmID)) {
        return { success: false, message: "Invalid Farm ID. Must be a positive integer." };
    }

    const updates = [];
    const values = {};

    values.farmID = farmID;

    if (farmName?.trim()) {
        if (!validate.isValidString(farmName, 20)) {
            return { success: false, message: "Invalid farm name. Must be 1-20 characters." };
        }
        updates.push("Name = :farmName");
        values.farmName = farmName;
    }
    
    if (location?.trim()) {
        if (!validate.isValidString(location, 20)) {
            return { success: false, message: "Invalid location. Must be 1-20 characters." };
        }
        updates.push("Location = :location");
        values.location = location;
    }

    if (farmerID?.trim()) {
        if (!validate.isPositiveInteger(farmerID)) {
            return { success: false, message: "Invalid Farmer ID. Must be a positive integer." };
        }
        updates.push("FarmerID = :farmerID");
        values.farmerID = farmerID;
    }

    // Empty fields
    if (updates.length === 0) {
        return { success: false, message: "Update fields are all blank. Please check and try again." };
    }

    const sql = `UPDATE OwnsFarm
                SET ${updates.join(", ")}
                WHERE FarmID = :farmID`;
    
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                sql,values, { autoCommit: true }
            );

            if (result.rowsAffected === 0) {
                return { success: false, message: "No farm found with this FarmID. Please check and try again." };
            }

            return { success: true, message: "Update successful!" };
        } catch (err) {
            // foreign key violation (does not exist)
            if (err.errorNum === 2291) {
                return { success: false, message: "farmerID not recognized. Please provide a valid existing farmerID." };
            }

            // log error and return generic err message
            console.error("Database error:", err);
            return { success: false, message: "Update failed due to an unexpected error"};
        }
    }).catch((err) => {
        console.error("Database connection failed:", err);
        return { success: false, message: "Update failed due to an unexpected error" };
    });
}

// Delete farms
async function deleteFarmsInfo(farmID) {
    if (!validate.isPositiveInteger(farmID)) {
        return { success: false, message: "Invalid Farm ID. Must be a positive integer." };
    }
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                'DELETE FROM OwnsFarm WHERE FarmID = :farmID', [farmID], { autoCommit: true });
            
            if (result.rowsAffected === 0) {
                return { success: false, message: "No farm found with this FarmID. Please check and try again." };
            }
    
            return { success: true, message: "Cascade Delete successful!" };
        } catch (err) {
            console.error("Database error:", err);
            return { success: false, message: "Delete failed due to an unexpected error"};
        }
    }).catch((err) => {
        console.error("Database error:", err);
        return { success: false, message: "Delete failed due to an unexpected error"};
    })
};

// Joins farms with the crops they grow
async function joinFarmCrop(farmID) {
    if (!validate.isPositiveInteger(farmID)) {
        return { success: false, message: "Invalid Farm ID. Must be a positive integer.", data: null };
    }
    // Includes contact info and name even if farm has no crops or fields
    const sql = `SELECT
                    f.FarmID,
                    cin.Name AS FarmerName,
                    cin.ContactInfo,
                    ct.Name AS CropName
                FROM OwnsFarm f
                JOIN Farmer fr ON f.FarmerID = fr.FarmerID
                JOIN ContactInfoName cin ON fr.ContactInfo = cin.ContactInfo
                LEFT JOIN ContainsField fld ON f.farmID = fld.FarmID
                LEFT JOIN GrowsCrop gc ON fld.FieldID = gc.FieldID
                LEFT JOIN CropType ct ON gc.Name = ct.Name
                WHERE f.FarmID = :farmID
                ORDER BY ct.Name
                `

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                sql,
                { farmID }
            );

            if (result.rows.length == 0) {
                return {
                    success: false,
                    message: "No farm found for this FarmID. Please check and try again.",
                    data: null
                };
            }

            return {
                success: true,
                message: "Search successful!",
                data: result.rows
            };
        } catch (err) {
            console.error("Database error:", err);
            return { success: false, message: "Query failed due to an unexpected error." };
        }
    }).catch((err) => {
        console.error("Database connection failed", err);
        return { success: false, message: "Query failed due to an unexpected error." };
    });
}

// project Fields joined
async function getFields(filter) {
    const fieldFields = ["FieldID", "FarmID", "Area"];

    const selectCols = [];

    if (!filter) {
        return {
            success: false,
            message: "No columns selected. Please choose at least one valid field.",
            data: []
        };
    }

    if (filter.display) {
        const cols = filter.display.split(",");

        cols.forEach(col => {
            // ContainsField table
            if (col === "FarmID")       selectCols.push("fd.FarmID AS FarmID");
            if (col === "FieldID")      selectCols.push("fd.FieldID AS FieldID");
            if (col === "Area")         selectCols.push("fd.Area AS Area");
        });
    }

    // Error handling, 0 features chosen send error
    if (selectCols.length === 0) {
        return {
            success: false,
            message: "None of the selected columns exist. Please choose valid fields.",
            data: []
        };
    }

    const select = `SELECT ${selectCols.join(", ")}`;
    const from = `FROM ContainsField fd 
                `;

    const query = `${select} ${from}`;

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(query);
            return {
                success: true,
                message: 'Projection sucessful!',
                data: result.rows
            }
        } catch (err) {
            console.error("Database error:", err);
            return { success: false, message: "Projection failed due to an unexpected error." };
        }
    }).catch((err) => {
        console.error("Database error:", err);
        return { success: false, message: "Projection failed due to an unexpected error." };
    });
}

// Select fields based on different criteria user specifies
async function selectFields(filter) {
    const validAttributes = ["FieldID", "FarmID", "Area"];
    const validOperators = ["=", "<>", ">", "<", ">=", "<="];
    const validConnectors = ["AND", "OR"];

    let whereParts = [];
    let binds = {};

    filter.conditions.forEach((cond, idx) => {
        const attr = cond.attribute;
        const op = cond.operator;
        const val = cond.value;
        const join = cond.connector;

        if (!validAttributes.includes(attr)) return;
        if (!validOperators.includes(op)) return;
        if (idx > 0 && !validConnectors.includes(join)) return;

        const bindKey = `v${idx}`;
        binds[bindKey] = val;

        const clause = `${attr} ${op} :${bindKey}`;

        if (idx === 0) {
            whereParts.push(clause);
        } else {
            whereParts.push(`${join} ${clause}`);
        }
    });

    // Select the whole table if no restrictions apply
    if (whereParts.length === 0) {
        const sql = `SELECT FieldID, FarmID, Area FROM ContainsField`;
        return await withOracleDB(async (connection) => {
            try {
                const result = await connection.execute(sql);
                return {
                    success: true,
                    message: "Selection successful!",
                    data: result.rows
                };
            } catch (err) {
                console.error("Selection SQL error:", err);
                return { success: false, message: "Selection failed due to an unexpected error." };
            }
        });
    }

    const where = "WHERE " + whereParts.join(" ");
    const sql = `SELECT FieldID, FarmID, Area
                FROM ContainsField
                ${where}
                `;

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(sql, binds);
            return {
                success: true,
                message: 'Selection sucessful!',
                data: result.rows
            }
        } catch (err) {
            console.error("Database error:", err);
            return { success: false, message: "Selection failed due to an unexpected error." };
        }
    }).catch((err) => {
        console.error("Database error:", err);
        return { success: false, message: "Selection failed due to an unexpected error." };
    });
}

// find the average volume for each field
async function fetchAverageVolume() {
    const sql = `SELECT i.FieldID, o.Name, AVG(i.Volume) as AvgVolume
                FROM IrrigationRecords i
                JOIN ContainsField f ON f.FieldID = i.FieldID
                JOIN OwnsFarm o ON o.FarmID = f.FarmID
                GROUP BY o.Name, i.FieldID
                ORDER BY i.FieldID ASC
                `;

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(sql);

            return {
                success: true,
                message: "Search successful!",
                data: result.rows
            };
        } catch (err) {
            console.error("Database error:", err);
            return { success: false, message: "Query failed due to an unexpected error." };
        }
    }).catch((err) => {
        console.error("Database connection failed", err);
        return { success: false, message: "Query failed due to an unexpected error." };
    });
}

// fetch all fields that have a healthy average pH
async function fetchHealthyFields() {
    const sql = `SELECT s.FieldID, o.Name, AVG(s.pH) as AvgpH
                FROM SoilRecords s
                JOIN ContainsField f ON f.FieldID = s.FieldID
                JOIN OwnsFarm o ON o.FarmID = f.FarmID
                GROUP BY o.Name, s.FieldID
                HAVING AVG(s.pH) BETWEEN 5.5 AND 7.5
                ORDER BY s.FieldID ASC
                `;

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(sql);

            return {
                success: true,
                message: "Search successful!",
                data: result.rows
            };
        } catch (err) {
            console.error("Database error:", err);
            return { success: false, message: "Query failed due to an unexpected error." };
        }
    }).catch((err) => {
        console.error("Database connection failed", err);
        return { success: false, message: "Query failed due to an unexpected error." };
    });
}


// fetch fields with highest average soil moisture
async function fetchHighestMoistureField() {
    const sql = `SELECT sr.FieldID
                FROM SoilRecords sr
                JOIN MoistureByChemistry mc
                ON sr.SampleDate = mc.SampleDate AND sr.pH = mc.pH
                GROUP BY sr.FieldID
                HAVING AVG(mc.moisture) >= ALL (
                    SELECT AVG(mc2.moisture)
                    FROM SoilRecords sr2
                    JOIN MoistureByChemistry mc2
                    ON sr2.SampleDate = mc2.SampleDate AND sr2.pH = mc2.pH
                    GROUP BY sr2.FieldID
                )
                `
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(sql);

            return {
                success: true,
                message: "Search successful!",
                data: result.rows
            };
        } catch (err) {
            console.error("Database error:", err);
            return { success: false, message: "Query failed due to an unexpected error." };
        }
    }).catch((err) => {
        console.error("Database connection failed", err);
        return { success: false, message: "Query failed due to an unexpected error." };
    });
}

// Gets the fields that uses all the pesticides
async function fetchFieldsAllPesticides() {
    const sql = `SELECT cf.FieldID
                FROM ContainsField cf
                WHERE NOT EXISTS (
                    (SELECT p.pestID
                    FROM Pesticide p)

                    MINUS

                    (SELECT t.PestID
                    FROM GrowsCrop gc
                    JOIN Treats t ON gc.CropID = t.CropID
                    WHERE gc.FieldID = cf.FieldID
                    )
                )
                `
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(sql);

            return {
                success: true,
                message: "Search successful!",
                data: result.rows
            };
        } catch (err) {
            console.error("Database error:", err);
            return { success: false, message: "Query failed due to an unexpected error." };
        }
    }).catch((err) => {
        console.error("Database connection failed", err);
        return { success: false, message: "Query failed due to an unexpected error." };
    });
}

module.exports = {
    testOracleConnection,
    initializeFarmTables,
    populateTables,
    // Fetch functions
    fetchFarmers,
    fetchFarms,
    fetchFields,
    fetchCrops,
    fetchPesticides,
    fetchCertifications,
    fetchGrains,
    fetchVegetables,
    fetchFruits,
    fetchCropYields,
    fetchTreatments,
    fetchIrrigationRecords,
    fetchSoilRecords,
    fetchMoistureData,
    fetchSeasons,
    fetchCropTypes,
    fetchAwardExpiries,
    fetchReceives,
    fetchContactInfo,
    // Insert functions
    insertFarmer,
    insertFarm,
    insertField,
    insertCrop,
    insertPesticide,
    insertCertification,
    insertGrain,
    insertVegetable,
    insertFruit,
    insertCropYield,
    insertTreatment,
    insertIrrigationRecord,
    insertSoilRecord,
    insertMoistureData,
    insertReceives,
    // Update
    updateFarmInfo,
    // Join
    joinFarmCrop,
    // Delete
    deleteFarmsInfo,
    // Nested
    fetchHighestMoistureField,
    // Project
    getFields,
    // Select
    selectFields,
    // Group By
    fetchAverageVolume,
    // Having
    fetchHealthyFields,
    // Division
    fetchFieldsAllPesticides
};