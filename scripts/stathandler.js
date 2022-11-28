import { gameSettings } from "./gamescript.js";
import { currentLines, currentStations, currentTrains, currentBudget, addTrainToLine } from "./lines.js";
import { findObjectBySpecificValue, findRealtimeObjectBySpecificValue } from "./helpers.js";
import { prepareStation } from "./stationhandler.js";

let moneyText = document.getElementById("money-text");
let lineText = document.getElementById("line-text");
let passengersText = document.getElementById("passengers-transported-text");
let buyTrainText = document.getElementById("buy-train");

export let stationsAllowed = [];

export function initStatisticUpdate() {
    setInterval(() => {
        moneyText.innerText = `Money: ${currentBudget['money']}€`;
        lineText.innerText = `Lines: ${currentLines.length}`;
        passengersText.innerText = `Passengers transported: ${sumPassengersFromAllLines()}`
    }, 50);
}

function sumPassengersFromAllLines() {
    let passengerSum = 0;
    currentLines.forEach(line => {
        passengerSum += line["passengers"]
    });
    return passengerSum;
}

export function initPassengerHandling() {
    initRandomPassengerSpawning()
    initStationPassengerInfo();
}

function initStationPassengerInfo() {
    setInterval(() => {
        for (let index = 0; index < currentStations.length; index++) {
            const station = document.getElementById(`station-${currentStations[index]['name']}`);
            let stationName = document.createElement("div");
            stationName.classList.add("station-name");
            stationName.innerText = currentStations[index]["name"].substr(0,3);
            let stationCounter = document.createElement("div");
            stationCounter.classList.add("passenger-info");
            stationCounter.innerText = "";
            for (const key in currentStations[index]["passengers"]) {
                stationCounter.innerHTML += key.substr(0,3) + ":" + currentStations[index]["passengers"][key] + "<br>";
            }
            station.innerHTML = "";
            station.appendChild(stationName);
            station.appendChild(stationCounter);
        }
    }, 50);
}

async function initRandomPassengerSpawning() {
    if (currentLines.length != 0) {
        let randomStation = currentStations[Math.floor(Math.random() * currentStations.length)];
        await setDestinationsForStation(randomStation);
        let destinationToSpawnNewPassengerFor = randomStation["name"];
        let currentLineObject = await findObjectBySpecificValue(currentLines, "color", randomStation["line"]);
        while (destinationToSpawnNewPassengerFor == randomStation["name"] || !(currentLineObject["stations"].includes(destinationToSpawnNewPassengerFor))) {
            destinationToSpawnNewPassengerFor = getRandomStationDestination(randomStation["passengers"]);
        }
        randomStation["passengers"][destinationToSpawnNewPassengerFor] += 1;
    }
    let passengerSpawnCounter = setSpawnSpeed();
    setTimeout(initRandomPassengerSpawning, passengerSpawnCounter);
}

function setSpawnSpeed() {
    let passengerSpawnCounter = 220; 
    let currentPassengerCount = sumPassengersFromAllLines()
    if (currentPassengerCount > 300) {
        passengerSpawnCounter = 50;
    }
    else if (currentPassengerCount > 200) {
        passengerSpawnCounter = 160;
    }
    else if (currentPassengerCount > 100) {
        passengerSpawnCounter = 180;
    }
    else if (currentPassengerCount > 50 ) {
        passengerSpawnCounter = 200;
    }
    return passengerSpawnCounter;
}

function setDestinationsForStation(station) {
    currentStations.forEach(async destinationStation => {
        let currentLineObject = await findObjectBySpecificValue(currentLines, "color", station["line"]);
        if (currentLineObject["stations"].includes(destinationStation["name"])) {
            if (!(destinationStation["name"] in station["passengers"]) && destinationStation["name"] != station["name"]) {
                station["passengers"][destinationStation["name"]] = 0;
            }
        }
    });
}

function getRandomStationDestination(object) {
    const keys = Object.keys(object);
    return keys[Math.floor(Math.random() * keys.length)];
}

export async function pickUpPassengers(trainId, stationName, lineId) {
    let currentLineObject = await findObjectBySpecificValue(currentLines, "lineId", lineId);
    let currentStationObject = await findObjectBySpecificValue(currentStations, "name", stationName);
    let currentTrainObject = await findObjectBySpecificValue(currentTrains, "trainId", trainId);
    for (const key in currentStationObject["passengers"]) {
        if (!(key in currentTrainObject["currentPassengers"])) {
            currentTrainObject["currentPassengers"][key] = 0;
        }
        if (currentLineObject["stations"].includes(key)) {
            while (currentTrainObject["currentTotalPassengers"] < currentTrainObject["trainCapacity"]) {
                if (currentStationObject["passengers"][key] == 0) {
                    break;
                }
                currentTrainObject["currentPassengers"][key]++;
                currentTrainObject["currentTotalPassengers"]++
                currentStationObject["passengers"][key]--;
            }
        }
    }
 }

 export async function disembarkPassengers(trainId, stationName, lineId) {
    let currentLineObject = await findObjectBySpecificValue(currentLines, "lineId", lineId);
    let currentStationObject = await findObjectBySpecificValue(currentStations, "name", stationName);
    let currentTrainObject = await findObjectBySpecificValue(currentTrains, "trainId", trainId);
    for (const key in currentTrainObject["currentPassengers"]) {
        if (key == currentStationObject["name"]) {
            currentBudget['money'] += (currentTrainObject["currentPassengers"][key] * gameSettings["priceForOneRide"]);
            currentLineObject["passengers"] += currentTrainObject["currentPassengers"][key]
            currentTrainObject["currentTotalPassengers"] -= currentTrainObject["currentPassengers"][key];
            currentTrainObject["currentPassengers"][key] = 0;
        }
    }
 }


 export function initGameButtons(gameScreen) {
    buyTrainText.addEventListener("click", () => {
        if (currentBudget['money'] >= gameSettings['trainPrice']) {
            let chosenLine = parseInt(prompt("Which line gets a new train?", 1));
            currentBudget['money'] -= gameSettings['trainPrice'];
            addTrainToLine(chosenLine, gameScreen);
        }
        else {
            alert("Not enough money");
        }
    })
    setInterval(() => {
        buyTrainText.innerText = "Zug kaufen " + gameSettings['trainPrice'];
        if (currentBudget['money'] >= gameSettings['trainPrice']) {
            buyTrainText.classList.add("button-active");
        }
        else {
            buyTrainText.classList.remove("button-active");
        }
    }, 50);
}


export function initStationUpdate(stations) {
    setInterval(() => {
        const randomStation = stations[Math.floor(Math.random() * stations.length)];
        while (randomStation in stationsAllowed) {
            randomStation = stations[Math.floor(Math.random() * stations.length)];
        }
        let stationToAdd = {};
        stationToAdd["name"] = randomStation.dataset.stationName;
        prepareStation(stationToAdd);
    }, 10000);
    

}