const objConnectionData = {
    host:'localhost',
    user:'root',
    port:3306,
    password:'yipee',
    database:'dbHippoExchange'
}

const express = require('express')
var app = express()
app.use(express.json())
const {v4:uuidv4} = require('uuid')
const bcrypt = require('bcrypt')
const mysql = require('mysql2')
const HTTP_PORT = 8000
const conHippo = mysql.createConnection(
    objConnectionData
)
conHippo.connect(err => {
    if(err){
        console.error("Initial connection failed", err)
    }
    else{
        console.log('Initial connection good')
    }
})

app.listen(HTTP_PORT, () => {
    console.log('Listening on port ',HTTP_PORT)
})


function hashPassword(strPassword){
    return bcrypt.hashSync(strPassword, 10)
}

function validatePassword(strPassword, strHash){
    return bcrypt.compareSync(strPassword, strHash)
}


// STEP 1
app.post('/createuser', (req, res, next) => {
// creates a new user after validating email and password
    let strEmail = req.body.email
    let strPassword = req.body.password
    let strFirstName = req.body.firstName
    let strLastName = req.body.lastName

    console.log(strEmail)

    // literal syntax
    // ^ = start of string, $ = end of string
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
    // AI was used in the above two variables to learn formatting

    try{
        // check email
        if (!emailRegex.test(strEmail)) {
            res.status(400).json(
                { status: "Failed", message: "Invalid email" }
            )
        }

        // check password
        if (!passwordRegex.test(strPassword)) {
            res.status(400).json(
                { status: "Failed", message: "Weak password" }
            )
        }
        // AI was used in the above two if statements to learn validation formatting

        // encrypt/hash the password
        const hashedPassword = hashPassword(strPassword)

        let strQuery = "INSERT INTO tblUsers (Email, Password, FirstName, LastName, CreatedDateTime, LastUsedDateTime) VALUES (?, ?, ?, ?, NOW(), NOW())"

        conHippo.query(strQuery, [strEmail, hashedPassword, strFirstName, strLastName], (err, results, fields) => {
            if (err) {
                console.error('step 1 error', err)
                res.status(500).json(
                    err
                )
            } 
            else {
                console.log(results)
                res.status(200).json(
                    { status: "Success" }
                )
            }
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }
})

// STEP 2
app.post('/createsession', (req, res, next) => {
// creates a new session for a valid user
    let strEmail = req.body.email
    let strPassword = req.body.password

    console.log(strEmail)

    try{
        if (!strEmail || !strPassword) {
            res.status(400).json(
                { status: "Failed", message: "Email and password required" }
            )
        }

        let strQuery = "SELECT Email, Password FROM tblUsers WHERE Email = ?"
        conHippo.query(strQuery, [strEmail], (err, results, fields) => {
            if (err) {
                console.error("step 2 error", err)
                res.status(500).json(
                    err
                )
            }

            // if user not found
            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "User not found" }
                )
            }

            // password validation from server
            const hashedPassword = results[0].Password
            const match = validatePassword(strPassword, hashedPassword)

            if (!match) {
                res.status(401).json(
                    { status: "Failed", message: "Incorrect password" }
                )
            }

            /// sessionID stuff
            const strSessionID = uuidv4()
            let strInsert = "INSERT INTO tblSessions (SessionID, UserID, CreatedDateTime) VALUES (?, ?, NOW())"
            conHippo.query(strInsert, [strSessionID, strEmail], (err, results, fields) => {
                if (err) {
                    console.error("step 2 uuid error", err)
                    res.status(500).json(
                        err
                    )
                }
                else{
                    console.log("Session made for:", strEmail)
                    res.status(200).json(
                        { status: "Success", SessionID: strSessionID }
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }
})

// STEP 3
app.post('/createbrand', (req, res, next) => {
// creates a new brand (after validating the session)
    let strSessionID = req.body.sessionID
    let strBrandName = req.body.brandName

    try{
        if (!strSessionID || !strBrandName) {
            res.status(400).json(
                { status: "Failed", message: "Needs SessionID and/or BrandName" }
            )
        }

        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 3 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }

            // make new brand
            let strInsert = "INSERT INTO tblBrands (BrandName, CreatedDateTime) VALUES (?, NOW())"
            conHippo.query(strInsert, [strBrandName], (err2, results2, fields2) => {
                if (err2) {
                    console.error("step 3 new brand error", err2)
                    res.status(500).json(
                        { status: "Failed" }
                    )
                }
                else{
                    res.status(200).json(
                        { status: "Success" }
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }
})

// STEP 4
app.post('/createloan', (req, res, next) => {
// creates a new loan for an inventory item (after validating the session)
    let strSessionID = req.body.sessionID
    let strInventoryID = req.body.inventoryID

    try{
        if (!strSessionID || !strInventoryID) {
            res.status(400).json(
                { status: "Failed", message: "Needs SessionID and/or InventoryID" }
            )
        }

        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 4 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }

            // grab borrower from userID
            let strBorrower = results[0].UserID

            let strLoanID = uuidv4()

            // make new loan
            let strInsert = "INSERT INTO tblLoans (LoanID, InventoryID, Borrower, DateOfLoan) VALUES (?, ?, ?, NOW())"
            conHippo.query(strInsert, [strLoanID, strInventoryID, strBorrower], (err, results, fields) => {
                if (err) {
                    console.error("step 4 new loan error", err)
                    res.status(500).json(
                        { status: "Failed" }
                    )
                }
                else{
                    res.status(200).json(
                        { status: "Success", LoanID: strLoanID }
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }
})

// STEP 5
app.get('/userinventory', (req,res,next)=>{
// returns all inventory items owned by the logged-in user (after validating the session)
    let strSessionID = req.query.sessionID

    try{
        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 5 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }

            let strOwner = results[0].UserID

            let strQuery = "SELECT InventoryID, Brand, Model, Description, Active FROM tblInventory WHERE Owner = ?"
            conHippo.query(strQuery, [strOwner], (err, results, fields) =>{
                if(err){
                    console.error('step 5 error', err)
                    res.status(500).json(
                        err
                    )
                }
                else{
                    console.log(results)
                    res.status(200).json(
                        results
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }
})


// STEP 6
app.get('/loanhistory', (req,res,next)=>{
// returns all loan history for the logged-in user (after validating the session)
    let strSessionID = req.query.sessionID

    try{
        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 6 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }

            let strBorrower = results[0].UserID

            let strQuery = "SELECT tblInventory.InventoryID, tblInventory.Brand, tblInventory.Model, tblInventory.Description, tblLoans.LoanID, tblLoans.DateOfLoan, tblLoans.DateOfReturn FROM tblLoans LEFT JOIN tblInventory ON tblLoans.InventoryID = tblInventory.InventoryID WHERE tblLoans.Borrower = ?"
            conHippo.query(strQuery, [strBorrower], (err, results, fields) =>{
                if(err){
                    console.error('step 6 error', err)
                    res.status(500).json(
                        err
                    )
                }
                else{
                    console.log(results)
                    res.status(200).json(
                        results
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }    
})

// STEP 7
app.put('/updateloan', (req,res,next)=>{
// updates loan history (given loan) for borrower (after validating the session)
    let strSessionID = req.body.sessionID
    let strLoanID = req.body.loanID

    try{
        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 7 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }

            let strBorrower = results[0].UserID

            strQuery = "UPDATE tblLoans SET DateOfReturn = NOW() WHERE LoanID = ? and Borrower = ?";
            conHippo.query(strQuery, [strLoanID, strBorrower], (err, results, fields) =>{
                if(err){
                    console.error('step 7 error', err)
                    res.status(500).json(
                        err
                    )
                }

                // check affectedRows to make sure it updated
                if (results.affectedRows === 0) {
                    res.status(200).json(
                        { status: "Failed" }
                    )
                }
                else{
                    res.status(200).json(
                        { status: "Success" }
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }    
})

// STEP 8
app.get('/uniquebrand', (req,res,next)=>{
// returns all unique brand names (after validating the session)
    let strSessionID = req.query.sessionID

    try{
        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 8 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }

            strQuery = "SELECT DISTINCT(BrandName) FROM tblBrands ORDER BY BrandName ASC"
            conHippo.query(strQuery, (err, results, fields) => {
                if(err){
                    console.error('step 8 error', err)
                    res.status(500).json(
                        err
                    )
                }
                else{
                    res.status(200).json(
                        results
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }    
})

// STEP 9
app.get('/inventorydescription', (req,res,next)=>{
// returns all inventory items (brand names) sounding like a given phrase
    let strSessionID = req.query.sessionID
    let strDescription = req.query.description


    try{
        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 9 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }

            strQuery = "SELECT Brand FROM tblInventory WHERE SOUNDEX(Description) = SOUNDEX(?)"
            conHippo.query(strQuery, [strDescription], (err, results, fields) => {
                if(err){
                    console.error('step 9 error', err)
                    res.status(500).json(
                        err
                    )
                }
                else{
                    res.status(200).json(
                        results
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }    
})

// STEP 10
app.delete('/removesession', (req,res,next)=>{
// removes the given session from the database
    let strSessionID = req.body.sessionID


    try{
        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 10 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }

            strQuery = "DELETE FROM tblSessions WHERE SessionID = ?"
            conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
                if(err){
                    console.error('step 10 error', err)
                    res.status(500).json(
                        err
                    )
                }
                else{
                    res.status(200).json(
                        { status: "Success" }
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }    
})

// STEP 11
app.put('/updatepassword', (req,res,next)=>{
// updates given user's password
    let strSessionID = req.body.sessionID
    let strPassword = req.body.password


    try{
        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 11 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }

            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/

            if (!passwordRegex.test(strPassword)) {
                res.status(400).json(
                    { status: "Failed", message: "Weak password" }
                )
            }

            const hashedPassword = hashPassword(strPassword)
            let strUser = results[0].UserID


            strQuery = "UPDATE tblUsers SET Password = ? WHERE Email = ?"
            conHippo.query(strQuery, [hashedPassword, strUser], (err, results, fields) => {
                if(err){
                    console.error('step 11 error', err)
                    res.status(500).json(
                        err
                    )
                }
                else{
                    res.status(200).json(
                        { status: "Success" }
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }    
})

// STEP 12
app.get('/loancounts', (req,res,next)=>{
// returns total number of loans
// returns total number of loans outstanding (not returned)
// returns total number of loans completed (returned)

    try{
        strQuery = "SELECT COUNT(LoanID) AS TotalLoans, SUM(DateOfReturn IS NULL) AS TotalOutstandingLoans, SUM(DateOfReturn is NOT NULL) AS TotalCompletedLoans FROM tblLoans"
        conHippo.query(strQuery, (err, results, fields) => {
            if(err){
                console.error('step 12 error', err)
                res.status(500).json(
                    err
                )
            }
            else{
                res.status(200).json(
                    {TotalLoans:results[0].TotalLoans, TotalOutstandingLoans:results[0].TotalOutstandingLoans, TotalCompletedLoans:results[0].TotalCompletedLoans}
                )
            }
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }    
})


// STEP 13
app.put('/loans/status', (req,res,next)=>{
// updates inventory item status to be false
    let strSessionID = req.body.sessionID
    let strInventoryID = req.body.inventoryID


    try{
        // session validation
        let strQuery = "SELECT UserID FROM tblSessions WHERE SessionID = ?"
        conHippo.query(strQuery, [strSessionID], (err, results, fields) => {
            if (err) {
                console.error("step 13 session check error", err)
                res.status(500).json(
                    err
                )
            }

            if (results.length === 0) {
                res.status(401).json(
                    { status: "Failed", message: "sessionID invalid" }
                )
            }


            strQuery = "UPDATE tblInventory SET Active = 0 WHERE InventoryID = ?"
            conHippo.query(strQuery, [strInventoryID], (err, results, fields) => {
                if(err){
                    console.error('step 13 error', err)
                    res.status(500).json(
                        err
                    )
                }
                else{
                    res.status(200).json(
                        { status: "Success" }
                    )
                }
            })
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }    
})


// STEP 14
app.get('/activeusers', (req,res,next)=>{
// returns total number of users that have logged in within a number of days
    let intDays = req.query.intDays
    // AI found this for me: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
    // because I ran into issue just sending intDays to query below
    let intTrueDays = parseInt(intDays);

    try{
        // AI found this method from: https://www.statology.org/mysql-where-date-in-last-30-days/
        strQuery = "SELECT COUNT(*) AS ActiveUsers FROM tblUsers WHERE LastUsedDateTime >= NOW() - INTERVAL ? DAY"
        conHippo.query(strQuery, [intTrueDays], (err, results, fields) =>{
            if(err){
                console.error('step 14 error', err)
                res.status(500).json(
                    err
                )
            }
            else{
                console.log(results)
                res.status(200).json(
                    // return count from first element in results array
                    {ActiveUsers: results[0].ActiveUsers}
                )
            }
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }
})


// STEP 15
app.get('/totalusers', (req,res,next)=>{
// returns total number of users in the system
    try{
        let strQuery = "SELECT COUNT(*) AS TotalUsers FROM tblUsers"
        conHippo.query(strQuery, (err, results, fields) =>{
            if(err){
                console.error('step 15 error', err)
                res.status(500).json(
                    err
                )
            }
            else{
                console.log(results)
                res.status(200).json(
                    // return count from first element in results array
                    {TotalUsers:results[0].TotalUsers}
                )
            }
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }
})

// STEP 16
app.get('/hippo', (req, res) => {
// route that returns the Hippo mascot
    try{
        // AI used to figure out how to grab a value in SQL not already in a database table
        let strQuery = "SELECT 'Hippo' AS Mascot"
        conHippo.query(strQuery, (err, results, fields) => {
            if(err){
                console.error('step 16 error', err)
                res.status(500).json(
                    err
                )
            } 
            else{
                console.log(results)
                res.status(200).json(
                    { Mascot:results[0].Mascot }
                )
            }
        })
    }
    catch(unexpected){
        res.status(401).json({
            error:unexpected
        })
    }
})
