const achievementBox = document.getElementById("achievement");
const achievementBoxContent = document.getElementById("achievement-content");
import { currentLines, currentStations, currentTrains, currentBudget } from "./lines.js";

let achievementsAlreadyShown = {
    'firstLine': false,
    'secondLine': false,
    'trainCompletelyFull': false
}

export function checkForUnlockedAchievements() {
    checkForLineNumberAchievements();
    checkForTrainCapacityAchievements();
}

function showAchievementUnlocked(achievementText) {
    setTimeout(() => {
        achievementBoxContent.innerText = achievementText;
        achievementBox.classList.add('show-achievement-box');
        achievementBox.style = 'display: block';
        setTimeout(() => {
            achievementBox.classList.remove('show-achievement-box');
            achievementBox.classList.add('fadeout-achievement-box');
            setTimeout(() => {
                achievementBox.style = 'display: none';
                achievementBox.classList.remove('fadeout-achievement-box');
            }, 500)
        }, 8000);
    }, 1000);
}

/* Achievement List: */

function checkForLineNumberAchievements() {
    if (currentLines.length === 1 && !achievementsAlreadyShown['firstLine']) {
        showAchievementUnlocked('Connected two cities with a train line!')
        achievementsAlreadyShown['firstLine'] = true;
    }
    if (currentLines.length === 2 && !achievementsAlreadyShown['secondLine']) {
        showAchievementUnlocked('Diligent Builder: Second railway line added!')
        achievementsAlreadyShown['secondLine'] = true;
    }
}

function checkForTrainCapacityAchievements() {
    if (!achievementsAlreadyShown['trainCompletelyFull']) {
        currentTrains.forEach(train => {
            if (train["currentTotalPassengers"] === train["trainCapacity"]) {
                showAchievementUnlocked('Crowded situation: First time that a train is completely full!');
                achievementsAlreadyShown['trainCompletelyFull'] = true;
            }
        });
    }
}