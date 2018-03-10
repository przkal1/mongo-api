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

app.get('/', function (req, res) {
    TemperatureReading.findOne({ }, 'temp1 temp2 temp3 timeStamp', { sort: { 'timeStamp' : -1 } }, function (err, temperature) {
        var currentDate = new Date();
        var lastUpdateDiff = currentDate - temperature.timeStamp;

        res.setHeader('Access-Control-Allow-Origin', '*');

        res.send({
            temp1: temperature.temp1,
            temp2: temperature.temp2,
            temp3: temperature.temp3,
            timeStamp: temperature.timeStamp,
            timeDiff: lastUpdateDiff
        });
    });
})

app.get('/historical', function (req, res) {
    TemperatureReading.find({ }, 'temp1 temp2 temp3 timeStamp', { sort: { 'timeStamp' : -1 }, limit: 10080 }, function (err, temperatures) {

        var result = [];

        for(var i = 0; i < temperatures.count; ++i){
            if(i % 10 === 0) {
                console.log(temperatures[i]);
                result.push({
                    temp1: temperatures[i].temp1,
                    temp2: temperatures[i].temp2,
                    temp3: temperatures[i].temp3,
                    timeStamp: temperatures[i].timeStamp
                });
            }
        }
        console.log(result);
        res.send(result);
    });
})

app.post('/', function (req, res) {
    var date = new Date();
    const tempReading = new TemperatureReading({
        temp1: req.body.temp1,
        temp2: req.body.temp2,
        temp3: req.body.temp3,
        timeStamp: date });

    tempReading.save().then(() => {
        console.log('Saved reading: ' + tempReading.temp1 + ' ' + tempReading.temp2 + ' ' + tempReading.temp3 + ', '+ tempReading.timeStamp);
    });

    res.send();
})/

app.listen(3000, () => console.log('Example app listening on port 3000!'))
