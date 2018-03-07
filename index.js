const express = require('express')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/home');
const TemperatureReading = mongoose.model('TemperatureReading', { temp1: Number, temp2: Number, temp3: Number, timeStamp: Date });


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

    tempReading.save().then(() => {
        console.log('Saved reading: ');
        console.log(tempReading.temp1 + ' ' + tempReading.temp2 + ' ' + tempReading.temp3);
        console.log(tempReading.date.toString());
    });

    res.send();
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
