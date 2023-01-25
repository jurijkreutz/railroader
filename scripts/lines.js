import { gameSettings } from "./gamescript.js";
import { pickUpPassengers, disembarkPassengers } from "./stathandler.js";
import { findObjectBySpecificValue } from "./helpers.js";

const lineColors = ['#e58871',
                    '#d0c64c',
                    '#60b1ac',
                    '#6e557e',
                    '#6e669e']

export let currentLines = [];
export let currentStations = [];
export let currentTrains = [];
export let currentBudget = {'money': 0};


export function newLine(currentClickedStations, gameScreen) {
    let newLine = document.createElement("div");
    let lineColor = setLineStyle(newLine);
    setLeftMostPositionAsStartingPoint(currentClickedStations, newLine);
    let station1PositionsAndName = [parseFloat(currentClickedStations[0].style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(currentClickedStations[0].style.top)),
                                    currentClickedStations[0].dataset.stationName];
    let station2PositionsAndName = [parseFloat(currentClickedStations[1].style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(currentClickedStations[1].style.top)),
                                    currentClickedStations[1].dataset.stationName];
    let distanceBetweenPoints = getDistanceBetweenPoints(station1PositionsAndName, station2PositionsAndName, newLine);
    getAngleBetweenPoints(station1PositionsAndName, station2PositionsAndName, distanceBetweenPoints, newLine);
    saveNewLine(lineColor, currentClickedStations);
    gameScreen.append(newLine);
    letTrainDrive(gameScreen, station1PositionsAndName, station2PositionsAndName, currentLines.length);
}

async function saveNewLine(lineColor, currentClickedStations) {
    let trainObject = {
        "lineId": currentLines.length+1,
        "trainId": currentTrains.length+1,
        "trainCapacity": gameSettings.trainStandardCapacity,
        "currentPassengers": {},
        "currentTotalPassengers": 0
    };
    currentTrains.push(trainObject);
    let lineObject = {
        "lineId": currentLines.length+1,
        "color": lineColor,
        "stations": [currentClickedStations[0].dataset.stationName, currentClickedStations[1].dataset.stationName],
        "trainIds": [trainObject["trainId"]],
        "passengers": 0
    };
    currentLines.push(lineObject);
    for (let index = 0; index < currentClickedStations.length; index++) {
        let stationName = currentClickedStations[index].dataset.stationName;
        if (await findObjectBySpecificValue(currentStations, "name", stationName) == null) {
            let stationObject = {
                "name": currentClickedStations[index].dataset.stationName,
                "line": [lineColor, ],
                "passengers": {}
            }
            currentStations.push(stationObject);
            console.log(stationObject)
        }
        else {
            let alreadyExistingStation = await findObjectBySpecificValue(currentStations, "name", stationName);
            alreadyExistingStation["line"].push(lineColor);
        }
    }
}

function setLineStyle(newLine) {
    let usedColors = []
    currentLines.forEach(line => {
        usedColors.push(line["color"]);
    });
    let lineColor = lineColors[Math.floor(Math.random() * lineColors.length)];
    while (usedColors.includes(lineColor)) {
        lineColor = lineColors[Math.floor(Math.random() * lineColors.length)];
    }
    newLine.classList.add('line');
    newLine.style.backgroundColor = lineColor;
    newLine.style.borderColor = lineColor;
    return lineColor;
}


function setLeftMostPositionAsStartingPoint(currentClickedStations, newLine) {
    if (parseInt(currentClickedStations[0].style.left) <= parseInt(currentClickedStations[1].style.left)) {
        newLine.style.left = currentClickedStations[0].style.left;
        newLine.style.top = currentClickedStations[0].style.top;
    }
    else {
        newLine.style.left = currentClickedStations[1].style.left;
        newLine.style.top = currentClickedStations[1].style.top;
        let stationOne = currentClickedStations[0]
        let stationTwo = currentClickedStations[1]
        currentClickedStations[0] = stationTwo;
        currentClickedStations[1] = stationOne;
    }
    newLine.style.left = parseInt(newLine.style.left) + 8 + "px";
    newLine.style.top = parseInt(newLine.style.top) + 8 + "px";
}

function getDistanceBetweenPoints(positionsXAndYPoint1, positionsXAndYPoint2, newLine) {
    let distanceBetweenPoints = Math.sqrt(Math.pow((positionsXAndYPoint2[0] - positionsXAndYPoint1[0]), 2)
                                        + Math.pow((positionsXAndYPoint2[1] - positionsXAndYPoint1[1]), 2));
    newLine.style.width = distanceBetweenPoints + "px";
    return distanceBetweenPoints
}

function getAngleBetweenPoints(positionsXAndYPoint1, positionsXAndYPoint2, distanceBetweenPoints, newLine) {
    let verticalDistance = positionsXAndYPoint2[1] - positionsXAndYPoint1[1]
    let horizontalDistance = positionsXAndYPoint2[0] - positionsXAndYPoint1[0]
    if (verticalDistance > 0) {
        let rotateDegrees = (Math.asin(verticalDistance*Math.sin(90)/distanceBetweenPoints)* 180/Math.PI);
        rotateDegrees = handleAngleEdgeCases(rotateDegrees, distanceBetweenPoints, horizontalDistance);
        newLine.style.transform = "rotate(-" + rotateDegrees + "deg)";
    }
    else {
        let rotateDegrees = Math.asin((verticalDistance*(-1))*Math.sin(90)/distanceBetweenPoints)* 180/Math.PI;
        rotateDegrees = handleAngleEdgeCases(rotateDegrees, distanceBetweenPoints, horizontalDistance);
        newLine.style.transform = "rotate(" + rotateDegrees+5 + "deg)";
    }
}

function handleAngleEdgeCases(rotateDegrees, distanceBetweenPoints, horizontalDistance) {
    rotateDegrees = (distanceBetweenPoints > 210) ? rotateDegrees + (0.14 * rotateDegrees) : rotateDegrees + (0.17 * rotateDegrees);
    if (horizontalDistance <= 10) {
        rotateDegrees += (0.19 * rotateDegrees);
    }
    else if (horizontalDistance < 30) {
        rotateDegrees += (0.09 * rotateDegrees);
    }
    return rotateDegrees;
}

function letTrainDrive(gameScreen, station1PositionsAndName, station2PositionsAndName, lineId) {
    let newTrain = document.createElement('div');
    newTrain.classList.add('train');
    let newTrainId = currentTrains.length;
    newTrain.id = `train-${newTrainId}`;
    newTrain.style.left = station1PositionsAndName[0] + "px";
    newTrain.style.bottom = station1PositionsAndName[1] + "px";
    gameScreen.append(newTrain);
    newTrain.dataset.startDirection = "B";
    setInterval(async () => {
        if (newTrain.dataset.startDirection == "B") {
            newTrain.dataset.startDirection = "none";
            await disembarkPassengers(newTrainId, station1PositionsAndName[2], lineId);
            await pickUpPassengers(newTrainId, station1PositionsAndName[2], lineId);
            newTrain.dataset.currentDirection = "B";
            sendTrainToPosition(newTrain, station2PositionsAndName)
        }
        else if (newTrain.dataset.startDirection == "A"){
            newTrain.dataset.startDirection = "none";
            await disembarkPassengers(newTrainId, station2PositionsAndName[2], lineId);
            await pickUpPassengers(newTrainId, station2PositionsAndName[2], lineId)
            newTrain.dataset.currentDirection = "A";
            sendTrainToPosition(newTrain, station1PositionsAndName)
        }
    }, 0);
}

function sendTrainToPosition(newTrain, newPositionXandY) {
    newTrain.classList.remove('move-train-to-b');
    newTrain.offsetWidth;
    newTrain.classList.add('move-train-to-b');
    newTrain.style.setProperty('--my-start-left-pos', newTrain.style.left);
    newTrain.style.setProperty('--my-start-bottom-pos', newTrain.style.bottom);
    newTrain.style.setProperty('--my-end-left-pos', newPositionXandY[0] + "px");
    newTrain.style.setProperty('--my-end-bottom-pos', newPositionXandY[1] + "px");
    newTrain.addEventListener("animationend", () => {
        newTrain.style.left = newPositionXandY[0] + "px";
        newTrain.style.bottom = newPositionXandY[1] + "px";
        newTrain.dataset.startDirection = (newTrain.dataset.currentDirection == "B") ? "A" : "B";
    }, false);
}


export async function addTrainToLine(lineId, gameScreen) {
    let currentLine = await findObjectBySpecificValue(currentLines, "lineId", lineId);
    let trainObject = {
        "lineId": lineId,
        "trainId": currentTrains.length+1,
        "trainCapacity": gameSettings.trainStandardCapacity,
        "currentPassengers": {},
        "currentTotalPassengers": 0
    };
    currentTrains.push(trainObject);
    currentLine["trainIds"].push(trainObject["trainId"]);
    let station1 = document.getElementById(`station-${currentLine["stations"][0]}`)
    let station2 = document.getElementById(`station-${currentLine["stations"][1]}`)
    let station1PositionsAndName = [parseFloat(station1.style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(station1.style.top)),
                                    station1.dataset.stationName];
    let station2PositionsAndName = [parseFloat(station2.style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(station2.style.top)),
                                    station2.dataset.stationName];
    letTrainDrive(gameScreen, station1PositionsAndName, station2PositionsAndName, lineId);
}