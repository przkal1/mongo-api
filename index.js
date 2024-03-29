const express = require('express')
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');

mongoose.connect('mongodb://127.0.0.1:27017/home?directConnection=true');
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

        TemperatureReading.count({}, function(err, count){
            res.send({
                temp1: temperature.temp1,
                temp2: temperature.temp2,
                temp3: temperature.temp3,
                timeStamp: temperature.timeStamp,
                timeDiff: lastUpdateDiff,
                totalReadingCount: count
            });
        })
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
        var groupedData = _.groupBy(temperatures, function(temperature) { return new moment.utc(temperature.timeStamp).format('YYYY-MM-DD HH'); });
        var result = [];

        for (var date in groupedData) {
            result.push({
                temp1: _.meanBy(groupedData[date], (temp) => temp.temp1),
                temp2: _.meanBy(groupedData[date], (temp) => temp.temp2),
                temp3: _.meanBy(groupedData[date], (temp) => temp.temp3),
                timeStamp: moment.utc(date).add(1, 'hours')
            });
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(result);
    });
})

app.get('/test', function (req, res) {
    res.send(200);
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


    TemperatureReading.count({}, function(err, count){
        if(count > 3000) {
            TemperatureReading.findOne({ }, '_id timeStamp', { sort: { 'timeStamp' : 1 } }, function (err, temperature) {
                TemperatureReading.findOneAndRemove({ _id: temperature._id }).exec();
            });
        }
    })
    res.send();
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
