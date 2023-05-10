// Statistics Script
// contains stat logic (passenger spawning, picking up and disembarking passengers) and
// functionality for showing stats on user interface

import { gameSettings, stopGame } from './gamescript.js';
import { currentLines, currentStations, currentTrains, currentBudget, addTrainToLine } from './lines.js';
import { findObjectBySpecificValue } from './helpers.js';
import { checkForUnlockedAchievements } from './achievements.js';

let moneyText = document.getElementById('money-text');
let lineText = document.getElementById('line-text');
let passengersText = document.getElementById('passengers-transported-text');
let buyTrainText = document.getElementById('buy-train');
let trainInfoContainer = document.getElementById('trains');

export let stationsAllowed = [];

export function initStatisticUpdate() {
    setInterval(() => {
        moneyText.innerText = `Money: ${currentBudget['money']}€`;
        lineText.innerText = `Lines: ${currentLines.length}`;
        passengersText.innerText = `Pax transported: ${sumPassengersFromAllLines()}`
        trainInfoContainer.innerHTML = getTrainInfo();
        checkForUnlockedAchievements();
    }, 50);
}

export function sumPassengersFromAllLines() {
    let passengerSum = 0;
    currentLines.forEach(line => {
        passengerSum += line['passengers']
    });
    return passengerSum;
}

function getTrainInfo() {
    let trainInfoHTML = `<div id="train-info"><p class="info-element">Train</p> <p class="info-element">Line</p> <p class="info-element">Pax</p></div>`;
    currentTrains.forEach((train) => {
        trainInfoHTML += `<div id="train-info"><p class="info-element">${train["trainId"]}</p> <p style="background-color: ${train["lineColor"]};" class="info-element">${train["lineId"]}</p> <p class="info-element">${train["currentTotalPassengers"]}/${train["trainCapacity"]}</p></div>`
    })
    return trainInfoHTML;
}

export function initPassengerHandling() {
    initRandomPassengerSpawning()
    initStationPassengerInfo();
}

function initStationPassengerInfo() {
    console.log(gameSettings.maxPeopleAtStation/2)
    setInterval(() => {
        for (let index = 0; index < currentStations.length; index++) {
            const station = document.getElementById(`station-${currentStations[index]['name']}`);
            let stationName = document.createElement('div');
            stationName.classList.add('station-name');
            stationName.innerText = currentStations[index]['name'].substr(0,3);
            let stationCounter = document.createElement('div');
            stationCounter.classList.add('passenger-info');
            stationCounter.innerText = '';
            for (const key in currentStations[index]['passengers']) {
                stationCounter.innerHTML += key.substr(0,3) + ':' + currentStations[index]['passengers'][key] + '<br>';
            }
            station.innerHTML = '';
            let stationBarContainer = document.createElement('div');
            stationBarContainer.classList.add('station-bar-container');
            if (currentStations[index]['currentTotalPassengers'] >= (gameSettings.maxPeopleAtStation/2)) {
                stationCounter.style = 'background-color: yellow !important';
                stationBarContainer.style = 'display: block';
                let stationBar = document.createElement('div');
                stationBar.classList.add('station-bar');
                let percentageOfMaxPeopleAtStation = currentStations[index]['currentTotalPassengers'] / gameSettings.maxPeopleAtStation * 100;
                stationBar.style = `width: ${percentageOfMaxPeopleAtStation}%;`;
                stationBarContainer.append(stationBar);
            }
            else {
                stationCounter.style = 'background-color: white';
            }
            stationCounter.appendChild(stationBarContainer);
            station.appendChild(stationName);
            station.appendChild(stationCounter);
        }
    }, 50);
}

async function initRandomPassengerSpawning() {
    if (currentLines.length != 0) {
        let randomStation = currentStations[Math.floor(Math.random() * currentStations.length)];
        setDestinationsForStation(randomStation);
        let destinationToSpawnNewPassengerFor = randomStation['name'];

        let stationLines = getStationLines(randomStation);
        let reachableStations = [];
        for (let lineIndex = 0; lineIndex < stationLines.length; lineIndex++) {
            const line = stationLines[lineIndex];
            for (let stationIndex = 0; stationIndex < line['stations']; stationIndex++) {
                reachableStations.push(line[stationIndex]);
            }
        }
        let counter = 0;
        while (destinationToSpawnNewPassengerFor == randomStation['name'] || !(reachableStations.includes(destinationToSpawnNewPassengerFor))) {
            destinationToSpawnNewPassengerFor = getRandomStationDestination(randomStation['passengers']);
            counter++;
            if (counter == 10) {
                break;
            }
        }
        randomStation['passengers'][destinationToSpawnNewPassengerFor] += 1;
        randomStation['currentTotalPassengers'] += 1;
        if (randomStation['currentTotalPassengers'] >= gameSettings.maxPeopleAtStation) {
            stopGame(`Reason: Overcrowding. Too many people were at ${randomStation['name']}!`)
        }
    }
    let passengerSpawnCounter = setSpawnDelay();
    setTimeout(initRandomPassengerSpawning, passengerSpawnCounter);
}

function setSpawnDelay() {
    // linear spawning
    // fast increase till around 200, then slower increase
    const currentPassengerCount = sumPassengersFromAllLines();
    const maxSpawnDelay = 500;
    const minSpawnDelay = 70;
    let spawnDelay = (maxSpawnDelay - currentPassengerCount) * gameSettings.passengerSpawningDelayFactor;
    if (spawnDelay <= 200) {
        spawnDelay = (200 - (currentPassengerCount*0.1)) * gameSettings.passengerSpawningDelayFactor;
    }
    spawnDelay = Math.max(minSpawnDelay, spawnDelay);
    console.log(spawnDelay);
    return spawnDelay;
}

function setDestinationsForStation(station) {
    currentStations.forEach(destinationStation => {
        let stationLines = getStationLines(station);
        for (let index = 0; index < stationLines.length; index++) {
            const currentLineObject = stationLines[index];
            if (currentLineObject['stations'].includes(destinationStation['name'])) {
                if (!(destinationStation['name'] in station['passengers']) && destinationStation['name'] != station['name']) {
                    station['passengers'][destinationStation['name']] = 0;
                }
            }
        }
    });
}

function getStationLines(station) {
    let stationLines = [];
    for (let objectIndex = 0; objectIndex < currentLines.length; objectIndex++) {
        const currentLine = currentLines[objectIndex];
        if (station['line'].includes(currentLine['color'])) {
            stationLines.push(currentLines[objectIndex]);
        }
    }
    return stationLines;
}

function getRandomStationDestination(object) {
    const keys = Object.keys(object);
    return keys[Math.floor(Math.random() * keys.length)];
}

export async function pickUpPassengers(trainId, stationName, lineId) {
    let currentLineObject = await findObjectBySpecificValue(currentLines, 'lineId', lineId);
    let currentStationObject = await findObjectBySpecificValue(currentStations, 'name', stationName);
    let currentTrainObject = await findObjectBySpecificValue(currentTrains, 'trainId', trainId);
    for (const key in currentStationObject['passengers']) {
        if (!(key in currentTrainObject['currentPassengers'])) {
            currentTrainObject['currentPassengers'][key] = 0;
        }
        if (currentLineObject['stations'].includes(key)) {
            const stationAhead = setStationsAhead(currentTrainObject, currentLineObject, currentStationObject, key);
            if (stationAhead) {
                while (currentTrainObject['currentTotalPassengers'] < currentTrainObject['trainCapacity']) {
                    if (currentStationObject['passengers'][key] == 0) {
                        break;
                    }
                    currentTrainObject['currentPassengers'][key]++;
                    currentTrainObject['currentTotalPassengers']++;
                    currentStationObject['passengers'][key]--;
                    currentStationObject['currentTotalPassengers']--;
                }
            }
        }
    }
 }

function setStationsAhead(currentTrainObject, currentLineObject, currentStationObject, station) {
    const movingTrain = document.getElementById(`train-${currentTrainObject.trainId}`);
    const currentStationIndex = currentLineObject.stations.indexOf(currentStationObject.name);
    const stationToPickUpPassengersIndex = currentLineObject.stations.indexOf(station);
    const stationAheadOnOutwardsTrip =  movingTrain.dataset.currentlyDriving === 'out-to-last-station' &&
                                        stationToPickUpPassengersIndex > currentStationIndex;
    const stationAheadInwardsTrip = movingTrain.dataset.currentlyDriving === 'back-to-first-station' &&
                                    stationToPickUpPassengersIndex < currentStationIndex;
    return stationAheadOnOutwardsTrip || stationAheadInwardsTrip;
}

 export async function disembarkPassengers(trainId, stationName, lineId) {
    let currentLineObject = await findObjectBySpecificValue(currentLines, 'lineId', lineId);
    let currentStationObject = await findObjectBySpecificValue(currentStations, 'name', stationName);
    let currentTrainObject = await findObjectBySpecificValue(currentTrains, 'trainId', trainId);
    for (const key in currentTrainObject['currentPassengers']) {
        if (key == currentStationObject['name']) {
            currentBudget['money'] += (currentTrainObject['currentPassengers'][key] * gameSettings['priceForOneRide']);
            currentLineObject['passengers'] += currentTrainObject['currentPassengers'][key]
            currentTrainObject['currentTotalPassengers'] -= currentTrainObject['currentPassengers'][key];
            currentTrainObject['currentPassengers'][key] = 0;
        }
    }
 }

 export function initGameButtons(gameScreen) {
    buyTrainText.addEventListener('click', () => {
        if (currentBudget['money'] >= gameSettings['trainPrice']) {
            let chosenLineId = parseInt(prompt('Which line gets a new train?', 1));
            currentBudget['money'] -= gameSettings['trainPrice'];
            addTrainToLine(chosenLineId, gameScreen);
        }
        else {
            alert('Not enough money');
        }
    })
    setInterval(() => {
        buyTrainText.innerText = 'Buy train ' + gameSettings['trainPrice'];
        if (currentBudget['money'] >= gameSettings['trainPrice']) {
            buyTrainText.classList.add('button-active');
        }
        else {
            buyTrainText.classList.remove('button-active');
        }
    }, 50);
}