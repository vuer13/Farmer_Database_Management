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
INSERT INTO ContainsField (FieldID, FarmID, Area) VALUES (1006, 103, 65);

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


-- Treat Crops With Pesticide
INSERT INTO Treats(CropID, PestID) VALUES (201, 1);
INSERT INTO Treats(CropID, PestID) VALUES (201, 2);
INSERT INTO Treats(CropID, PestID) VALUES (201, 3);
INSERT INTO Treats(CropID, PestID) VALUES (201, 4);
INSERT INTO Treats(CropID, PestID) VALUES (201, 5);
INSERT INTO Treats(CropID, PestID) VALUES (201, 6);

INSERT INTO Treats(CropID, PestID) VALUES (202, 1);
INSERT INTO Treats(CropID, PestID) VALUES (202, 3);
INSERT INTO Treats(CropID, PestID) VALUES (203, 2);

INSERT INTO Treats(CropID, PestID) VALUES (205, 1);
INSERT INTO Treats(CropID, PestID) VALUES (205, 2);
INSERT INTO Treats(CropID, PestID) VALUES (205, 3);
INSERT INTO Treats(CropID, PestID) VALUES (205, 4);
INSERT INTO Treats(CropID, PestID) VALUES (205, 5);
INSERT INTO Treats(CropID, PestID) VALUES (205, 6);


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
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-09-01', 4.0, 28.0);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-09-15', 4.5, 24.0);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-10-05', 5.2, 30.0);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2023-10-20', 6.8, 27.5);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2024-09-15', 5.5, 24.0);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2024-10-05', 5.7, 30.0);
INSERT INTO MoistureByChemistry (SampleDate, pH, Moisture) VALUES (DATE '2024-10-20', 4.2, 27.5);


-- SoilRecords
-- Field 1001
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (1, 1001, DATE '2023-03-15', 6.5);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (2, 1001, DATE '2023-04-20', 7.0);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (3, 1001, DATE '2023-10-05', 5.2);

-- Field 1002
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (4, 1002, DATE '2023-05-10', 5.8);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (5, 1002, DATE '2023-06-25', 6.2);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (6, 1002, DATE '2023-10-20', 6.8);

-- Field 1003
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (7, 1003, DATE '2023-07-30', 7.5);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (8, 1003, DATE '2023-08-15', 6.9);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (9, 1003, DATE '2023-09-01', 4.0);

-- Field 1004
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (10, 1004, DATE '2023-09-15', 4.5);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (11, 1004, DATE '2023-10-05', 5.2);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (12, 1004, DATE '2023-10-20', 6.8);

-- Field 1005
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (13, 1005, DATE '2023-09-01', 4.0);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (14, 1005, DATE '2023-09-15', 4.5);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (15, 1005, DATE '2023-10-05', 5.2);

-- Field 1006
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (16, 1006, DATE '2024-09-15', 5.5);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (17, 1006, DATE '2024-10-05', 5.7);
INSERT INTO SoilRecords (SoilCondID, FieldID, SampleDate, pH) VALUES (18, 1006, DATE '2024-10-20', 4.2);

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