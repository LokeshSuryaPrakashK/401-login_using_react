const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

//Adding new data to collection
db.collection('hi').add({
    name:"prakash"
})

// for getting the data from collection
db.collection("hi").get().then(function(docs){
      docs.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
      });
})