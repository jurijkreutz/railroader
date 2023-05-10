// Start Script
// contains game settings, stations, start & stop functions

import { initStatisticUpdate, initPassengerHandling, initGameButtons } from './stathandler.js';
import { initStationUpdate } from './stationhandler.js';
import { putStationsOnMap,
         makeStationsClickable,
         prepareStartStation,
         findNearestStation,
         prepareStation } from './stationhandler.js';

const gameScreen = document.getElementById('gamescreen');
const startScreen = document.getElementById('startscreen');

export const gameSettings = {'version': 0.1,
                             'screenHeight': window.getComputedStyle(gameScreen).height,
                             'startingStation': 'linz',
                             'passengerSpawningDelayFactor': 1, // the higher, the slower (should be between 1 & 2)
                             'timeBetweenStationSpawn': 50, // default: 50
                             'maxWaitTimeForConnection': 35,
                             'maxPeopleAtStation': 50, // default: 50
                             'trainStandardCapacity': 40,
                             'trainStandardSpeed': 35,
                             'priceForOneRide': 7,
                             'trainPrice': 800,
                             'trainTimeAtStation': 2000, // default: 1000
                             'lineExpansionPrice': 0, // default: 3000
                             'newLinePrice': 0}; // default 6000

let stationPositions = {'vienna': [110, 700],
                        'graz': [290, 605],
                        'klagenfurt': [345, 490],
                        'stpoelten': [105, 630],
                        'linz': [100, 480],
                        'salzburg': [180, 365],
                        'lienz': [310, 300],
                        'innsbruck': [260,180],
                        'bregenz': [245,20]}

function startGame() {
    putStationsOnMap(stationPositions, gameScreen);
    initPassengerHandling();
    initStatisticUpdate();
    initGameButtons(gameScreen);
    const stations = document.getElementsByClassName('stationsign');
    initStationUpdate(stations);
    makeStationsClickable(stations, gameScreen);
    prepareStartStation(gameSettings.startingStation);
    let nearestStation = findNearestStation(stations, gameSettings.startingStation)
    prepareStation(nearestStation);
    console.log(`Your first station is ${gameSettings.startingStation.toUpperCase()}.`);
    console.log(`The first destination of your passengers is ${nearestStation['name'].toUpperCase()}.`);
}

// Debug Mode

// startScreen.style = 'display: none';
// startGame();

// Normal Mode with Start Screen

function showStartScreen() {
    const version = document.getElementById('version');
    version.innerText = 'Version ' + gameSettings.version;
    const clickableButton = document.getElementById('clickable-button');
    clickableButton.addEventListener('click', () => {
        startGame();
        startScreen.style = 'display: none';
    })
}

showStartScreen();

export function stopGame(reason) {
    const trains = document.getElementsByClassName('train');
    while(trains.length > 0){
        trains[0].parentNode.removeChild(trains[0]);
    }
    startScreen.style = 'display: fixed';
    startScreen.style = 'background-blend-mode: multiply'
    const startButton = document.getElementById('button');
    startButton.style = 'display: none';
    const version = document.getElementById('version');
    version.style = 'text-shadow: 1px 1px 1px BLACK';
    version.innerHTML = `<br>You lost!<br>${reason}`;
    setTimeout(() => {
        window.location.reload();
    }, 9000);
}

// TO-DOs:
// - - - Very important - - -
// - Randomize Interval of Spawning Passengers (general improvement, gradual upwards trend in spawning speed)
//   -> maybe different speeds, gradually getting more?
// - Set prizes for line adding and line expansion
// - Refactor
// - - - The rest - - -
// - Add Story & Freestyle Mode
// - Add Game Events: Track Breakdowns (?)
// - Add more Achievements, Achievement Overview
// - Add check if two lines have the same ending station and user tries to expand a line from there
// - Add Music