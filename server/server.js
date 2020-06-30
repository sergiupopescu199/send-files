// Modules needed
// Express is an framework which provide a very easy and fast way to create http servers
const express = require('express');
// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files
const multer = require('multer');
// CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
// usefull if you contact a public domain using http, without CORS you must use https
const cors = require('cors');
// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
const bodyParser = require('body-parser');
// HTTP request logger middleware for node.js
const morgan = require('morgan');

var path = require('path')
const fs = require('fs');

// Directory when all files will be stored
directory = './uploads'

// Create and 'uploads' folder for the first time, if it exists it will not create it
if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
}

// Create express app
const app = express();

// Multer configuration
let storage = multer.diskStorage({
    // Chosing a destination where multer will store all the files 
    destination: function (req, file, cb) {
        cb(null, directory)
    },
    filename: function (req, file, cb) {
        // Original file's name on the host will be conserved, if not set 
        // it will be renamed in a random name without extension
        cb(null, file.originalname)
    }
})

let upload = multer({
    storage: storage
});

// Enable CORS
app.use(cors());

// Configuring body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Logging 
app.use(morgan('dev'));

// Upload multiple files
app.post('/upload', upload.any(), async (req, res) => {
    try {
        const files = req.files;
        // Check if files are available
        if (!files) {
            res.status(400).send({
                status: false,
                data: 'No photo is selected.'
            });
        } else {
            let data = [];
            // Iterate over all files and assign to the single file the original name 
            //from the client, mimetype and the size
            files.forEach(f => data.push({
                name: f.originalname,
                mimetype: f.mimetype,
                size: f.size
            }));
            // Send response, on successfull upload the client will see this response
            res.send({
                status: true,
                message: 'Files are uploaded.',
                data: data
            });
            console.log('-------------');
            console.log(data);
        }
    // If any error will happen the client will recieve it
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete all the files from the folder
app.post('/remove', async (req, res) => {
    try {
        // Enter in the directory
        fs.readdir(directory, (err, files) => {
            if (err) throw err;
            //Iterate and delete all the files in the directory
            files.forEach(f => fs.unlinkSync(path.join(directory, f)));
        });
        // Send to the client the response
        res.send({
            status: true,
            message: 'All files removed.'
        });
        console.log('-------------------');
        console.log("All files removed");
    // If any error will happen the client will recieve it
    } catch (err) {
        res.status(500).send(err);
    }
});

// Custom port
const port = process.env.PORT || 3000;
// Start the app on custom port
app.listen(port, () =>
    console.log(`App is listening on port ${port}.`)
);