import { initStatisticUpdate, initPassengerHandling, initGameButtons, initStationUpdate } from "./stathandler.js";
import { putStationsOnMap,
         makeStationsClickable,
         prepareStartStation,
         findNearestStation,
         prepareStation } from "./stationhandler.js";

const gameScreen = document.getElementById("gamescreen");
export const gameSettings = {'screenHeight': window.getComputedStyle(gameScreen).height,
                             'startingStation': 'linz',
                             'trainStandardCapacity': 200,
                             'priceForOneRide': 7,
                             'trainPrice': 800,
                             'trainTimeAtStation': 2000}; // default: 1000

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

startGame();

// TO-DOs:
// - Allow lines to have more than 2 stations X
// - Randomize Interval of Spawning Passengers
// - Only pick up passengers if station is ahead
// - Fix wrong train driving behaviour X