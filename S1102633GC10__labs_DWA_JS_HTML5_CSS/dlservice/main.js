/* Installation prerequisites
 npm i express
 npm i body-parser
 npm i cors
 npm i websocket
 */

/* application constants */

// import http and express APIs
const http = require('http');
const express = require('express');
const bp = require('body-parser');

// associate http server with express API
const app = express();
const server = http.createServer(express);
const hostname = 'localhost';
const port = 8080;
app.use(bp.json());
const cors = require('cors');
app.use(cors({
    origin: '*'
}));

const MILLI_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

// Class describing Experiment data objects
class Experiment {
    #id;
    #task;
    #budget;
    #startTime;
    #endTime;
    #complete;
    constructor(id, task, budget, startTime, endTime, complete) {
        this.#id = id;
        this.#task = task;
        this.#budget = budget;
        this.#startTime = startTime;
        this.#endTime = endTime;
        this.#complete = complete;
    }
    static createCompleteExperiment(id, task, budget, startTime, endTime) {
        return new Experiment(id, task, budget, startTime, endTime, true);
    }
    static createOngoingExperiment(id, task, budget, startTime) {
        return new Experiment(id, task, budget, startTime, null, false);
    }
    toString() {
        return this.#id+" "+this.#task+" "+this.#budget+" "+
               this.#startTime+" "+this.#endTime+" "+this.#complete;
    }
    get id() {
        return this.#id;
    }
    get task() {
        return this.#task;
    }
    get budget() {
        return this.#budget;
    }
    get startTime() {
        return this.#startTime;
    }
    get endTime() {
        return (this.#complete) ? this.#endTime : "ongoing";
    }
    get complete() {
        return this.#complete;
    }
    set complete(endTime) {
        this.#endTime = endTime;
        this.#complete = true;
    }
    getMeasurements() {
        return Array.from(data.getMeasurements(this.#id));
    }
    addMeasurement(unit, value) {
        let duration = formatDuration(new Date().getTime() - this.#startTime.getTime());
        let numValue = parseFloat(value);
        if (isNaN(numValue)) {
            throw "Measurement value "+value+" is not a number";
        }
        let measurement = new Measurement(unit, numValue, duration);
        data.addMeasurement(this.#id, measurement);
        return measurement;
    }
    toJSON () {
        return JSON.stringify({id:this.id, task:this.task, budget:this.budget,
            startTime:this.startTime, endTime:this.endTime, complete:this.complete});
    }
    static fromJSON(json){
        let obj = JSON.parse(json);
        if (obj.complete) {
            return Experiment.createCompleteExperiment(obj.id, obj.task, new Date(obj.startTime), new Date(obj.endTime));
        }
        return Experiment.createOngoingExperiment(obj.id, obj.task, new Date(obj.startTime));
    }
}

// Class describing Measurement data objects
class Measurement {
    static #units = ["s","m","kg","A","K","mol","cd"];
    static #max_id = 0;
    #id;
    #unit;
    #value;
    #time;
    constructor(unit, value, time) {
        this.#id = ++Measurement.#max_id;
        this.#unit = (Measurement.#units.indexOf(unit) == -1) ? null : unit;
        this.#value = value;
        this.#time = time;
    }
    toString() {
        return this.#id + " " + this.#unit + " " + this.#value + " " + this.#time;
    }
    get id() {
        return this.#id;
    }
    get unit() {
        return this.#unit;
    }
    get value() {
        return this.#value;
    }
    get time() {
        return this.#time;
    }
    toJSON () {
        return JSON.stringify({id:this.id,unit:this.unit,value:this.value,time:this.time});
    }
    static fromJSON(json){
        let obj = JSON.parse(json);
        return new Measurement (obj.unit, obj.value, obj.time);
    }
}

// An in-Memory "Database" with insert and search operations
const data = {
    allData : new Map(),  // a Map comprised of a Set of Measurements indexed by an Experiment object
    experiments : new Map(), // a Map comprised of Experiment objects indexed by ID
    measurements : new Map(), // a Map comprised of Measurement objects indexed by ID
    addExperiment(experiment) {
        this.experiments.set(experiment.id, experiment);
        this.allData.set(experiment, new Set());
    },
    addMeasurement(eId, measurement) {
        this.measurements.set(measurement.id, measurement);
        this.allData.get(this.getExperiment(eId)).add(measurement);
    },
    findExperiment(eId) {
        let experiment = this.getExperiment(eId);
        return new Promise((resolved, rejected) => {
            if (experiment != undefined) {
                resolved(experiment);
            } else {
                rejected("Experiment with id "+eId+" not found");
            }});
    },
    getExperiment(eId) {
        return this.experiments.get(eId);
    },
    getMeasurement(mId) {
        return this.measurements.get(mId);
    },
    getMeasurements(eId) {
        return this.allData.get(this.getExperiment(eId));
    }
}

function formatDuration(duration) {
    if (duration === 0) {
        return "PT0S";
    }
    let totalSeconds = Math.trunc(duration/MILLI_PER_SECOND);
    let hours = Math.trunc(totalSeconds / SECONDS_PER_HOUR);
    let minutes = Math.trunc((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    let seconds = Math.trunc(totalSeconds % SECONDS_PER_MINUTE);
    let result = "PT";
    if (hours != 0) {
        result+=hours+"H";
    }
    if (minutes != 0) {
        result+=minutes+"M";
    }
    if (seconds != 0) {
        result+=seconds+"S";
    }
    return result;
}

// Populate Experiment and Measurement data
data.addExperiment(Experiment.createOngoingExperiment(101, "Measure Weight", 123.45,
    new Date(2022,3,16,6,7)));
data.addExperiment(Experiment.createCompleteExperiment(102, "Measure Length", 321.54,
    new Date(2022,4,1,14,30),
    new Date(2022,4,2,21,12)));
data.addMeasurement(101, new Measurement("kg",42,"PT2M12S"));
data.addMeasurement(101, new Measurement("kg",40,"PT3M10S"));
data.addMeasurement(101, new Measurement("kg",3,"PT3M55S"));
data.addMeasurement(102, new Measurement("m",12,"PT1H20M"));
data.addMeasurement(102, new Measurement("m",12,"PT1H22M10S"));


// HTTP GET retrieve experiment by ID
app.get('/experiment/:id', (req, res) => {
    let eId = parseInt(req.params.id);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(data.getExperiment(eId).toJSON());
});
// HTTP GET retrieve measurements by experiment ID
app.get('/experiment/:id/measurements', (req, res) => {
    let eId = parseInt(req.params.id);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    let measurements = data.getExperiment(eId).getMeasurements();
    for(i = 0; i < measurements.length; i++) {
        measurements[i] = measurements[i].toJSON();
    }
    res.end(JSON.stringify(measurements));
});
// HTTP GET retrieve measurement by ID
app.get('/measurement/:id', (req, res) => {
    let mId = parseInt(req.params.id);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(data.getMeasurement(mId).toJSON());
});
// HTTP POST create new measurement
app.post('/experiment/:id/measurements', (req, res) => {
    let eId = parseInt(req.params.id);
    let experiment = data.getExperiment(eId);
    let json = req.body;
    let measurement = experiment.addMeasurement(json.unit, json.value);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(measurement.toJSON());
});
// HTTP PUT complete experiment with a given id
app.put('/experiment/:id/complete', (req, res) => {
    let eId = parseInt(req.params.id);
    let experiment = data.getExperiment(eId);
    let date = new Date();
    date.setMilliseconds(0);
    experiment.complete = date;
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(experiment.endTime));
});

// Demo: convert Map and Set values into arrays for JSON serialization
// function replacer (key, value) {
//     if(value instanceof Map){
//         return Array.from(value.entries());
//     } if (value instanceof Set) {
//         return Array.from(value.values());
//     } else {
//         return value;
//     }
// }

// Use express to start an HTTP server listener on a given host and port
let httpListener = app.listen(port, hostname,
    () => console.log(`Listening on port http://${hostname}:${port}/`));

// import websocket API
const websocketAPI = require('ws');

// prepare websocket server
const socketServer = new websocketAPI.Server({
    server:httpListener,
    path:"/chat",
    clientTracking: true});

// Map of users indexed by  socket
let userMap = new Map();

// accept socket connections
socketServer.on("connection", (socket) => {
    // create an entry in the userMap that
    // corresponds to the currently opened socket
    // no proper authentication is configured for this nodejs server,
    // so username is undefined and is expected to be
    // picked up from the first message sent by the client
    // this is not a secure coding practice and should be considered only
    // as an example of handling different socket messages
    // authentication and authorisation setup for the nodejs
    // is outside the scope of this set of practices
    userMap.set(socket,undefined);

    // handle all incoming messages
    socket.on("message", (message) => {
        // parse message as JSON
        let messageObject = JSON.parse(message);
        // check if message contains a user property
        // assume its present only in the initial messages
        // save user into the session storage
        // assign property text a message that indicates
        // that user has joined the chat
        if (messageObject.user != undefined) {
            userMap.set(socket, messageObject.user);
            messageObject.text = "joined";
        }
        // transmit message to all sockets opened on this server
        broadcastMessage(socketServer, socket, messageObject.text);
    });
    socket.on("close", (code) => {
        // transmit message that indicates user has left the chat
        // to all sockets opened on this server
        broadcastMessage(socketServer, socket,  "left");
        userMap.delete(socket);
    });
});

// broadcast messages to all opened sockets
// each message is composed of a user and text properties
// username corresponds to the socket that has posted the message
// text is acquired from a method argument
function broadcastMessage(socketServer, socket, text) {
    let message = {
        user : userMap.get(socket),
        text : text
    }
    // iterate through the collections of clients
    // that represent currently opened sockets of this server
    // convert message object to JSON and send it to each client
    socketServer.clients.forEach((client) => {
        client.send(JSON.stringify(message));
    });
}
