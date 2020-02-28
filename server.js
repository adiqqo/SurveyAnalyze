let express = require('express');
let path = require('path');
let fs = require('fs');
let app = express();
const port = 3000;

app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/scans', express.static(path.join(__dirname, 'scans')))
app.use('/checkTemplate', express.static(path.join(__dirname, 'checkTemplate')))
app.use('/templates', express.static(path.join(__dirname, 'templates')))

function compare(a, b) {
    const nameA = parseInt(a.name);
    const nameB = parseInt(b.name);
  
    let comparison = 0;
    if (nameA > nameB) {
      comparison = 1;
    } else if (nameA < nameB) {
      comparison = -1;
    }
    return comparison;
  }

function readDir(pathToFolder, res){
    let nameOfFiles = []
    fs.readdir(path.join(__dirname, pathToFolder), function (err, files) {
        if (err) {
            return console.log("files scan error");
        }
        files.forEach(function (file) {
            nameOfFiles.push({ name: file });
        });
        nameOfFiles.sort(compare);
        res.contentType('application/json');
        res.send(JSON.stringify(nameOfFiles));
    });
}

app.get('/api/getNameOfImages', function (req, res) {
   readDir('scans',res);
});

app.get('/api/getNameOfTemplates', function (req, res) {
    readDir('templates', res);
});

app.get('', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, function () {
    console.log('Listening on port ' + port);
});