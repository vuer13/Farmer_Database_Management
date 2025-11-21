const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

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
                        FOREIGN KEY (FieldID) REFERENCES ContainsField(FieldID),
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
                        FOREIGN KEY (FieldID) REFERENCES ContainsField(FieldID),
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
                        FOREIGN KEY (FarmID) REFERENCES OwnsFarm(FarmID),
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
            return true;
        } catch (err) {
            console.error('Error inserting farmer:', err);
            await connection.rollback();
            return false;
        }
    }).catch(() => {
        return false;
    });
}

async function insertFarm(farmID, name, location, farmerID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO OwnsFarm VALUES (:farmID, :name, :location, :farmerID)`,
            [farmID, name, location, farmerID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function insertField(fieldID, farmID, area) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ContainsField VALUES (:fieldID, :farmID, :area)`,
            [fieldID, farmID, area],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function insertCrop(cropID, fieldID, cropName, plantDate, harvestDate, season) {
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
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO IrrigationRecords VALUES (:irrigID, :fieldID, TO_DATE(:eventDate, 'YYYY-MM-DD'), :volume)`,
            [irrigID, fieldID, eventDate, volume],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertSoilRecord(soilCondID, fieldID, sampleDate, pH) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO SoilRecords VALUES (:soilCondID, :fieldID, TO_DATE(:sampleDate, 'YYYY-MM-DD'), :pH)`,
            [soilCondID, fieldID, sampleDate, pH],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

async function insertMoistureData(sampleDate, pH, moisture) {
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
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Receives VALUES (:farmID, :certID)`,
            [farmID, certID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => { return false; });
}

module.exports = {
    testOracleConnection,
    initializeFarmTables,
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
    insertReceives
};