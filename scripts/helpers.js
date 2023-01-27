export async function findObjectBySpecificValue (object, keyName, valueToFind){
    for (let objectIndex = 0; objectIndex < object.length; objectIndex++) {
        const currentValue = object[objectIndex];
        if (currentValue[keyName] === valueToFind) {
            return object[objectIndex];
        }
    }
    return null;
}

export function findRealtimeObjectBySpecificValue (object, keyName, valueToFind){
    for (let objectIndex = 0; objectIndex < object.length; objectIndex++) {
        const currentValue = object[objectIndex];
        if (currentValue[keyName] === valueToFind) {
            return object[objectIndex];
        }
    }
}

export async function getLineToBeExpandedFromClickedStations(currentClickedStations, currentLines) {
    let lineToBeExpanded = null;
    currentClickedStations.forEach((station) => {
        currentLines.forEach((line => {
            if (line["stations"].includes(station.dataset.stationName)) {
                lineToBeExpanded = line;
            };
        }));
    });
    return lineToBeExpanded;
}