var express = require('express');
var router = express.Router();
var {dummy} = require('./../db/dummy.js');

var fs = require('fs');
var obj_data = require('./data.json')

var {mongoose} = require('../db/mongoose.js')
var {users} = require('../db/models/users.js')
var axios = require('axios');

/* GET home page. */
var final_obj;

router.get('/', function (req, res, next) {

    

    // console.log(obj_data.cluster.length);
    var food = [];
    var water = [];
    var other = [];
    var sat = [];
    var med = [];

    for(var i=0;i<obj_data.cluster.length;i++){
        var coords = [obj_data.long[i], obj_data.lat[i]];
        if(obj_data.cluster[i] == 0) other.push(coords);
        if(obj_data.cluster[i] == 1) water.push(coords);
        if(obj_data.cluster[i] == 2) sat.push(coords);
        if(obj_data.cluster[i] == 3) med.push(coords);
        if(obj_data.cluster[i] == 4) food.push(coords);
    }



    var features_data = [];
    users.find().then(data => {
        var dummy = data;
        var features_data = [];

    var flag = 0;
    for(var i=0;i<dummy.length;i++){
        // var new_id = Math.random()*10000000;

        // var probs = ["Food", "Water", "Sanitation", "Medicine", "Others"];
        // var new_prob = [];
        
        // for(var j=0;j<dummy[i].problems.length;j++){
        //     if(dummy[i].problems[j] != 0)
        //         new_prob.push(probs[j]);        
        // }
        
        var new_obj = { 
            "type": "Feature", 
            "properties": { 
                "id": dummy[i].id, 
                "name": dummy[i].name,
                "problems" : dummy[i].problems
            }, 
            "geometry": { 
                "type": "Point", 
                "coordinates": [ dummy[i].coordinate.long, dummy[i].coordinate.lat ] 
            } 
        };
        features_data.push(new_obj);
        
        if(features_data.length == dummy.length){
            
            final_obj = {
                type: "FeatureCollection",
                crs: {
                    type: "name",
                    properties: {
                        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                    }
                },
                features: features_data
            }


            res.render('mapbox', {
                encoded: encodeURIComponent(JSON.stringify(final_obj)), 
                foods: encodeURIComponent(JSON.stringify(food)),
                waters: encodeURIComponent(JSON.stringify(water)),
                sats: encodeURIComponent(JSON.stringify(sat)),
                meds: encodeURIComponent(JSON.stringify(med)),
                others: encodeURIComponent(JSON.stringify(other))

            });

        }


    }
    })
});

router.get('/geojson', (req,res,next) => {
    users.find().then(data => {
        var dummy = data;
        var features_data = [];
    var flag = 0;
    for(var i=0;i<dummy.length;i++){
        // var new_id = Math.random()*10000000;

        // var probs = ["Food", "Water", "Sanitation", "Medicine", "Others"];
        // var new_prob = [];
        
        // for(var j=0;j<dummy[i].problems.length;j++){
        //     if(dummy[i].problems[j] != 0)
        //         new_prob.push(probs[j]);        
        // }
        
        var new_obj = { 
            "type": "Feature", 
            "properties": { 
                "id": dummy[i].id, 
                "name": dummy[i].name,
                "problems" : dummy[i].problems
            }, 
            "geometry": { 
                "type": "Point", 
                "coordinates": [ dummy[i].coordinate.long, dummy[i].coordinate.lat ] 
            } 
        };
        features_data.push(new_obj);
        
        if(features_data.length == dummy.length){
            
            final_obj = {
                type: "FeatureCollection",
                crs: {
                    type: "name",
                    properties: {
                        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                    }
                },
                features: features_data
            }
            res.status(200).send(final_obj);
        }
    }
    })
   
})

router.post('/addProblem', (req,res,next) => {
    console.log(req.body);
    var token = req.cookies.token; 
    axios.post(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`).then(data => {
        var id = data.data.sub;
        users.findOneAndUpdate({id:id}, {
            $set: {coordinate: {lat: req.body.lat, long:req.body.long}, problems: req.body.problems}
        }).then(data => {
             console.log(data);
             res.status(200).send("updated")
         }).catch(e => {
             console.log(e);
         })
    }).catch(e => {
        console.log(e);
    })
})

module.exports = router;
