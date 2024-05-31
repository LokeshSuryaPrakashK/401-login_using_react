const express = require('express')
const app = express()

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");
const { database } = require('firebase-admin');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.use(express.urlencoded({ extended: true }));

// Home Page
app.get('/', function (req, res) {
    res.sendFile(__dirname+"/login.html")
})

// login details checking
app.get('/loginsubmit', async function (req, res) {
    var mail_id=req.query.email
    var pass=req.query.pass  
    
    try{
        //for getting the data from collection
        const s=await db.collection("login_form").get();
        s.forEach((doc) => {
            if((mail_id==doc.data().email) && (pass==doc.data().password))
                res.sendFile(__dirname+"/sucessful.html")
            else
                res.sendFile(__dirname+"/unsucessful.html")
        });
        
    }
    catch(error)
    {
        console.error("unable to acquire data from the database")
    }
})

// adding new users to database
app.get('/signupsubmit', async function (req, res) {
    const mail_id = req.query.email;
    const pass = req.query.pass;

    try {
        // Check if the user already exists
        const existingUserQuery = await db.collection("login_form").where("email", "==", mail_id).get();
        
        if (!existingUserQuery.empty) {
            // If user exists, check if the password matches
            let userExists = false;
            existingUserQuery.forEach(doc => {
                if (doc.data().password === pass) {
                    userExists = true;
                }
            });

            if (userExists) {
                return res.sendFile(__dirname + "/sucessful.html");
            } else {
                return res.sendFile(__dirname + "/unsucessful.html");
            }
        } else {
            // If user does not exist, add new user
            await db.collection("login_form").add({
                email: mail_id,
                password: pass
            });

            // Verify the newly added user
            const newUserQuery = await db.collection("login_form").where("email", "==", mail_id).get();
            let loginSuccessful = false;
            newUserQuery.forEach(doc => {
                if (doc.data().password === pass) {
                    loginSuccessful = true;
                }
            });

            if (loginSuccessful) {
                return res.sendFile(__dirname + "/sucessful.html");
            } else {
                return res.sendFile(__dirname + "/unsucessful.html");
            }
        }
    } catch (error) {
        console.error("Unable to store data into the database:", error);
        return res.status(500).send("Internal Server Error");
    }
});

app.listen(3000, function(){
    console.log("Server is running on http://localhost:3000/")
})

