const express = require('express')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');
const TemperatureReading = mongoose.model('TemperatureReading', { temp1: String, temp2: String, temp3: String, timeStamp: Date });


var bodyParser = require('body-parser')

const app = express()
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => res.send('Works!'))

app.post('/', function (req, res) {
    var date = new Date();
    const tempReading = new TemperatureReading({
        temp1: req.body.temp1,
        temp2: req.body.temp2,
        temp3: req.body.temp3,
        timeStamp: date });

    tempReading.save().then(() => console.log('Saved reading: '+ req.body + ', ' + date.toString()));

    res.send();
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
