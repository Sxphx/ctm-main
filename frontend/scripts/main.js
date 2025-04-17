// const { log } = require("winston");
src = "building.js";
function checkForValidMoves() {
  if (water <= 0 && energy <= 0 && food <= 0) {
    return false;
  }

  const canInvestWater = money >= 20 * (1 - checkAutomation());
  const canBuildEnergy = money >= 25 * (1 - checkAutomation()) && water >= 15;
  const canHarvestFood = water >= 20 && energy >= 15;
  const canExpandCity = money >= 50 * (1 - checkAutomation());

  if (water <= 0 || energy <= 0 || food <= 0) {
    return false;
  }

  if (!canInvestWater && !canBuildEnergy && !canHarvestFood && !canExpandCity) {
    if (water < 10 && energy < 10 && food < 10 && money < 20) {
      return false;
    }
  }

  return true;
}

function makeTable() {
  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  for (let i = 0; i < 3; i++) {
    const tr = document.createElement("tr");

    for (let j = 0; j < 3; j++) {
      const td = document.createElement("td");
      td.className = "city";
      td.id = `cell-${i}-${j}`;

      if (i === 2 && (j === 0 || j === 2)) continue;

      const imgtd = document.createElement("img");
      imgtd.src = `img/useBuilding/${i}-${j}.png`;
      imgtd.className = "city";
      imgtd.width = "city";
      imgtd.id = `img-cell-${i}-${j}`;

      const btntd = document.createElement("button");
      btntd.className = "btn city-btn";
      btntd.type = "button";
      btntd.id = `btn-cell-${i}-${j}`;
      btntd.textContent = "Not Built";
      
      const nameP = document.createElement("p");
      nameP.id = `p-cell-${i}-${j}`;
      nameP.textContent = getBuildingName(i, j);
      nameP.style.margin = "5px 0 0 0";
      nameP.style.color = "black";
      nameP.style.fontWeight = "bold";

      td.appendChild(imgtd);
      td.appendChild(btntd);
      td.appendChild(nameP);

      td.style.position = "relative";
      btntd.style.position = "absolute";
      btntd.style.top = "50%";
      btntd.style.left = "50%";
      btntd.style.transform = "translate(-50%, -50%)";
      btntd.style.zIndex = "1";
      btntd.style.color = "black";
      btntd.style.fontSize = "2rem";
      td.style.filter = "brightness(0.5)";

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  const container = document.getElementById("table-container");
  container.appendChild(table);
}

function getBuildingName(i, j) {
  const cellId = `${i}-${j}`;
  const building = buildingsList.find((b) => b.cell === cellId);
  return building ? building.name : "";
}

makeTable();

function checkResourceShortages() {
  let criticalShortages = 0;

  if (water <= 0) {
    water = 0;
    happiness -= 10;
    criticalShortages++;
    showAlert(
      "warning",
      "Water Shortage",
      "Your city is experiencing a water shortage! Happiness is decreasing rapidly."
    );
  }

  if (energy <= 0) {
    energy = 0;
    happiness -= 8;
    criticalShortages++;
    showAlert(
      "warning",
      "Energy Shortage",
      "Your city is experiencing power outages! Happiness is decreasing."
    );
  }

  if (food <= 0) {
    food = 0;
    happiness -= 15;
    population = Math.max(0, population - 5);
    criticalShortages++;
    showAlert(
      "warning",
      "Food Shortage",
      "Your city is experiencing a food shortage! Population is decreasing and happiness is plummeting."
    );
  }

  if (criticalShortages >= 3 || happiness <= 0 || population <= 0) {
    gameOver();
    return false;
  }

  return true;
}

function gameOver() {
  let gameOverReason = "";

  if (happiness <= 0) {
    gameOverReason = "Your citizens are extremely unhappy and have revolted!";
  } else if (population <= 0) {
    gameOverReason =
      "Your city has been abandoned due to poor living conditions!";
  } else if (water <= 0 && energy <= 0 && food <= 0) {
    gameOverReason = "Your city has run out of all critical resources!";
  } else {
    gameOverReason =
      "You've run out of resources and have no valid moves left!";
  }

  document.getElementById("final-score").textContent = Math.floor(score);
  document.getElementById("game-over-reason").textContent = gameOverReason;

  const gameOverModal = new bootstrap.Modal(
    document.getElementById("gameOverModal")
  );
  gameOverModal.show();

  const actionButtons = document.querySelectorAll("#bottom-menu button");
  actionButtons.forEach((button) => {
    if (!button.getAttribute("data-bs-toggle")) {
      button.disabled = true;
    }
  });

  console.log("Game Over! Final Score: " + Math.floor(score));
  showAlert("error", "Game Over", gameOverReason);
  console.log(water, energy, food, population, money, happiness);
}

function makeDecision(decision) {
  console.log(`Making decision: ${decision}`);

  let waterMultiplier = 1 + cityExpansion * 0.05;
  let energyMultiplier = 1 + cityExpansion * 0.05;
  let foodMultiplier = 1 + cityExpansion * 0.05;
  let reduceExpandCost = 1 + cityExpansion * 0.05;

  if (!checkForValidMoves()) {
    showAlert(
      "error",
      "No Valid Moves",
      "You have no valid moves left and insufficient resources to recover!"
    );
    gameOver();
    return;
  }

  switch (decision) {
    case "investWater":
      const waterCost = 20 * (1 - checkAutomation());
      if (money < waterCost) {
        showAlert(
          "error",
          "Not enough money",
          `You need ${Math.ceil(
            waterCost
          )} money to invest in water infrastructure.`
        );
        return;
      }
      waterGet = 25 * (1 + checkWater()) * waterMultiplier;
      water += waterGet;
      money -= waterCost;
      logAction(
        `💧 Water Infrastructure Investment\n- Gained ${Math.floor(
          waterGet
        )} water\n- Cost: ${Math.ceil(waterCost)} money`
      );
      showAlert(
        "success",
        "Water Infrastructure Improved",
        `Water supply has increased by ${Math.floor(waterGet)}.`
      );
      break;

    case "buildEnergy":
      const energyCost = 25 * (1 - checkAutomation());
      if (water < 15 || money < energyCost) {
        showAlert(
          "error",
          "Insufficient resources",
          `You need 15 water and ${Math.ceil(
            energyCost
          )} money to build a power plant.`
        );
        return;
      }
      energyGet = 30 * (1 + checkSolar()) * energyMultiplier;
      energy += energyGet;
      water -= 15;
      money -= energyCost;
      logAction(
        `⚡ Power Plant Construction\n- Gained ${Math.floor(
          energyGet
        )} energy\n- Cost: ${Math.ceil(energyCost)} money, 15 water`
      );
      showAlert(
        "success",
        "Power Plant Built",
        `Energy production has increased by ${Math.floor(energyGet)}.`
      );
      break;

    case "harvestFood":
      if (water < 20 || energy < 15) {
        showAlert(
          "error",
          "Insufficient resources",
          "You need 20 water and 15 energy to harvest food."
        );
        return;
      }
      water -= 20;
      energy -= 15;
      foodGet = 35 * (1 + checkFarm()) * foodMultiplier;
      food += foodGet;
      logAction(
        `🌾 Food Harvesting\n- Gained ${Math.floor(
          foodGet
        )} food\n- Cost: 20 water, 15 energy`
      );
      showAlert(
        "success",
        "Food Harvested",
        `Food production has increased by ${Math.floor(foodGet)}.`
      );
      break;

    case "expandCity":
      const expansionCost = 50 * (1 - checkAutomation()) * reduceExpandCost;
      if (money < expansionCost) {
        showAlert(
          "error",
          "Not enough money",
          `You need ${Math.ceil(expansionCost)} money to expand the city.`
        );
        return;
      }
      cityExpansion += 1;
      population += 15;
      const happinessBoost = 15 * (1 + checkTransport());
      happiness += happinessBoost;
      money -= expansionCost;
      logAction(
        `🏙️ City Expansion\n- Population +15, Happiness +${Math.floor(
          happinessBoost
        )}\n- Cost: ${Math.ceil(expansionCost)} money`
      );
      showAlert(
        "success",
        "City Expansion",
        `Population and happiness have increased by ${Math.floor(
          happinessBoost
        )}.`
      );
      break;
  }

  // Resource consumption
  const baseConsumption = 5;
  const populationFactor = 1 + population / 100;

  const energyConsumed = baseConsumption + 5 * populationFactor;
  const foodConsumed = baseConsumption * populationFactor;
  const waterConsumed = baseConsumption * populationFactor;
  let happinessConsumed = 2;

  if (food < 75) {
    happinessConsumed = baseConsumption * populationFactor;
  }

  energy -= energyConsumed;
  food -= foodConsumed;
  water -= waterConsumed;
  happiness -= happinessConsumed;

  logAction(
    `🔻 Resource Consumption\n- Energy: ${Math.ceil(
      energyConsumed
    )}\n- Food: ${Math.ceil(foodConsumed)}\n- Water: ${Math.ceil(
      waterConsumed
    )}\n- Happiness: ${Math.ceil(happinessConsumed)}`
  );

  console.log(
    `Consumption - Energy: ${energyConsumed}, Food: ${foodConsumed}, Water: ${waterConsumed}, Happiness: ${happinessConsumed}`
  );

  checkResourceShortages();
  if (!checkForValidMoves()) {
    showAlert(
      "error",
      "No Valid Moves",
      "You have no valid moves left and insufficient resources to recover!"
    );
    gameOver();
    return;
  }

  researchPointsEarn();
  generateIncome();
  randomEvent();
  action++;
  updateStats();
}

function checkResourceShortages() {
  if (water <= 0) {
    water = 0;
    happiness -= 10;
    showAlert(
      "warning",
      "Water Shortage",
      "Your city is experiencing a water shortage! Happiness is decreasing rapidly."
    );
  }

  if (energy <= 0) {
    energy = 0;
    happiness -= 8;
    showAlert(
      "warning",
      "Energy Shortage",
      "Your city is experiencing power outages! Happiness is decreasing."
    );
  }

  if (food <= 0) {
    food = 0;
    happiness -= 15;
    population = Math.max(0, population - 5);
    showAlert(
      "warning",
      "Food Shortage",
      "Your city is experiencing a food shortage! Population is decreasing and happiness is plummeting."
    );
  }

  if (happiness <= 0 || population <= 0) {
    gameOver();
  }
}

function generateIncome() {
  const baseIncome = 5;
  const populationFactor = population / 50;
  const happinessFactor = happiness / 50;

  money += baseIncome * populationFactor * happinessFactor;
}

function checkWater() {
  const waterTech = researchList.find((r) => r.id === "waterPurification");
  return waterTech && waterTech.owned ? 0.2 : 0;
}

function checkSolar() {
  const solarTech = researchList.find((r) => r.id === "solarPanels");
  return solarTech && solarTech.owned ? 0.15 : 0;
}

function checkFarm() {
  const farmTech = researchList.find((r) => r.id === "Farm");
  return farmTech && farmTech.owned ? 0.2 : 0;
}

function checkTransport() {
  const transportTech = researchList.find((r) => r.id === "publicTransport");
  return transportTech && transportTech.owned ? 0.25 : 0;
}

function checkAutomation() {
  const autoTech = researchList.find((r) => r.id === "automation");
  return autoTech && autoTech.owned ? 0.15 : 0;
}
