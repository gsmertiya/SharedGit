console.log("Hello from DukeLabs!");

/* --- Constants Section --- */
const LB_PER_KG = 2.2;
const MILLI_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/* --- Objects Section --- */
// Create Experiment objects
let experiment1 = {
    id: 101,
    task: "Measure Weight",
    budget: 123.45,
    startTime: new Date(2022,3,16,6,7),
    complete: false
};
let experiment2 = {
    id: 102,
    task: "Measure Length",
    budget: 321.54,
    startTime: new Date(2022,4,1,14,30),
    endTime: new Date(2022,4,2,21,12),
    complete: true
};

// Create Measurement objects
let measurement1 = {
    id: 1,
    unit: "kg",
    value: 42,
    time: 'PT2M12S'
};
let measurement2 = {
    id: 2,
    unit: "kg",
    value: 40,
    time: 'PT3M10S'
};
let measurement3 = {
    id: 3,
    unit: "kg",
    value: 3,
    time: "PT3M55S"
};
let measurement4 = {
    id: 4,
    unit: "m",
    value: 12,
    time: "PT20M"
};
let measurement5 = {
    id: 5,
    unit: "m",
    value: 10,
    time: "PT1H22M10S"
};

// Create and populate an array of Measurement objects
let measurements = [measurement1, measurement2, measurement3];

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

// Format Experiment object
function formatExperiment(experiment) {
   let result = "Experiment "+experiment.id+" \""+experiment.task+"\" ";
   result += "Budget: "+formatCurrency(experiment.budget)+" ";
   result += experiment.startTime.toLocaleString("en-GB", {timeZone: "Europe/London"})+" ";
   result += (experiment.complete) ? experiment.endTime.toLocaleString("en-GB", {timeZone: "Europe/London"}) : "on going";
   return result;
}

// Format Measurement object
function formatMeasurement(measurement) {
    let result = "Measurement "+measurement.id+" "+measurement.unit+" "+measurement.value+" "+measurement.time;
    return result;
}

/* --- Test Section --- */
// Convert between pounds and kilograms
let lb = kg2lb(measurement1.value);
let kg = lb2kg(lb);
console.log("Pounds: "+lb+" Kilograms: "+kg);

// Parse and format duration milliseconds and string representations
let durationMS = parseDuration(measurement3.time);
console.log("Measurement time offset from the start of the experiment in milliseconds: "+durationMS);

// Calculate measurement time
let measuremetTime = experiment2.startTime.getTime()+durationMS;
console.log("Measurement time: "+new Date(measuremetTime));

// Calculate experiment duration
let durationTime = formatDuration(experiment2.endTime-experiment2.startTime);
console.log("Experiment Duration: "+durationTime);

// Compare measurements:  smaller -1, equal 0, greater 1 value
console.log("Compare Measurements: " + compareMeasurements(measurement1, measurement2));

// Calculate measurements average value version 1 (assuming single unit)
let avgValue = calculateAverageMeasurement(measurements);
// let avgValue = calculateAverageMeasurement([]);
console.log("Average value: " + avgValue);

// Calculate measurements average value version 2 (per each unit)
measurements[3] = measurement4;
measurements[4] = measurement5;
let avgValues = calculateAverageMeasurements(measurements);
console.log("Average values Kg: " + avgValues.kgTotal+", m: "+avgValues.mTotal);

// Print each experiment
console.log(formatExperiment(experiment1));
console.log(formatExperiment(experiment2));

// Sort measurements
measurements.sort(compareMeasurements);

// Iterate and print array of measurements
for (const measurement of measurements) {
    console.log(formatMeasurement(measurement));
}
