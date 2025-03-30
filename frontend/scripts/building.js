let buildingsList = [
  {
    name: "City Hall",
    id: "cityHall",
    level: 1,
    levelMax: 5,
    owned: false,
    cost: (level) => ({
      money: 50 * level,
      energy: 10 * level,
      water: 0,
      food: 0,
      happiness: 0,
    }),
    effects: { happiness: 5 },
    description: "Increases happiness by 5 per action",
  },
  {
    name: "Water Treatment",
    id: "waterTreatment",
    level: 1,
    levelMax: 5,
    owned: false,
    cost: (level) => ({
      money: 35 * level,
      energy: 5 * level,
      water: 0,
      food: 0,
      happiness: 0,
    }),
    effects: { water: 4 },
    description: "Produces 4 water per action",
  },
  {
    name: "Power Plant",
    id: "powerPlant",
    level: 1,
    levelMax: 5,
    owned: false,
    cost: (level) => ({
      money: 40 * level,
      water: 15 * level,
      energy: 0,
      food: 0,
      happiness: 0,
    }),
    effects: { energy: 6 },
    description: "Produces 6 energy per action",
  },
  {
    name: "Farm",
    id: "farm",
    level: 1,
    levelMax: 5,
    owned: false,
    cost: (level) => ({
      money: 30 * level,
      water: 20 * level,
      energy: 10 * level,
      food: 0,
      happiness: 0,
    }),
    effects: { food: 5 },
    description: "Produces 5 food per action",
  },
  {
    name: "Park",
    id: "park",
    level: 1,
    levelMax: 5,
    owned: false,
    cost: (level) => ({
      money: 25 * level,
      water: 10 * level,
      energy: 0,
      food: 0,
      happiness: 0,
    }),
    effects: { happiness: 2 },
    description: "Increases happiness by 2 per action",
  },
  {
    name: "Market",
    id: "market",
    level: 1,
    levelMax: 5,
    owned: false,
    cost: (level) => ({
      money: 45 * level,
      water: 0,
      energy: 10 * level,
      food: 5 * level,
      happiness: 0,
    }),
    effects: { money: 2, happiness: 1 },
    description: "Generates 2 money and 1 happiness per action",
  },
  {
    name: "University",
    id: "university",
    level: 1,
    levelMax: 5,
    owned: false,
    cost: (level) => ({
      money: 100 * level,
      energy: 20 * level,
      water: 0,
      food: 0,
      happiness: 0,
    }),
    effects: { researchPoint: 2 },
    description: "Increases research point by 2 per action",
  },
];

function buildingListUI() {
  const buildingListElement = document.getElementById("building-list");
  if (!buildingListElement) return;

  buildingListElement.innerHTML = "";

  const rowDiv = document.createElement("div");
  rowDiv.className = "row g-3";

  for (const building of buildingsList) {
    const colDiv = document.createElement("div");
    colDiv.className = "col-md-6";

    const cardDiv = document.createElement("div");
    cardDiv.className = "card h-100";

    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body";

    cardBodyDiv.innerHTML = `
        <h5 class="card-title">${building.name} (<span id="level-${
      building.id
    }">Level ${building.owned ? building.level : "0"}</span>)</h5>
        <p class="card-text">${building.description}</p>
        <div class="d-grid gap-2">
            <p id="cost-${building.id}">
              Cost: ${Object.entries(building.cost(building.level + 1))
                .map(([resource, amount]) =>
                  amount > 0 ? `${amount} ${resource}` : ""
                )
                .filter(Boolean)
                .join(", ")}
            </p>
            <button class="btn btn-primary" id="building-${
              building.id
            }" onclick="buildingBuy('${building.id}')">
                Build Level ${building.level}
            </button>
            <button class="btn btn-success" id="building-${
              building.id
            }-Owned" style="display: none;">
                Built
            </button>
            <button class="btn btn-warning" id="buildingUpgrade-${
              building.id
            }-Upgrade" style="display: none;" onclick="upgradeBuilding('${
      building.id
    }')">
                Upgrade to Level ${building.level + 1}
            </button>
        </div>
      `;

    cardDiv.appendChild(cardBodyDiv);
    colDiv.appendChild(cardDiv);
    rowDiv.appendChild(colDiv);
  }

  buildingListElement.appendChild(rowDiv);
}

function buildingBuy(buildingId) {
  const building = buildingsList.find((b) => b.id === buildingId);
  const cityHall = buildingsList.find((b) => b.id === "cityHall");

  if (!cityHall.owned && building.id !== "cityHall") {
    showAlert("error", "Building Failed", "You must build a City Hall first.");
    return;
  }

  if (building.level > cityHall.level) {
    showAlert(
      "error",
      "Building Failed",
      `City Hall needs to be level ${building.level} to build this.`
    );
    return;
  }

  if (availableSpace <= 0) {
    showAlert(
      "error",
      "Building Failed",
      "No more space available for buildings."
    );
    return;
  }

  let enoughResources = true;
  for (const [resource, amount] of Object.entries(
    building.cost(building.level + 1)
  )) {
    if (resource === "money" && money < amount) {
      enoughResources = false;
      showAlert(
        "error",
        "Not Enough Money",
        `You need ${amount} money to purchase the ${building.name}.`
      );
      break;
    }
    if (resource === "water" && water < amount) {
      enoughResources = false;
      showAlert(
        "error",
        "Not Enough Water",
        `You need ${amount} water to purchase the ${building.name}.`
      );
      break;
    }
    if (resource === "energy" && energy < amount) {
      enoughResources = false;
      showAlert(
        "error",
        "Not Enough Energy",
        `You need ${amount} energy to purchase the ${building.name}.`
      );
      break;
    }
    if (resource === "food" && food < amount) {
      enoughResources = false;
      showAlert(
        "error",
        "Not Enough Food",
        `You need ${amount} food to purchase the ${building.name}.`
      );
      break;
    }
    if (resource === "happiness" && happiness < amount) {
      enoughResources = false;
      showAlert(
        "error",
        "Not Enough Happiness",
        `You need ${amount} happiness to purchase the ${building.name}.`
      );
      break;
    }
  }

  if (enoughResources) {
    for (const [resource, amount] of Object.entries(
      building.cost(building.level + 1)
    )) {
      if (resource === "money") money -= amount;
      if (resource === "water") water -= amount;
      if (resource === "energy") energy -= amount;
      if (resource === "food") food -= amount;
      if (resource === "happiness") happiness -= amount;
    }

    building.owned = true;
    availableSpace -= 1;
    showAlert(
      "success",
      "Building Purchased",
      `You have successfully purchased the ${building.name}.`
    );
    updateStats();
    updateBuildingUI(buildingId);
  }
}

function upgradeBuilding(buildingId) {
  const building = buildingsList.find((b) => b.id === buildingId);
  const currentCityHallLevel = buildingsList.find(
    (b) => b.id === "cityHall"
  ).level;

  if (building.level >= currentCityHallLevel && building.id !== "cityHall") {
    showAlert(
      "error",
      "Building Failed",
      `City Hall needs to be level ${building.level} to upgrade this.`
    );
    return;
  }

  if (building.level < building.levelMax) {
    let enoughResources = true;
    const cost = building.cost(building.level + 1);

    for (const [resource, amount] of Object.entries(cost)) {
      if (resource === "money" && money < amount) {
        enoughResources = false;
        showAlert(
          "error",
          "Not Enough Money",
          `You need ${amount} money to upgrade the ${building.name}.`
        );
        break;
      }
      if (resource === "water" && water < amount) {
        enoughResources = false;
        showAlert(
          "error",
          "Not Enough Water",
          `You need ${amount} water to upgrade the ${building.name}.`
        );
        break;
      }
      if (resource === "energy" && energy < amount) {
        enoughResources = false;
        showAlert(
          "error",
          "Not Enough Energy",
          `You need ${amount} energy to upgrade the ${building.name}.`
        );
        break;
      }
      if (resource === "food" && food < amount) {
        enoughResources = false;
        showAlert(
          "error",
          "Not Enough Food",
          `You need ${amount} food to upgrade the ${building.name}.`
        );
        break;
      }
      if (resource === "happiness" && happiness < amount) {
        enoughResources = false;
        showAlert(
          "error",
          "Not Enough Happiness",
          `You need ${amount} happiness to upgrade the ${building.name}.`
        );
        break;
      }
    }

    if (enoughResources) {
      for (const [resource, amount] of Object.entries(
        building.cost(building.level + 1)
      )) {
        if (resource === "money") money -= amount;
        if (resource === "water") water -= amount;
        if (resource === "energy") energy -= amount;
        if (resource === "food") food -= amount;
        if (resource === "happiness") happiness -= amount;
      }

      building.level += 1;
      showAlert(
        "success",
        "Building Upgraded",
        `You have successfully upgraded ${building.name} to Level ${building.level}.`
      );
      updateStats();
      updateBuildingUI(buildingId);
    }
  }
}

function updateBuildingUI(buildingId) {
  const building = buildingsList.find((b) => b.id === buildingId);

  const buildingElement = document.getElementById(`building-${building.id}`);
  const buildingOwnedElement = document.getElementById(
    `building-${building.id}-Owned`
  );
  const buildingUpgradeElement = document.getElementById(
    `buildingUpgrade-${building.id}-Upgrade`
  );
  const buildingLevelSpan = document.getElementById(`level-${building.id}`);

  buildingLevelSpan.textContent = `Level ${building.level}`;

  if (building.owned) {
    buildingElement.style.display = "none";
    buildingOwnedElement.style.display = "block";
    buildingUpgradeElement.style.display = "block";
    buildingUpgradeElement.textContent = `Upgrade to Level ${
      building.level == building.levelMax ? "MAX" : building.level + 1
    }`;
  } else {
    buildingElement.style.display = "block";
    buildingOwnedElement.style.display = "none";
    buildingUpgradeElement.style.display = "none";
  }

  const costElement = document.getElementById(`cost-${building.id}`);
  costElement.textContent = `Cost: ${Object.entries(
    building.cost(building.level + 1)
  )
    .map(([resource, amount]) => (amount > 0 ? `${amount} ${resource}` : ""))
    .filter(Boolean)
    .join(", ")}`;
}

function applyBuildingEffects() {
  for (const building of buildingsList) {
    if (building.owned) {
      switch (building.id) {
        case "waterTreatment":
          water += 4 + building.level;
          break;
        case "powerPlant":
          energy += 6 + building.level;
          break;
        case "farm":
          food += 5 + building.level;
          break;
        case "park":
          happiness += 2 + building.level;
          break;
        case "market":
          money += 2 + building.level;
          happiness += 1 + building.level;
          break;
      }
    }
  }
}

buildingListUI();
