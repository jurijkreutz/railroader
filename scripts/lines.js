import { gameSettings } from './gamescript.js';
import { pickUpPassengers, disembarkPassengers } from './stathandler.js';
import { findObjectBySpecificValue, getLineToBeExpandedFromClickedStations, getAllHtmlTrainObjectsByLineId } from './helpers.js';
import { markLineStations } from './stationhandler.js';

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
    let newLine = document.createElement('div');
    let lineColor = setLineStyle(newLine);
    setLeftMostPositionAsStartingPoint(currentClickedStations, newLine);
    let station1PositionsAndName = [parseFloat(currentClickedStations[0].style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(currentClickedStations[0].style.top)),
                                    currentClickedStations[0].dataset.stationName];
    let station2PositionsAndName = [parseFloat(currentClickedStations[1].style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(currentClickedStations[1].style.top)),
                                    currentClickedStations[1].dataset.stationName];
    let trainStationList = []
    trainStationList.push(station1PositionsAndName);
    trainStationList.push(station2PositionsAndName);
    let distanceBetweenPoints = getDistanceBetweenPoints(station1PositionsAndName, station2PositionsAndName);
    newLine.style.width = distanceBetweenPoints + 'px';
    getAngleBetweenPoints(station1PositionsAndName, station2PositionsAndName, distanceBetweenPoints, newLine);
    saveNewLine(lineColor, currentClickedStations, trainStationList);
    gameScreen.append(newLine);
    letTrainDrive(gameScreen, currentLines.length-1);
}

function drawExpansionOfExistingLine(currentClickedStations, lineColor, gameScreen) {
    let expandedLine = document.createElement('div');
    expandedLine.classList.add('line');
    expandedLine.style.backgroundColor = lineColor;
    expandedLine.style.borderColor = lineColor;
    setLeftMostPositionAsStartingPoint(currentClickedStations, expandedLine);
    let station1PositionsAndName = [parseFloat(currentClickedStations[0].style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(currentClickedStations[0].style.top)),
                                    currentClickedStations[0].dataset.stationName];
    let station2PositionsAndName = [parseFloat(currentClickedStations[1].style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(currentClickedStations[1].style.top)),
                                    currentClickedStations[1].dataset.stationName];
    let trainStationList = []
    trainStationList.push(station1PositionsAndName);
    trainStationList.push(station2PositionsAndName);
    let distanceBetweenPoints = getDistanceBetweenPoints(station1PositionsAndName, station2PositionsAndName);
    expandedLine.style.width = distanceBetweenPoints + 'px';
    getAngleBetweenPoints(station1PositionsAndName, station2PositionsAndName, distanceBetweenPoints, expandedLine);
    gameScreen.append(expandedLine);
    return trainStationList;
}

async function saveNewLine(lineColor, currentClickedStations, trainStationList) {
    markLineStations(trainStationList);
    let lineId = currentLines.length+1;
    let trainObject = {
        'lineId': lineId,
        'lineColor': lineColor,
        'trainId': currentTrains.length+1,
        'trainCapacity': gameSettings.trainStandardCapacity,
        'currentPassengers': {},
        'currentTotalPassengers': 0
    };
    currentTrains.push(trainObject);
    let lineObject = {
        'lineId': lineId,
        'color': lineColor,
        'stations': [currentClickedStations[0].dataset.stationName, currentClickedStations[1].dataset.stationName],
        'stationDetails': trainStationList,
        'trainIds': [trainObject['trainId']],
        'passengers': 0
    };
    currentLines.push(lineObject);
    for (let index = 0; index < currentClickedStations.length; index++) {
        let stationName = currentClickedStations[index].dataset.stationName;
        if (await findObjectBySpecificValue(currentStations, 'name', stationName) == null) {
            let stationObject = {
                'name': currentClickedStations[index].dataset.stationName,
                'line': [lineColor, ],
                'passengers': {},
                'currentTotalPassengers': 0
            }
            currentStations.push(stationObject);
        }
        else {
            let alreadyExistingStation = await findObjectBySpecificValue(currentStations, 'name', stationName);
            alreadyExistingStation['line'].push(lineColor);
        }
    };
}

function setLineStyle(newLine) {
    let usedColors = []
    currentLines.forEach(line => {
        usedColors.push(line['color']);
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
    newLine.style.left = parseInt(newLine.style.left) + 8 + 'px';
    newLine.style.top = parseInt(newLine.style.top) + 8 + 'px';
}

function getDistanceBetweenPoints(positionsXAndYPoint1, positionsXAndYPoint2) {
    let distanceBetweenPoints = Math.sqrt(Math.pow((positionsXAndYPoint2[0] - positionsXAndYPoint1[0]), 2)
                                        + Math.pow((positionsXAndYPoint2[1] - positionsXAndYPoint1[1]), 2));
    return distanceBetweenPoints
}

function getAngleBetweenPoints(positionsXAndYPoint1, positionsXAndYPoint2, distanceBetweenPoints, newLine) {
    let verticalDistance = positionsXAndYPoint2[1] - positionsXAndYPoint1[1]
    let horizontalDistance = positionsXAndYPoint2[0] - positionsXAndYPoint1[0]
    if (verticalDistance > 0) {
        let rotateDegrees = (Math.asin(verticalDistance*Math.sin(90)/distanceBetweenPoints)* 180/Math.PI);
        rotateDegrees = handleAngleEdgeCases(rotateDegrees, distanceBetweenPoints, horizontalDistance);
        newLine.style.transform = 'rotate(-' + rotateDegrees + 'deg)';
    }
    else {
        let rotateDegrees = Math.asin((verticalDistance*(-1))*Math.sin(90)/distanceBetweenPoints)* 180/Math.PI;
        rotateDegrees = handleAngleEdgeCases(rotateDegrees, distanceBetweenPoints, horizontalDistance);
        newLine.style.transform = 'rotate(' + rotateDegrees+5 + 'deg)';
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

function letTrainDrive(gameScreen, lineNum) {
    let lineId = lineNum + 1 
    let newTrain = document.createElement('div');
    newTrain.classList.add('train');
    let newTrainId = currentTrains.length;
    newTrain.id = `train-${newTrainId}`;
    newTrain.style.left = currentLines[lineNum]['stationDetails'][0][0] + 'px';
    newTrain.style.bottom = currentLines[lineNum]['stationDetails'][0][1] + 'px';
    let pickUpSign = document.createElement('div');
    pickUpSign.classList.add('pickup-sign');
    pickUpSign.id = `pickUpSign-${newTrainId}`;
    newTrain.appendChild(pickUpSign);
    gameScreen.append(newTrain);
    newTrain.dataset.startDirection = 'out';
    newTrain.dataset.currentDirection = 0;
    newTrain.dataset.myId = newTrainId;
    newTrain.dataset.lineId = lineId;
    let indexForNextStation = 0
    setInterval(async () => {
        let trainStationList = currentLines[lineNum]['stationDetails'];
            if (newTrain.dataset.startDirection == 'out') {
                newTrain.dataset.startDirection = 'none';
                if (newTrain.dataset.addedStationAtBeginning === 'true') {
                    indexForNextStation++;
                    newTrain.dataset.addedStationAtBeginning = 'false';
                }
                await disembarkPassengers(newTrainId, trainStationList[indexForNextStation][2], lineId);
                await pickUpPassengers(newTrainId, trainStationList[indexForNextStation][2], lineId);
                indexForNextStation++
                newTrain.dataset.currentDirection = parseInt(newTrain.dataset.currentDirection) + 1;
                await sendTrainToPosition(newTrain, trainStationList[parseInt(newTrain.dataset.currentDirection)], trainStationList)
            }
            else if (newTrain.dataset.startDirection == 'in'){
                newTrain.dataset.startDirection = 'none';
                if (newTrain.dataset.addedStationAtBeginning === 'true') {
                    indexForNextStation++;
                    newTrain.dataset.addedStationAtBeginning = 'false';
                }
                await disembarkPassengers(newTrainId, trainStationList[indexForNextStation][2], lineId);
                await pickUpPassengers(newTrainId, trainStationList[indexForNextStation][2], lineId)
                indexForNextStation--
                newTrain.dataset.currentDirection = parseInt(newTrain.dataset.currentDirection) - 1;
                await sendTrainToPosition(newTrain, trainStationList[parseInt(newTrain.dataset.currentDirection)], trainStationList)
            }
    }, 50);
    initializeNextStationSetter(newTrain, lineNum);
}

function initializeNextStationSetter(newTrain, lineNum) {
    newTrain.addEventListener('animationend', () => {
        let trainStationList = currentLines[lineNum]['stationDetails'];
        if (newTrain.dataset.addedStationAtBeginning === 'true') {
            newTrain.dataset.currentDirection = parseInt(newTrain.dataset.currentDirection) + 1
        }
        showPickUpSign(newTrain);
        newTrain.style.left = trainStationList[parseInt(newTrain.dataset.currentDirection)][0] + 'px';
        newTrain.style.bottom = trainStationList[parseInt(newTrain.dataset.currentDirection)][1] + 'px';
        let lineSizeBeforeOnboarding = trainStationList.length;
        setTimeout(function () {
            let lineSizeAfterOnboarding = trainStationList.length;
            if (newTrain.dataset.addedStationAtBeginning === 'true' && lineSizeAfterOnboarding > lineSizeBeforeOnboarding) {
                newTrain.dataset.currentDirection = parseInt(newTrain.dataset.currentDirection) + 1;
            }
            if (newTrain.dataset.currentDirection == 0) {
                newTrain.dataset.currentlyDriving = 'out-to-last-station';
            }
            if (newTrain.dataset.currentDirection >= trainStationList.length - 1 || newTrain.dataset.currentlyDriving == 'back-to-first-station') {
                newTrain.dataset.startDirection = 'in';
                newTrain.dataset.currentlyDriving = 'back-to-first-station';
            }
            else {
                newTrain.dataset.startDirection = 'out';
                newTrain.dataset.currentlyDriving = 'out-to-last-station';
            }
            newTrain.dataset.onboarding = 'false' 
        }, gameSettings.trainTimeAtStation);
    }, false);
}

async function sendTrainToPosition(newTrain, newPositionXandY) {
    newTrain.classList.remove('move-train-to-b');
    newTrain.style['animation'] = '';
    newTrain.offsetWidth;
    newTrain.classList.add('move-train-to-b');
    const oldPositionXandY = [parseInt(newTrain.style.left), parseInt(newTrain.style.bottom)];
    const time = calculateTime(oldPositionXandY, newPositionXandY);
    newTrain.style['animation'] = `train-movement-to-b ${time}s`;
    newTrain.style.setProperty('--my-start-left-pos', newTrain.style.left);
    newTrain.style.setProperty('--my-start-bottom-pos', newTrain.style.bottom);
    newTrain.style.setProperty('--my-end-left-pos', newPositionXandY[0] + 'px');
    newTrain.style.setProperty('--my-end-bottom-pos', newPositionXandY[1] + 'px');
}

function calculateTime(oldPositionXandY, newPositionXandY) {
    const distanceBetweenPoints = getDistanceBetweenPoints(oldPositionXandY, newPositionXandY);
    return distanceBetweenPoints/gameSettings['trainStandardSpeed'];
}

function showPickUpSign(newTrain) {
    let pickUpSign = document.getElementById(`pickUpSign-${newTrain.dataset.myId}`);
    pickUpSign.classList.add('show-pickup-sign');
    setTimeout(function(){pickUpSign.classList.remove('show-pickup-sign')}, gameSettings.trainTimeAtStation);
}

export async function addTrainToLine(lineId, gameScreen) {
    let currentLine = await findObjectBySpecificValue(currentLines, 'lineId', lineId);
    let trainObject = {
        'lineId': lineId,
        'lineColor': currentLine['color'],
        'trainId': currentTrains.length+1,
        'trainCapacity': gameSettings.trainStandardCapacity,
        'currentPassengers': {},
        'currentTotalPassengers': 0
    };
    currentTrains.push(trainObject);
    currentLine['trainIds'].push(trainObject['trainId']);
    let station1 = document.getElementById(`station-${currentLine['stations'][0]}`)
    let station2 = document.getElementById(`station-${currentLine['stations'][1]}`)
    let station1PositionsAndName = [parseFloat(station1.style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(station1.style.top)),
                                    station1.dataset.stationName];
    let station2PositionsAndName = [parseFloat(station2.style.left),
                                    parseFloat(gameSettings['screenHeight']) - (parseFloat(station2.style.top)),
                                    station2.dataset.stationName];
    let trainStationList = []
    trainStationList.push(station1PositionsAndName);
    trainStationList.push(station2PositionsAndName);
    let lineNum = lineId - 1
    letTrainDrive(gameScreen, lineNum);
}

export async function addStationToLine(currentClickedStations, gameScreen) {
    let lineToBeExpanded = await getLineToBeExpandedFromClickedStations(currentClickedStations, currentLines);
    const stationToExpandLineFrom = checkStationToExpandLineFrom(currentClickedStations, lineToBeExpanded);
    if (stationToExpandLineFrom == 'lastStation') {
        currentClickedStations.forEach((station) => {
            if (!lineToBeExpanded['stations'].includes(station.dataset.stationName)) {
                lineToBeExpanded['stations'].push(station.dataset.stationName);
                let stationObject = {
                    'name': station.dataset.stationName,
                    'line': [lineToBeExpanded['color'], ],
                    'passengers': {}
                }
                currentStations.push(stationObject);
            }
        })
        let stationDetailList = drawExpansionOfExistingLine(currentClickedStations, lineToBeExpanded['color'], gameScreen);
        stationDetailList.forEach((station) => {
            if (lineToBeExpanded['stationDetails'].filter((existingStation) => existingStation[2] === station[2]).length === 0) {
                lineToBeExpanded['stationDetails'].push(station);
            }
        })
        markLineStations(lineToBeExpanded['stationDetails']);
    }
    else if (stationToExpandLineFrom == 'firstStation') {
        currentClickedStations.forEach((station) => {
            if (!lineToBeExpanded['stations'].includes(station.dataset.stationName)) {
                lineToBeExpanded['stations'].unshift(station.dataset.stationName);
                let stationObject = {
                    'name': station.dataset.stationName,
                    'line': [lineToBeExpanded['color'], ],
                    'passengers': {}
                }
                currentStations.push(stationObject);
            }
        })
        let stationDetailList = drawExpansionOfExistingLine(currentClickedStations, lineToBeExpanded['color'], gameScreen);
        stationDetailList.forEach((station) => {
            if (lineToBeExpanded['stationDetails'].filter((existingStation) => existingStation[2] === station[2]).length === 0) {
                lineToBeExpanded['stationDetails'].unshift(station);
            }
        })
        markLineStations(lineToBeExpanded['stationDetails']);
        const lineTrains = getAllHtmlTrainObjectsByLineId(lineToBeExpanded['lineId']);
        lineTrains.forEach(train => train.dataset.addedStationAtBeginning = 'true');
    }
    else {
        alert('Expansion only allowed from last or first station!');
    }
}
function checkStationToExpandLineFrom(currentClickedStations, lineToBeExpanded) {
    let stationToExpandLineFrom;
    currentClickedStations.forEach((station) => {
        if (lineToBeExpanded['stations'].includes(station.dataset.stationName)) {
            stationToExpandLineFrom = station.dataset.stationName;
        }
    });
    if (stationToExpandLineFrom === lineToBeExpanded['stations'][lineToBeExpanded['stations'].length - 1]) {
        return 'lastStation';
    }
    else if (stationToExpandLineFrom === lineToBeExpanded['stations'][0]) {
        return 'firstStation';
    }
    return 'otherStation';
}

