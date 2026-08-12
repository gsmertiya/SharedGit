/* --- Constants Section --- */
const LB_PER_KG = 2.2;
const MILLI_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/* Class definition section */
// define Experiment class
class Experiment {
    // declare private properties
    #id;
    #task;
    #budget;
    #startTime;
    #endTime;
    #complete;
    // define constructor to initialize all properties of an Experiment object
    constructor(id, task, budget, startTime, endTime, complete) {
        this.#id = id;
        this.#task = task;
        this.#budget = budget;
        this.#startTime = startTime;
        this.#endTime = endTime;
        this.#complete = complete;
    }
    // define static function to initialize a complete Experiment object
    static createCompleteExperiment(id, task, budget, startTime, endTime) {
        return new Experiment(id, task, budget, startTime, endTime, true);
    }
    // define static function to initialize an ongoing Experiment object
    static createOngoingExperiment(id, task, budget, startTime) {
        return new Experiment(id, task, budget, startTime, null, false);
    }
    // copy formatExperiment function logic into the toString operation
    // modify property references to pint current objects private properties
    toString() {
        let result = "Experiment "+this.#id+" \""+this.#task+"\" ";
        result += "Budget: "+formatCurrency(this.#budget)+" ";
        result += this.#startTime.toLocaleString("en-GB", {timeZone: "Europe/London"})+" ";
        result += (this.#complete) ? this.#endTime.toLocaleString("en-GB", {timeZone: "Europe/London"}) : "ongoing";
        return result;
    }
    // create get property accessors
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
    // create set property accessor that completes the experiment
    set complete(endTime) {
        this.#endTime = endTime;
        this.#complete = true;
    }
    getMeasurements() {
        return Array.from(data.getMeasurements(this.#id));
    }
    addMeasurement(unit, value) {
        // calculate time of the measurement as an offset from the start of the experiment
        let duration = formatDuration(new Date().getTime() - this.#startTime.getTime());
        // validate if measurement value is a number
        // throw exception when it is not
        let numValue = parseFloat(value);
        if (isNaN(numValue)) {
            throw "Measurement value "+value+" is not a number";
        }
        // create measurement and add it to the experiment
        data.addMeasurement(this.#id, new Measurement(unit, numValue, duration));
    }
}

// define Measurement class
class Measurement {
    // create private static array of SI units of measure
    static #units = ["s","m","kg","A","K","mol","cd"];
    static #max_id = 0;
    // declare private properties
    #id;
    #unit;
    #value;
    #time;
    // define constructor to initialize all private properties of a Measurement object
    // validate that unit of measure is an SI unit
    constructor(unit, value, time) {
        this.#id = ++Measurement.#max_id;
        this.#unit = (Measurement.#units.indexOf(unit) == -1) ? null : unit;
        this.#value = value;
        this.#time = time;
    }
    // copy formatMeasurement function logic into the toString operation
    // modify property references to pint current objects private properties
    toString() {
        let result = "Measurement " + this.#id + " " + this.#unit + " " + this.#value + " " + this.#time;
        return result;
    }
    // create get property accessors
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
}

// define a ThoughExperiment class that extends the Experiment
class ThoughtExperiment extends Experiment {
    // Add private property that represents an array of thoughts
    #thoughts = [];
    // initialise Experiment properties via superclass constructor
    // set budget as zero
    // initialise first thought
    constructor(id, task, thought, startTime, endTime, complete) {
        super(id, task, 0, startTime, endTime, complete);
        this.#thoughts[0] = thought;
    }
    // add set and get assessors for a thought array
    // return an entire array from the get accessor
    get thoughts(){
        return this.#thoughts;
    }
    // append a thought to an entire via set accessor
    set thought(thought) {
        this.#thoughts.push(thought);
    }
    // reuse superclass toString function
    // concatenate thoughts as a list of lines
    toString() {
        let result = super.toString()+"\nThoughts:";
        for (const thought of this.#thoughts) {
            result += "\n - "+thought;
        }
        return  result;
    }
}

// Add getMeasurements function to the Experiment prototype
// Experiment.prototype.getMeasurements = function() {
//     return Array.from(data.getMeasurements(this.id));
// }

/* --- Objects Section --- */
// An in-Memory "Database" with insert and search operations
const data = {
    allData : new Map(),  // a Map comprised of a Set of Measurements indexed by an Experiment object
    experiments : new Map(), // a Map comprised of Experiment objects indexed by ID
    measurements : new Map(), // a Map comprised of Measurement objects indexed by ID
    addExperiment(experiment) {
        this.experiments.set(experiment.id, experiment);
        this.allData.set(experiment, new Set());
    },
    // Add a new Measurement to an Experiment with a given ID
    addMeasurement(eId, measurement) {
        this.measurements.set(measurement.id, measurement);
        this.allData.get(this.getExperiment(eId)).add(measurement);
    },
    // Find an Experiment with a given ID
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
    // Find a Measurement with a given ID
    getMeasurement(mId) {
        return this.measurements.get(mId);
    },
    // Find all Measurement objects for a given experiment ID
    getMeasurements(eId) {
        return this.allData.get(this.getExperiment(eId));
    }

}

// Instantiate Experiment objects
let experiment1 = Experiment.createOngoingExperiment(101, "Measure Weight", 123.45,
    new Date(2022,3,16,6,7));
let experiment2 = Experiment.createCompleteExperiment(102, "Measure Length", 321.54,
    new Date(2022,4,1,14,30),
    new Date(2022,4,2,21,12));

// Instantiate Measurement objects
let measurement1 = new Measurement("kg",42,'PT2M12S');
let measurement2 = new Measurement("kg",40,'PT3M10S');
let measurement3 = new Measurement("kg",3,"PT3M55S");
let measurement4 = new Measurement("m",12,"PTH20M");
let measurement5 = new Measurement("m",10,"PT1H22M:10S");

// Add experiments and measurements to data object
data.addExperiment(experiment1);
data.addExperiment(experiment2);
data.addMeasurement(experiment1.id,measurement1);
data.addMeasurement(experiment1.id,measurement2);
data.addMeasurement(experiment1.id,measurement3);
data.addMeasurement(experiment2.id,measurement4);
data.addMeasurement(experiment2.id,measurement5);

// Create and populate an array of Measurement objects
// let measurements = [measurement1, measurement2, measurement3];
// let measurements = Array.from(data.getMeasurements(101));
// use getMeasurements function of the Experiment
// let measurements = data.getExperiment(101).getMeasurements();

/* --- Function Section --- */
// Convert between pounds and kilograms
function lb2kg(lb) {
    return lb / LB_PER_KG;
}
function kg2lb(kg) {
    return kg * LB_PER_KG;
}

// parse duration from ISO format "PT<hours>H<minutes>M<seconds>S" to milliseconds
function parseDuration(duration) {
    let durationPattern = /PT(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;
    let matches = duration.match(durationPattern);
    let hours = (matches[1] === undefined) ? 0 : matches[1];
    let minutes = (matches[2] === undefined) ? 0 : matches[2];
    let seconds = (matches[3] === undefined) ? 0 : matches[3];
    return (parseInt(hours)*SECONDS_PER_HOUR+parseInt(minutes)*SECONDS_PER_MINUTE+parseInt(seconds))*MILLI_PER_SECOND;
}

// format duration from milliseconds into ISO format as "PT<hours>H<minutes>M<seconds>S"
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

// Compare two measurement objects
function compareMeasurements(m1, m2) {
    let result = 0;
    if (m1.value < m2.value) {
        result = -1;
    } else {
        if (m1.value == m2.value) {
            result = 0;
        } else {
            result = 1;
        }
    }
    return result;
}

// Iterate through measurements array and calculate average value version 1 (assuming single unit)
function calculateAverageMeasurement(measurements) {
    let result = 0;
    for (const measurement of measurements) {
        result += parseFloat(measurement.value);
    }
    result = (result/measurements.length).toFixed(2);
    return result;
}

// Iterate through measurements array and calculate average value version 2 (per each unit)
function calculateAverageMeasurements(measurements) {
    let result = {
        kgTotal: 0.0,
        kgValues: 0,
        mTotal: 0.0,
        mValues: 0
    };
    for (const measurement of measurements) {
        switch (measurement.unit) {
            case "kg":
                result.kgTotal += parseFloat(measurement.value);
                result.kgValues++;
                break;
            case "m":
                result.mTotal += parseFloat(measurement.value);
                result.mValues++;
                break;
        }
    }
    result.kgTotal = (result.kgTotal/result.kgValues).toFixed(2);
    result.mTotal = (result.mTotal/result.mValues).toFixed(2);
    return result;
}

// format currency
function formatCurrency(value){
    const format = new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP',minimumFractionDigits: 0, maximumFractionDigits: 2});
    return format.format(value);
}

export {data,calculateAverageMeasurement,formatCurrency}