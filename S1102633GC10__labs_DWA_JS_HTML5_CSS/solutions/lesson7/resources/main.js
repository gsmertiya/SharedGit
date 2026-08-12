import {data,calculateAverageMeasurement,formatCurrency} from "./data_service.js";

/* --- UI Events and Functions Section --- */
function findExperiment(event) {
    // prevent default event action which would try to submit the form
    // because this from is not actually intended to be submitted to a server
    // since all fields are handled by JavaScript functions on the client
    event.preventDefault();
    // retrieve target elements from the document
    let exp_id_field = document.getElementById("exp_id_field");
    let exp_task_field = document.getElementById("exp_task_field");
    let exp_budget_field = document.getElementById("exp_budget_field");
    let exp_startTime_field = document.getElementById("exp_startTime_field");
    let exp_endTime_field = document.getElementById("exp_endTime_field");
    let exp_complete_field = document.getElementById("exp_complete_field");
    let mea_add_button = document.getElementById("mea_add_button");

    // find Experiment
    let exp_id = parseInt(exp_id_field.value);
    // let experiment = data.getExperiment(exp_id);
    //
    // if (experiment == undefined) {
    //     alert("Experiment with id "+exp_id+" not found");
    //     resetExperimentForm();
    //     resetMeasurementsTable();
    // }else{
    //     exp_task_field.value = experiment.task;
    //     exp_budget_field.value = formatCurrency(experiment.budget);
    //     exp_startTime_field.value = experiment.startTime.toISOString().slice(0, -1);
    //     if (experiment.complete) {
    //         exp_complete_field.checked = true;
    //         exp_endTime_field.value = experiment.endTime.toISOString().slice(0, -1);
    //         exp_complete_field.disabled = true;
    //         mea_add_button.disabled = true;
    //     }else{
    //         exp_complete_field.checked = false;
    //         exp_endTime_field.value = "";
    //         exp_complete_field.disabled = false;
    //         mea_add_button.disabled = false;
    //     }
    //     displayMeasurements(experiment);
    // }

    // Change find experiment functionality to use a promise
    data.findExperiment(exp_id).then((experiment)=>{
        exp_task_field.value = experiment.task;
        exp_budget_field.value = formatCurrency(experiment.budget);
        exp_startTime_field.value = experiment.startTime.toISOString().slice(0, -1);
        if (experiment.complete) {
            exp_complete_field.checked = true;
            exp_endTime_field.value = experiment.endTime.toISOString().slice(0, -1);
            exp_complete_field.disabled = true;
            mea_add_button.disabled = true;
        }else{
            exp_complete_field.checked = false;
            exp_endTime_field.value = "";
            exp_complete_field.disabled = false;
            mea_add_button.disabled = false;
        }
        displayMeasurements(experiment);
    }).catch((error)=>{
        alert(error);
        resetExperimentForm();
        resetMeasurementsTable();
    });
}

function displayMeasurements(experiment) {
    // remove old elements from the document
    resetMeasurementsTable();

    // find Measurements for a given experiment
    let measurements = experiment.getMeasurements();
    let average = calculateAverageMeasurement(measurements);
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;
    if (measurements.length == 0) {
        average = 0;
    } else {
        let mea_table = document.getElementById("mea_table");
        for (const measurement of measurements) {
            max = Math.max(max, measurement.value);
            min = Math.min(min, measurement.value);
            let id_cell = document.createElement("td");
            id_cell.appendChild(document.createTextNode(measurement.id));
            let unit_cell = document.createElement("td");
            unit_cell.appendChild(document.createTextNode(measurement.unit));
            let value_cell = document.createElement("td");
            value_cell.appendChild(document.createTextNode(measurement.value));
            let time_cell = document.createElement("td");
            time_cell.appendChild(document.createTextNode(measurement.time));
            let mea_row = document.createElement("tr");
            mea_row.appendChild(id_cell);
            mea_row.appendChild(unit_cell);
            mea_row.appendChild(value_cell);
            mea_row.appendChild(time_cell);
            mea_table.appendChild(mea_row);
        }

        // visually represent an average value
        // page should display a value between 0 and 100
        // that has the same ratio as the average value of measurements
        // between min and max measurements
        // calculate this ratio by:
        // - subtracting min measurement from the average
        // - multiplying it to 100
        // - dividing the result by the difference between max and min measurement values
        let averageRatio =  ((average-min)*100)/(max-min);

        // assign averageRatio result to the exp_average_field
        // let exp_average_field = document.getElementById("exp_average_field");
        // exp_average_field.value = averageRatio;

        // replace the exp_average_field with the assigment of the averageRatio value
        // as a percentage width of the exp_average_value div element
        // and average value as the text displayed in this div
        // replace exp_average_field with exp_average_value
        let exp_average_value = document.getElementById("exp_average_value");
        exp_average_value.style.width = averageRatio + '%';
        exp_average_value.innerText = average;
    }
}
function completeExperiment(event) {
    let exp_id_field = document.getElementById("exp_id_field");
    let exp_complete_field = document.getElementById("exp_complete_field");
    let exp_endTime_field = document.getElementById("exp_endTime_field");
    let mea_add_button = document.getElementById("mea_add_button");
    let exp_id = parseInt(exp_id_field.value);
    let experiment = data.getExperiment(exp_id);
    let date = new Date();
    date.setMilliseconds(0);
    experiment.complete = date;
    exp_complete_field.checked = true;
    exp_endTime_field.value = experiment.endTime.toISOString().slice(0, -1);
    exp_complete_field.disabled = true;
    mea_add_button.disabled = true;
}
function showAddMeasurementDialog(event) {
    let mea_add_dialog = document.getElementById("mea_add_dialog");
    mea_add_dialog.showModal();
}
function addMeasurement(event) {
    // prevent default event action which would try to submit the form
    // because this from is not actually intended to be submitted to a server
    // since all fields are handled by JavaScript functions on the client
    event.preventDefault();
    let exp_id_field = document.getElementById("exp_id_field");
    let mea_unit_input = document.getElementById("mea_unit_input");
    let mea_value_input = document.getElementById("mea_value_input");

    // find experiment
    let exp_id = parseInt(exp_id_field.value);
    let experiment = data.getExperiment(exp_id);

    // add new measurement to the experiment
    // catch exception indicating that measurement value is not a number
    // display alert containing error message
    try {
        experiment.addMeasurement(mea_unit_input.value, mea_value_input.value);
        //  hide and reset add measurement dialog
        let mea_add_dialog = document.getElementById("mea_add_dialog");
        let mea_form = document.getElementById("mea");
        mea_form.reset();
        mea_add_dialog.close();
    }catch(error) {
        alert(error);
    }

    // refresh table of measurements
    displayMeasurements(experiment);
}

// close the dialog,
// no need to reset the form because event
// is triggered via the reset button
function cancelAddMeasurement(event) {
    let mea_add_dialog = document.getElementById("mea_add_dialog");
    mea_add_dialog.close();
}

function resetMeasurementsTable() {
    let mea_table = document.getElementById("mea_table");
    while (mea_table.lastElementChild) {
        mea_table.removeChild(mea_table.lastElementChild);
    }
}

function resetExperimentForm() {
    let exp_form = document.getElementById("exp");
    let mea_add_button = document.getElementById("mea_add_button");
    // let exp_average_field = document.getElementById("exp_average_field");
    exp_form.reset();
    // exp_average_field.value = 0;
    // reset exp_average_value width to 0 and text to be empty
    let exp_average_value = document.getElementById("exp_average_value");
    exp_average_value.style.width = "0%";
    exp_average_value.innerText = "";
    mea_add_button.disabled = true;
}

// add a function to animate image
// by toggling it style class association
function animateImage(image) {
    image.classList.toggle("grey");
}

// handle window load event to register event listeners
// for the object within this page
window.addEventListener("load", (event) => {
    let exp_find_button = document.getElementById("exp_find_button");
    let exp_complete_field = document.getElementById("exp_complete_field");
    let mea_add_button = document.getElementById("mea_add_button");
    let mea_ok_button = document.getElementById("mea_ok_button");
    let mea_reset_button = document.getElementById("mea_reset_button");
    exp_find_button.addEventListener("click", findExperiment);
    exp_complete_field.addEventListener("change",completeExperiment);
    mea_add_button.addEventListener("click",showAddMeasurementDialog);
    mea_ok_button.addEventListener("click",addMeasurement);
    mea_reset_button.addEventListener("click",cancelAddMeasurement);
    // retrieve image element and accociate it with the animateImage function
    let image = document.getElementsByClassName("img_slogan").item(0);
    setInterval(animateImage, 1000, image);
});

