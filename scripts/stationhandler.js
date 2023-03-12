import { gameSettings } from "./gamescript.js";
import { newLine, currentLines, addStationToLine } from "./lines.js";
import { stationsAllowed } from "./stathandler.js";
import { currentBudget } from "./lines.js";

let currentClickedStations = [];

export function putStationsOnMap(stationPositions, gameScreen) {
    for (const station in stationPositions) {
        const element = stationPositions[station];
        addStationToGameScreen(station, stationPositions[station], gameScreen);
    }

}

function addStationToGameScreen(name, position, gameScreen) {
    let newStation = document.createElement('div');
    newStation.dataset.stationName = name;
    newStation.classList.add('stationsign');
    newStation.id = `station-${name}`;
    newStation.style.top = position[0] + "px";
    newStation.style.left = position[1] + "px";
    gameScreen.append(newStation);
}

function allowUserToCancelStationSelection() {
    let unselectButton = document.getElementById("cancel-selection");
    unselectButton.addEventListener("click", () => {
        for (let index = 0; index < currentClickedStations.length; index++) {
            const station = currentClickedStations[index];
            station.classList.remove('start-station-animation');
            station.classList.remove('chosen-station');
        }
        currentClickedStations = [];
    })
}

export function makeStationsClickable(stations, gameScreen) {
    allowUserToCancelStationSelection();
    for (const station of stations) {
        station.addEventListener("click", () => {
            if (stationsAllowed.includes(station.dataset.stationName)) {
                currentClickedStations[currentClickedStations.length] = event.currentTarget;
                station.classList.add('chosen-station');
                if (currentClickedStations.length >= 2) {
                    let stationHasOtherLinesAlready = checkIfStationHasLineAlready(currentClickedStations);
                    if (!stationHasOtherLinesAlready) {
                        newLine(currentClickedStations, gameScreen);
                        currentClickedStations.forEach(station => {
                            station.classList.remove('start-station-animation');
                            setTimeout(() => {station.classList.remove('chosen-station')}, 2000);
                        });
                    }
                    else {
                        console.log("Has line already")
                        // TODO here: only allow line expansion from last station
                        // If station last in line, allow - else: error
                        allowUserToAddOrExpandLine(gameScreen);
                    }
                    currentClickedStations.forEach(station => {
                        station.classList.remove('start-station-animation');
                        setTimeout(() => {station.classList.remove('chosen-station')}, 2000);
                    });
                    currentClickedStations = [];
                    }
            }
        })
    }
}

function allowUserToAddOrExpandLine(gameScreen) {
    let wantsNewLine = confirm(`Do you want to create a new line?
                        OK: New line (Price: ${gameSettings['newLinePrice']})
                        Cancel: Add station to existing line (Price: ${gameSettings['lineExpansionPrice']})`);

    if (wantsNewLine) {
        if (currentBudget['money'] >= gameSettings['newLinePrice']) {
            currentBudget['money'] -= gameSettings['newLinePrice'];
            newLine(currentClickedStations, gameScreen);
        }
        else {
            alert('Not enough money.');
        }
    }
    else {
        if (currentBudget['money'] >= gameSettings['lineExpansionPrice']) {
            currentBudget['money'] -= gameSettings['lineExpansionPrice'];
            addStationToLine(currentClickedStations, gameScreen);
        }
        else {
            alert('Not enough money.');
        }
    }
}

function checkIfStationHasLineAlready(currentClickedStations) {
    let hasLineAlready = false;
    for (let lineIndex = 0; lineIndex < currentLines.length; lineIndex++) {
        const line = currentLines[lineIndex];
        for (let currentClickedStationsIndex = 0; currentClickedStationsIndex < currentClickedStations.length; currentClickedStationsIndex++) {
            if (line["stations"].includes(currentClickedStations[currentClickedStationsIndex].dataset.stationName)) {
                hasLineAlready = true;
            }
        }
    }
    return hasLineAlready;
}

export function prepareStartStation(startStationName) {
    const startStation = document.getElementById(`station-${startStationName}`);
    startStation.classList.add('allowed-station');
    startStation.classList.add('start-station-animation');
    stationsAllowed.push(startStation.dataset.stationName);
}

export function findNearestStation(stations, startStationName) {
    const startStation = document.getElementById(`station-${startStationName}`);
    const startStationLeftPosition = parseInt(startStation.style.left);
    const startStationTopPosition = parseInt(startStation.style.top);
    const nearestStation = {"name": "",
                            "distance": 9999}
    for (let index = 0; index < stations.length; index++) {
        const station = stations[index];
        let currentStationLeftPosition = parseInt(station.style.left);
        let currentStationTopPosition = parseInt(station.style.top);
        let xDistance = startStationLeftPosition - currentStationLeftPosition;
        let yDistance = startStationTopPosition - currentStationTopPosition;
        xDistance = (xDistance < 0) ? xDistance * (-1) : xDistance;
        yDistance = (yDistance < 0) ? yDistance * (-1) : yDistance;
        let distance = xDistance + yDistance;
        if (distance < nearestStation["distance"] && distance != 0) {
            nearestStation["distance"] = distance;
            nearestStation["name"] = station.dataset.stationName;
        }
    }
    return nearestStation;
}

export function prepareStation(station) {
    const stationToPrepare = document.getElementById(`station-${station["name"]}`);
    stationToPrepare.classList.add('allowed-station');
    stationsAllowed.push(station["name"]);
}

export function markLineStations(stationList) {
    for (let index = 0; index < stationList.length; index++) {
        const stationName = stationList[index][2];
        const stationToMark = document.getElementById(`station-${stationName}`);
        if (index === 0 || index === stationList.length-1) {
            stationToMark.classList.remove('active-station');
            stationToMark.classList.add('start-end-station');
        }
        else {
            stationToMark.classList.remove('allowed-station');
            stationToMark.classList.remove('start-end-station');
            stationToMark.classList.add('active-station');
        }
    }
}