import { initStatisticUpdate, initPassengerHandling, initGameButtons, initStationUpdate } from "./stathandler.js";
import { putStationsOnMap,
         makeStationsClickable,
         prepareStartStation,
         findNearestStation,
         prepareStation } from "./stationhandler.js";

const gameScreen = document.getElementById("gamescreen");
const startScreen = document.getElementById("startscreen");

export const gameSettings = {'version': 0.1,
                             'screenHeight': window.getComputedStyle(gameScreen).height,
                             'startingStation': 'linz',
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
    console.log(`The first destination of your passengers is ${nearestStation["name"].toUpperCase()}.`);
}

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

// TO-DOs:
// - Randomize Interval of Spawning Passengers
// - Add Loosing Condition? (If more than ... players at a station: lost)
// - Add Game Events: Achievements (?)