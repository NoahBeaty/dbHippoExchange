# Final Project Overview – Database & RESTful Service

This project involves building a complete database and Node.js REST API based on requirements delivered orally in class. You will create a MySQL/MariaDB database from a provided ER diagram and implement a full set of CRUD routes aligned with RESTful design.

---

## Database Requirements

- Write SQL to create the **dbHippoExchange** database and all tables exactly matching the ER diagram (names, fields, and characteristics).
- **Do not** add foreign key constraints or deletion cascades.
- Include SQL comments marking the start/end of the database creation block and each table creation block.
- Submit these commands in **HippoExchangeDatabase.txt**.

---

## Node.js REST API Requirements

After building the database, create a Node.js REST service supporting the following routes:

- **Create User:** Accepts `email`, `password`, `firstName`, `lastName`; inserts server date/time; requires RegEx validation; returns `{status:Success}` or `{status:Failed}`.
- **Create Session:** Accepts `email`, `password`; inserts server date/time; returns `SessionID`.
- **Create Brand:** Requires `brandName`, `sessionID`; returns status JSON.
- **Create Loan:** Requires `sessionID`, `inventoryID`; returns `LoanID`.
- **Get User Inventory:** Requires `sessionID`; returns `InventoryID`, `BrandName`, `Model`, `Description`, `Active`.
- **Get Loan History:** Requires `sessionID`; returns inventory + loan fields.
- **Update Loan History:** Requires `sessionID`, `loanID`; only borrower can update; returns status JSON.
- **Get Unique Brands:** Requires `sessionID`; returns array of brand names.
- **Search Inventory by Description:** Requires `sessionID`, `description`; returns matching brand names.
- **Remove Session:** Requires `sessionID`; returns status JSON.
- **Update User Password:** Requires `sessionID`, `password`; includes RegEx validation; returns status JSON.
- **Get Loan Stats:** Returns `{TotalLoans, TotalOutstandingLoans, TotalCompletedLoans}`.
- **Set Inventory Inactive:** Requires `sessionID`, `inventoryID`; route name: `/loans/status`.
- **Get Active User Count:** Requires `intDays`; returns `{ActiveUsers}`.
- **Get Total Users:** Returns `{TotalUsers}`.
- **Mascot Route (Challenge):** Must execute SQL and return `{Mascot: "Hippo"}`.

---

## Additional Requirements

- Use **express**, **mysql2**, **uuid**, **bcrypt** (other libraries require instructor approval).
- Use parameters and query strings correctly; query strings only for GET.
- Follow naming conventions, spelling, and capitalization exactly as given.
- Include route-level comments explaining functionality.
- Rename your Node.js entry file (e.g., `server.js`) to **server.txt**.

---

## Submission

Submit the following three files:

1. `AIUsage.txt`
2. `HippoExchangeDatabase.txt`
3. `server.txt`

All must be included and named exactly as required to avoid grade penalties.
