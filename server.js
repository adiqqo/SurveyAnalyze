let express = require('express');
let path = require('path');
let fs = require('fs');
let app = express();
const port = 3000;

let nameOfFiles = []

fs.readdir(path.join(__dirname, 'scans'), function (err,files) {
    if(err){
        return console.log("files scan error");
    }
    files.forEach(function (file) {
        nameOfFiles.push({name: file});
    });
});

app.use('/js', express.static(path.join(__dirname, 'js')))
//app.use('/scans', express.static(path.join(__dirname, 'scans')))

app.get('/api/getNameOfImages' , function(req, res){
    res.contentType('application/json');
    res.send(JSON.stringify(nameOfFiles));
});

app.get('', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, function() {
    console.log('Listening on port '+port);
});