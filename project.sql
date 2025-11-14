-- Dropping tables
DROP TABLE ContactInfoName CASCADE CONSTRAINT;
DROP TABLE Farmer CASCADE CONSTRAINT;
DROP TABLE OwnsFarm CASCADE CONSTRAINT;
DROP TABLE ContainsField CASCADE CONSTRAINT;
DROP TABLE SeasonByPlantDate CASCADE CONSTRAINT;
DROP TABLE CropType CASCADE CONSTRAINT;
DROP TABLE GrowsCrop CASCADE CONSTRAINT;
DROP TABLE Grain CASCADE CONSTRAINT;
DROP TABLE Vegetable CASCADE CONSTRAINT;
DROP TABLE Fruit CASCADE CONSTRAINT;
DROP TABLE CropYieldProduces CASCADE CONSTRAINT;
DROP TABLE Pesticide CASCADE CONSTRAINT;
DROP TABLE Treats CASCADE CONSTRAINT;
DROP TABLE IrrigationRecords CASCADE CONSTRAINT;
DROP TABLE MoistureByChemistry CASCADE CONSTRAINT;
DROP TABLE SoilRecords CASCADE CONSTRAINT;
DROP TABLE AwardExpiry CASCADE CONSTRAINT;
DROP TABLE Certification CASCADE CONSTRAINT;
DROP TABLE Receives CASCADE CONSTRAINT;

-- Creating Tables - RAW (NOT EDITED)

-- farmer table
--   1) ContactInfoName(ContactInfo, Name)
--   2) Farmer(FarmerID, ContactInfo)

-- contact info name table
CREATE TABLE ContactInfoName (
  ContactInfo  VARCHAR(80) PRIMARY KEY,
  Name         VARCHAR(20)  NOT NULL
);

grant select on ContactInfoName to public;

-- farmer table
CREATE TABLE Farmer (
  FarmerID     INT PRIMARY KEY,
  ContactInfo  VARCHAR(80) NOT NULL,
  CONSTRAINT fk_farmer_contact
    FOREIGN KEY (ContactInfo) REFERENCES ContactInfoName(ContactInfo),
  CONSTRAINT uq_farmer_contact UNIQUE (ContactInfo)
);

grant select on Farmer to public;

-- owns farm table
CREATE TABLE OwnsFarm (
  FarmID    INT PRIMARY KEY,
  Name      VARCHAR(20) NOT NULL,
  Location  VARCHAR(20) NOT NULL,
  FarmerID  INT NOT NULL,
  CONSTRAINT fk_farm_farmer
    FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID)
);

grant select on OwnsFarm to public;

-- contains field table
CREATE TABLE ContainsField (
  FieldID  INT PRIMARY KEY,
  FarmID   INT NOT NULL,
  Area     INT,
  CONSTRAINT fk_field_farm
    FOREIGN KEY (FarmID) REFERENCES OwnsFarm(FarmID)
);

grant select on ContainsField to public;

-- grows crop table
--   1) SeasonByPlantDate(PlantingDate → Season)
--   2) CropType(Name → PlantingDate, HarvestDate, Season)
--   3) GrowsCrop(CropID, FieldID, Name)


-- season by plant date table
CREATE TABLE SeasonByPlantDate (
  PlantingDate DATE PRIMARY KEY,
  Season       VARCHAR(20) NOT NULL
);

grant select on SeasonByPlantDate to public;

-- crop type table
CREATE TABLE CropType (
  Name          VARCHAR(60) PRIMARY KEY,
  PlantingDate  DATE NOT NULL,
  HarvestDate   DATE NOT NULL,
  CONSTRAINT fk_croptype_plantdate
    FOREIGN KEY (PlantingDate) REFERENCES SeasonByPlantDate(PlantingDate)
);

grant select on CropType to public;

-- grows crop table
CREATE TABLE GrowsCrop (
  CropID   INT PRIMARY KEY,
  FieldID  INT NOT NULL,
  Name     VARCHAR(60) NOT NULL,
  CONSTRAINT fk_crop_field
    FOREIGN KEY (FieldID) REFERENCES ContainsField(FieldID),
  CONSTRAINT fk_crop_name
    FOREIGN KEY (Name) REFERENCES CropType(Name)
);

grant select on GrowsCrop to public;

-- grain table (ISA subtype of crop)
CREATE TABLE Grain (
  CropID         INT PRIMARY KEY,
  GlutenContent  DECIMAL(10,2),
  CONSTRAINT fk_grain_crop
    FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
      ON DELETE CASCADE
);

grant select on Grain to public;

-- vegetable table (ISA subtype of crop)
CREATE TABLE Vegetable (
  CropID   INT PRIMARY KEY,
  IsLeafy  NUMBER(1) NOT NULL,
  CONSTRAINT ck_veg_bool CHECK (IsLeafy IN (0,1)),
  CONSTRAINT fk_veg_crop
    FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
      ON DELETE CASCADE
);

grant select on Vegetable to public;

-- fruit table (ISA subtype of crop)
CREATE TABLE Fruit (
  CropID       INT PRIMARY KEY,
  SugarContent DECIMAL(10,2),
  CONSTRAINT fk_fruit_crop
    FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
      ON DELETE CASCADE
);

grant select on Fruit to public;

-- crop yield produces table (weak entity)
CREATE TABLE CropYieldProduces (
  CropID        INT,
  Total_Yield   DECIMAL(10,2),
  Health_Rating INT NOT NULL,
  PRIMARY KEY (CropID, Total_Yield),
  CONSTRAINT fk_yield_crop
    FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
      ON DELETE CASCADE
);

grant select on CropYieldProduces to public;

-- pesticide table
CREATE TABLE Pesticide (
  PestID  INT PRIMARY KEY,
  Name    VARCHAR(60)
);

grant select on Pesticide to public;

-- treats table
CREATE TABLE Treats (
  CropID  INT,
  PestID  INT,
  PRIMARY KEY (CropID, PestID),
  CONSTRAINT fk_treats_crop
    FOREIGN KEY (CropID) REFERENCES GrowsCrop(CropID)
      ON DELETE CASCADE,
  CONSTRAINT fk_treats_pest
    FOREIGN KEY (PestID) REFERENCES Pesticide(PestID)
      ON DELETE CASCADE
);

grant select on Treats to public;

-- irrigation records table
CREATE TABLE IrrigationRecords (
  IrrigID    INT PRIMARY KEY,
  FieldID    INT NOT NULL,
  EventDate  DATE,
  Volume     DECIMAL(10,2),
  CONSTRAINT fk_irrig_field
    FOREIGN KEY (FieldID) REFERENCES ContainsField(FieldID)
);

grant select on IrrigationRecords to public;

-- soil records table
--   1) MoistureByChemistry(SampleDate, pH → Moisture)
--   2) SoilRecords(SoilCondID, FieldID, SampleDate, pH)


-- moisture by chemistry table
CREATE TABLE MoistureByChemistry (
  SampleDate DATE,
  pH         DECIMAL(4,2),
  Moisture   DECIMAL(6,2) NOT NULL,
  PRIMARY KEY (SampleDate, pH)
);

grant select on MoistureByChemistry to public;

-- soil records table
CREATE TABLE SoilRecords (
  SoilCondID  INT PRIMARY KEY,
  FieldID     INT NOT NULL,
  SampleDate  DATE NOT NULL,
  pH          DECIMAL(4,2) NOT NULL,
  CONSTRAINT fk_soil_field
    FOREIGN KEY (FieldID) REFERENCES ContainsField(FieldID),
  CONSTRAINT fk_soil_rule
    FOREIGN KEY (SampleDate, pH) REFERENCES MoistureByChemistry(SampleDate, pH)
);

grant select on SoilRecords to public;

-- certification table
--   1) AwardExpiry(AwardedDate → ExpiryDate)
--   2) Certification(CertID, Name, AwardedDate)


-- award expiry table
CREATE TABLE AwardExpiry (
  AwardedDate DATE PRIMARY KEY,
  ExpiryDate  DATE NOT NULL
);

grant select on AwardExpiry to public;

-- certification table
CREATE TABLE Certification (
  CertID      INT PRIMARY KEY,
  Name        VARCHAR(80) NOT NULL,
  AwardedDate DATE NOT NULL,
  CONSTRAINT fk_cert_award
    FOREIGN KEY (AwardedDate) REFERENCES AwardExpiry(AwardedDate)
);

grant select on Certification to public;

-- receives table
CREATE TABLE Receives (
  FarmID  INT,
  CertID  INT,
  PRIMARY KEY (FarmID, CertID),
  CONSTRAINT fk_recv_farm
    FOREIGN KEY (FarmID) REFERENCES OwnsFarm(FarmID),
  CONSTRAINT fk_recv_cert
    FOREIGN KEY (CertID) REFERENCES Certification(CertID)
);

grant select on Receives to public;

-- Inserts - RAW (NOT EDITED)

-- ContactInfoName
INSERT INTO ContactInfoName (ContactInfo, Name) VALUES ('john.doe@example.com',  'John Doe');
INSERT INTO ContactInfoName (ContactInfo, Name) VALUES ('jack.smith@example.com','Jack Smith');
INSERT INTO ContactInfoName (ContactInfo, Name) VALUES ('brian.smith@example.com','Brian Smith');
INSERT INTO ContactInfoName (ContactInfo, Name) VALUES ('cora.doe@example.com',  'Cora Doe');
INSERT INTO ContactInfoName (ContactInfo, Name) VALUES ('eve.miller@example.com','Eve Miller');

-- Farmer
INSERT INTO Farmer (FarmerID, ContactInfo) VALUES (1, 'john.doe@example.com');
INSERT INTO Farmer (FarmerID, ContactInfo) VALUES (2, 'jack.smith@example.com');
INSERT INTO Farmer (FarmerID, ContactInfo) VALUES (3, 'brian.smith@example.com');
INSERT INTO Farmer (FarmerID, ContactInfo) VALUES (4, 'cora.doe@example.com');
INSERT INTO Farmer (FarmerID, ContactInfo) VALUES (5, 'eve.miller@example.com');

-- OwnsFarm
INSERT INTO OwnsFarm (FarmID, Name, Location, FarmerID) VALUES (101, 'Sunny Fields','British Columbia', 1);
INSERT INTO OwnsFarm (FarmID, Name, Location, FarmerID) VALUES (102, 'Green Valley','Alberta', 2);
INSERT INTO OwnsFarm (FarmID, Name, Location, FarmerID) VALUES (103, 'River Farm','Ontario', 3);  
INSERT INTO OwnsFarm (FarmID, Name, Location, FarmerID) VALUES (104, 'Highland Acres','British Columbia', 4);
INSERT INTO OwnsFarm (FarmID, Name, Location, FarmerID) VALUES (105, 'Golden Harvest','Manitoba', 5);

-- ContainsField
INSERT INTO ContainsField (FieldID, FarmID, Area) VALUES (1001, 101, 25);
INSERT INTO ContainsField (FieldID, FarmID, Area) VALUES (1002, 102, 40);
INSERT INTO ContainsField (FieldID, FarmID, Area) VALUES (1003, 103, 30);
INSERT INTO ContainsField (FieldID, FarmID, Area) VALUES (1004, 104, 35);
INSERT INTO ContainsField (FieldID, FarmID, Area) VALUES (1005, 105, 25);

-- SeasonByPlantDate
INSERT INTO SeasonByPlantDate (PlantingDate, Season) VALUES (DATE '2025-03-10', 'Spring');
INSERT INTO SeasonByPlantDate (PlantingDate, Season) VALUES (DATE '2025-04-15', 'Spring');
INSERT INTO SeasonByPlantDate (PlantingDate, Season) VALUES (DATE '2025-05-20', 'Summer');
INSERT INTO SeasonByPlantDate (PlantingDate, Season) VALUES (DATE '2025-07-01', 'Summer');
INSERT INTO SeasonByPlantDate (PlantingDate, Season) VALUES (DATE '2025-09-10', 'Fall');

-- CropType
INSERT INTO CropType (Name, PlantingDate, HarvestDate) VALUES ('Wheat',   DATE '2025-03-10', DATE '2025-07-20');
INSERT INTO CropType (Name, PlantingDate, HarvestDate) VALUES ('Corn',    DATE '2025-04-15', DATE '2025-09-05');
INSERT INTO CropType (Name, PlantingDate, HarvestDate) VALUES ('Tomato',  DATE '2025-05-20', DATE '2025-08-25');
INSERT INTO CropType (Name, PlantingDate, HarvestDate) VALUES ('Lettuce', DATE '2025-07-01', DATE '2025-08-01');
INSERT INTO CropType (Name, PlantingDate, HarvestDate) VALUES ('Apple',   DATE '2025-09-10', DATE '2026-03-01');

-- GrowsCrop
INSERT INTO GrowsCrop (CropID, FieldID, Name) VALUES (201, 1001, 'Wheat');
INSERT INTO GrowsCrop (CropID, FieldID, Name) VALUES (202, 1002, 'Corn');
INSERT INTO GrowsCrop (CropID, FieldID, Name) VALUES (203, 1003, 'Tomato');
INSERT INTO GrowsCrop (CropID, FieldID, Name) VALUES (204, 1004, 'Lettuce');
INSERT INTO GrowsCrop (CropID, FieldID, Name) VALUES (205, 1005, 'Apple');

-- IsA tables
-- Grain crops
INSERT INTO Grain (CropID, GlutenContent) VALUES (201, 12.5); 
INSERT INTO Grain (CropID, GlutenContent) VALUES (202, 0.00); 

-- Vegetable crops
INSERT INTO Vegetable (CropID, IsLeafy) VALUES (203, 0);  
INSERT INTO Vegetable (CropID, IsLeafy) VALUES (204, 1); 

-- Fruit crops
INSERT INTO Fruit (CropID, SugarContent) VALUES (205, 14.2);

-- CropYieldProduces
INSERT INTO CropYieldProduces (CropID, Total_Yield, Health_Rating) VALUES (201, 5000.00, 9);
INSERT INTO CropYieldProduces (CropID, Total_Yield, Health_Rating) VALUES (202, 6500.50, 8);
INSERT INTO CropYieldProduces (CropID, Total_Yield, Health_Rating) VALUES (203, 2200.75, 7);
INSERT INTO CropYieldProduces (CropID, Total_Yield, Health_Rating) VALUES (204, 1800.00, 9);
INSERT INTO CropYieldProduces (CropID, Total_Yield, Health_Rating) VALUES (205, 8000.25, 10);

INSERT INTO Pesticide(PestID, Name) VALUES (1, 'Mr Clean');
INSERT INTO Pesticide(PestID, Name) VALUES (2, 'Pest Killer');
INSERT INTO Pesticide(PestID, Name) VALUES (3, 'P-Cleaner Deluxe');
INSERT INTO Pesticide(PestID, Name) VALUES (4, 'Bye Bye Pests');
INSERT INTO Pesticide(PestID, Name) VALUES (5, 'Get Outta Here Pests');
INSERT INTO Pesticide(PestID, Name) VALUES (6, 'Pest Eliminator 3000');


INSERT INTO Treats(CropID, PestID) VALUES (201, 1);
INSERT INTO Treats(CropID, PestID) VALUES (201, 2);
INSERT INTO Treats(CropID, PestID) VALUES (202, 1);
INSERT INTO Treats(CropID, PestID) VALUES (202, 3);
INSERT INTO Treats(CropID, PestID) VALUES (203, 2);
INSERT INTO Treats(CropID, PestID) VALUES (205, 3);


-- IrrigationRecords
INSERT INTO IrrigationRecords (IrrigID, FieldID, EventDate, Volume) VALUES (1, 1001, DATE '2023-03-01', 1500.00);
INSERT INTO IrrigationRecords (IrrigID, FieldID, EventDate, Volume) VALUES (2, 1001, DATE '2023-04-15', 2000.00);
INSERT INTO IrrigationRecords (IrrigID, FieldID, EventDate, Volume) VALUES (3, 1002, DATE '2023-05-10', 1800.00);
INSERT INTO IrrigationRecords (IrrigID, FieldID, EventDate, Volume) VALUES (4, 1002, DATE '2023-06-20', 2200.00);
INSERT INTO IrrigationRecords (IrrigID, FieldID, EventDate, Volume) VALUES (5, 1003, DATE '2023-07-05', 1600.00);
INSERT INTO IrrigationRecords (IrrigID, FieldID, EventDate, Volume) VALUES (6, 1003, DATE '2023-08-18', 2100.00);

-- MoistureByChemistry
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-03-15', 6.5, 22.5);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-04-20', 7.0, 18.0);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-05-10', 5.8, 25.0);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-06-25', 6.2, 20.0);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-07-30', 7.5, 15.0);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-08-15', 6.9, 19.5);


-- SoilRecords
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (1, 1001, DATE '2023-03-15', 6.5);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (2, 1001, DATE '2023-04-20', 7.0);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (3, 1002, DATE '2023-05-10', 5.8);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (4, 1002, DATE '2023-06-25', 6.2);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (5, 1003, DATE '2023-07-30', 7.5);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (6, 1003, DATE '2023-08-15', 6.9);


-- AwardExpiry
INSERT INTO AwardExpiry (AwardedDate, ExpiryDate) VALUES (DATE '2021-10-16', DATE '2023-10-16');
INSERT INTO AwardExpiry (AwardedDate, ExpiryDate) VALUES (DATE '2022-01-15', DATE '2024-01-15');
INSERT INTO AwardExpiry (AwardedDate, ExpiryDate) VALUES (DATE '2023-02-15', DATE '2025-02-15');
INSERT INTO AwardExpiry (AwardedDate, ExpiryDate) VALUES (DATE '2024-05-11', DATE '2026-05-11');
INSERT INTO AwardExpiry (AwardedDate, ExpiryDate) VALUES (DATE '2024-12-30', DATE '2026-12-30');


-- Certification
INSERT INTO Certification (CertID, Name, AwardedDate) VALUES (1, 'Organic', DATE '2022-01-15');
INSERT INTO Certification (CertID, Name, AwardedDate) VALUES (2, 'Winner', DATE '2023-02-15');
INSERT INTO Certification (CertID, Name, AwardedDate) VALUES (3, 'BestFarm', DATE '2024-12-30');
INSERT INTO Certification (CertID, Name, AwardedDate) VALUES (4, 'PrettiestFarm', DATE '2024-05-11');
INSERT INTO Certification (CertID, Name, AwardedDate) VALUES (5, 'BestEnvironment', DATE '2021-10-16');


-- Receives
INSERT INTO Receives (FarmID, CertID) VALUES (101, 1);
INSERT INTO Receives (FarmID, CertID) VALUES (101, 2);
INSERT INTO Receives (FarmID, CertID) VALUES (102, 1);
INSERT INTO Receives (FarmID, CertID) VALUES (103, 3);
INSERT INTO Receives (FarmID, CertID) VALUES (104, 2);
INSERT INTO Receives (FarmID, CertID) VALUES (105, 1);