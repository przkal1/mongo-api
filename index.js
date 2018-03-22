const express = require('express')
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');

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
    var limit = 5760;
    var step = 60;

    if(req.query.limit){
        limit = parseInt(req.query.limit)
    }
    if(req.query.step){
        step = parseInt(req.query.step)
    }

    TemperatureReading.find({ }, 'temp1 temp2 temp3 timeStamp', { sort: { 'timeStamp' : -1 }, limit: limit }, function (err, temperatures) {
        //grouped = _.groupBy(temperatures, function(temperature) { return new moment(temperature.timeStamp); });

        var result = [];
        for(var i = 0; i < temperatures.length; ++i){
            if(i % step === 0) {
                result.push({
                    temp1: temperatures[i].temp1,
                    temp2: temperatures[i].temp2,
                    temp3: temperatures[i].temp3,
                    timeStamp: temperatures[i].timeStamp.toUTCString()
                });
            }
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(result);
    });
})

app.get('/test', function (req, res) {

    TemperatureReading.find({ }, 'temp1 temp2 temp3 timeStamp', { sort: { 'timeStamp' : -1 }, limit: 5760 }, function (err, temperatures) {
        grouped = _.groupBy(temperatures, function(temperature) { return new moment(temperature.timeStamp).format('YYYY MM DD HH'); });

        console.log(grouped);

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(grouped);
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
