-- Do NOT add foreign key constraints or deletion cascades to your SQL.  
-- The SQL creation commands should match what we use in class.
-- Please include a comment, properly formatted for SQL, 
-- that indicates the start and end of each code block for the database creation command and for each table creation.

-- START of database creation
CREATE DATABASE dbHippoExchange;
-- END of database creation

-- START of tblUsers
CREATE TABLE tblUsers (
    Email VARCHAR(250),
    FirstName VARCHAR(25) NOT NULL,
    LastName VARCHAR(25) NOT NULL,
    Password VARCHAR(500) NOT NULL,
    -- YYYY-MM-DD HH:MM:SS (military time = 0 - 24, 12am is 00:00:00 and 12pm is 12:00:00)
    CreatedDateTime DATETIME NOT NULL,
    LastUsedDateTime DATETIME NOT NULL,
    PRIMARY KEY (Email)
);
-- END of tblUsers

-- START of tblSessions
CREATE TABLE tblSessions (
    SessionID VARCHAR(50),
    UserID VARCHAR(250) NOT NULL,
    CreatedDateTime DATETIME NOT NULL,
    PRIMARY KEY (SessionID)
);
-- END of tblSessions

-- START of tblInventory
CREATE TABLE tblInventory (
    InventoryID VARCHAR(50),
    Brand VARCHAR(250) NOT NULL,
    Model VARCHAR(250) NOT NULL,
    Description VARCHAR(2000) NOT NULL,
    Owner VARCHAR(250) NOT NULL,
    Active BOOLEAN NOT NULL,
    PRIMARY KEY (InventoryID)
);
-- END of tblInventory

-- START of tblBrands
CREATE TABLE tblBrands (
    BrandName VARCHAR(250),
    CreatedDateTime DATETIME NOT NULL,
    PRIMARY KEY (BrandName)
);
-- END of tblBrands

-- START of tblLoans
CREATE TABLE tblLoans (
    LoanID VARCHAR(50),
    InventoryID VARCHAR(50) NOT NULL,
    Borrower VARCHAR(250) NOT NULL,
    DateOfLoan DATETIME NOT NULL,
    -- item could still be out on loan
    DateOfReturn DATETIME,
    PRIMARY KEY (LoanID)
);
-- END of tblLoans
