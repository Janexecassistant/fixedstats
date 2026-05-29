const STORAGE_KEY = "flatRateFrenzySaveV1";
const TIME_LIMIT_MULTIPLIER = 5;

const levelTitles = [
  "Express Lube Rookie",
  "Quick Service Tech",
  "Maintenance Tech",
  "Light Line Tech",
  "Brake and Chassis Tech",
  "Transmission Service Tech",
  "Diagnostic Tech",
  "Master Repair Tech"
];

const xpThresholds = [0, 100, 260, 500, 840, 1280, 1840, 2520];

const vehicles = [
  { year: 2018, make: "Toyota", model: "Camry", mileage: 62410, color: "#d71920" },
  { year: 2021, make: "Ford", model: "F-150", mileage: 43120, color: "#324556" },
  { year: 2017, make: "Honda", model: "CR-V", mileage: 88220, color: "#6f747a" },
  { year: 2020, make: "Chevrolet", model: "Malibu", mileage: 51205, color: "#4b4f55" },
  { year: 2019, make: "Subaru", model: "Outback", mileage: 70533, color: "#111315" }
];

const customers = [
  "Jordan Lee",
  "Casey Morgan",
  "Riley Patel",
  "Sam Brooks",
  "Taylor Nguyen",
  "Morgan Davis",
  "Avery Clark"
];

const jobs = [
  {
    id: "oil-change",
    name: "Oil Change",
    unlockLevel: 1,
    timeLimit: 95,
    difficulty: 1,
    payout: 42,
    xp: 40,
    upsellChance: 0.25,
    steps: [
      "Check repair order",
      "Pull vehicle into bay",
      "Set lift arms correctly",
      "Raise vehicle",
      "Drain oil",
      "Replace oil filter",
      "Inspect drain plug gasket",
      "Reinstall drain plug",
      "Lower vehicle",
      "Add correct oil quantity",
      "Check dipstick",
      "Reset oil life monitor",
      "Complete multipoint inspection",
      "Park vehicle and close repair order"
    ],
    critical: ["Set lift arms correctly", "Add correct oil quantity", "Check dipstick", "Reset oil life monitor"]
  },
  {
    id: "tire-pressure",
    name: "Tire Pressure Check",
    unlockLevel: 1,
    timeLimit: 55,
    difficulty: 1,
    payout: 18,
    xp: 24,
    upsellChance: 0.18,
    steps: [
      "Check repair order",
      "Inspect tire placard",
      "Measure all tire pressures",
      "Adjust pressures to spec",
      "Inspect tread depth",
      "Check for leaks or nails",
      "Update multipoint inspection",
      "Close repair order"
    ],
    critical: ["Inspect tire placard", "Adjust pressures to spec", "Check for leaks or nails"]
  },
  {
    id: "tire-rotation",
    name: "Tire Rotation",
    unlockLevel: 2,
    timeLimit: 100,
    difficulty: 2,
    payout: 36,
    xp: 48,
    upsellChance: 0.3,
    steps: [
      "Check repair order",
      "Pull vehicle into bay",
      "Set lift arms correctly",
      "Raise vehicle",
      "Remove wheels",
      "Inspect tires and brakes",
      "Rotate tires by pattern",
      "Hand start lug nuts",
      "Lower vehicle to tire contact",
      "Torque wheels to spec",
      "Set tire pressures",
      "Complete multipoint inspection",
      "Road test if needed",
      "Close repair order"
    ],
    critical: ["Set lift arms correctly", "Hand start lug nuts", "Torque wheels to spec", "Set tire pressures"]
  },
  {
    id: "filters",
    name: "Cabin and Engine Air Filters",
    unlockLevel: 2,
    timeLimit: 75,
    difficulty: 2,
    payout: 48,
    xp: 46,
    upsellChance: 0.2,
    steps: [
      "Check repair order",
      "Verify filter part numbers",
      "Show dirty filters in MPVI",
      "Remove old cabin filter",
      "Install cabin filter with airflow correct",
      "Remove engine air filter",
      "Clean airbox debris",
      "Install engine air filter",
      "Recheck fitment",
      "Close repair order"
    ],
    critical: ["Verify filter part numbers", "Install cabin filter with airflow correct", "Recheck fitment"]
  },
  {
    id: "brake-inspection",
    name: "Brake Inspection",
    unlockLevel: 3,
    timeLimit: 110,
    difficulty: 3,
    payout: 58,
    xp: 70,
    upsellChance: 0.42,
    steps: [
      "Check repair order",
      "Road test for brake concern",
      "Lift vehicle safely",
      "Remove wheels",
      "Measure brake pads",
      "Measure rotor thickness",
      "Inspect calipers and hoses",
      "Record photos in MPVI",
      "Torque wheels to spec",
      "Document recommendation",
      "Close repair order"
    ],
    critical: ["Lift vehicle safely", "Measure brake pads", "Torque wheels to spec", "Document recommendation"]
  },
  {
    id: "battery",
    name: "Battery Replacement",
    unlockLevel: 3,
    timeLimit: 90,
    difficulty: 3,
    payout: 64,
    xp: 72,
    upsellChance: 0.22,
    steps: [
      "Check repair order",
      "Test battery and charging system",
      "Confirm correct replacement battery",
      "Save radio presets if needed",
      "Disconnect negative cable",
      "Remove old battery",
      "Clean terminals",
      "Install new battery",
      "Tighten hold-down",
      "Reconnect cables",
      "Register battery if required",
      "Retest charging system",
      "Close repair order"
    ],
    critical: ["Test battery and charging system", "Disconnect negative cable", "Tighten hold-down", "Register battery if required"]
  },
  {
    id: "fluid-exchange",
    name: "Fluid Exchange",
    unlockLevel: 4,
    timeLimit: 135,
    difficulty: 4,
    payout: 96,
    xp: 105,
    upsellChance: 0.28,
    steps: [
      "Check repair order",
      "Verify correct fluid type",
      "Inspect for leaks",
      "Connect exchange equipment",
      "Run exchange procedure",
      "Set final fluid level",
      "Check for leaks",
      "Document service in MPVI",
      "Road test",
      "Close repair order"
    ],
    critical: ["Verify correct fluid type", "Set final fluid level", "Check for leaks"]
  },
  {
    id: "brake-job",
    name: "Brake Job",
    unlockLevel: 5,
    timeLimit: 170,
    difficulty: 5,
    payout: 150,
    xp: 150,
    upsellChance: 0.2,
    steps: [
      "Check repair order",
      "Verify parts",
      "Lift vehicle safely",
      "Remove wheels",
      "Remove caliper and bracket",
      "Resurface or replace rotors",
      "Clean and lubricate slide pins",
      "Install pads and hardware",
      "Torque caliper bolts",
      "Torque wheels to spec",
      "Pump brake pedal",
      "Road test",
      "Close repair order"
    ],
    critical: ["Verify parts", "Torque caliper bolts", "Pump brake pedal", "Road test"]
  },
  {
    id: "trans-service",
    name: "Transmission Service",
    unlockLevel: 6,
    timeLimit: 190,
    difficulty: 6,
    payout: 190,
    xp: 190,
    upsellChance: 0.16,
    steps: [
      "Check repair order",
      "Verify service procedure",
      "Check transmission temperature",
      "Drain fluid",
      "Replace filter or pan gasket",
      "Refill with correct fluid",
      "Run shift procedure",
      "Set final level at temperature",
      "Check for leaks",
      "Road test",
      "Close repair order"
    ],
    critical: ["Verify service procedure", "Refill with correct fluid", "Set final level at temperature", "Check for leaks"]
  },
  {
    id: "engine-diagnostics",
    name: "Engine Diagnostics",
    unlockLevel: 7,
    timeLimit: 210,
    difficulty: 7,
    payout: 225,
    xp: 230,
    upsellChance: 0.32,
    steps: [
      "Check repair order",
      "Interview advisor for symptoms",
      "Scan for trouble codes",
      "Review freeze-frame data",
      "Perform visual inspection",
      "Run pinpoint tests",
      "Verify root cause",
      "Document findings with evidence",
      "Clear codes after repair approval",
      "Close repair order"
    ],
    critical: ["Scan for trouble codes", "Run pinpoint tests", "Verify root cause", "Document findings with evidence"]
  },
  {
    id: "engine-rebuild",
    name: "Engine Rebuild",
    unlockLevel: 8,
    timeLimit: 260,
    difficulty: 8,
    payout: 420,
    xp: 360,
    upsellChance: 0.18,
    steps: [
      "Check repair order",
      "Review service information",
      "Label connectors and hoses",
      "Remove engine accessories",
      "Set timing marks",
      "Remove cylinder head",
      "Inspect gasket surfaces",
      "Measure components",
      "Reassemble to torque sequence",
      "Fill fluids",
      "Prime oil system",
      "Start and check for leaks",
      "Road test",
      "Close repair order"
    ],
    critical: ["Review service information", "Set timing marks", "Reassemble to torque sequence", "Prime oil system"]
  }
];

const upgrades = [
  { id: "filter-wrench", name: "Better Oil Filter Wrench", cost: 90, effect: "Faster oil changes", speed: 0.05 },
  { id: "impact-gun", name: "Faster Impact Gun", cost: 150, effect: "Faster wheel work", speed: 0.07 },
  { id: "digital-inflator", name: "Digital Tire Inflator", cost: 120, effect: "More accurate tire pressures", accuracy: 0.04 },
  { id: "torque-wrench", name: "Torque Wrench", cost: 180, effect: "Fewer lug and fastener mistakes", accuracy: 0.06 },
  { id: "scan-tool", name: "Scan Tool", cost: 260, effect: "Unlocks clean diagnostics habits", unlock: "Diagnostic Ready", accuracy: 0.04 },
  { id: "lift-training", name: "Lift Training", cost: 140, effect: "Improves safety step accuracy", unlock: "Lift Safety Certified", accuracy: 0.05 },
  { id: "mpvi-training", name: "MPVI Video Training", cost: 110, effect: "Finds more recommendations", upsell: 0.12, unlock: "MPVI Pro" },
  { id: "brake-cert", name: "Brake Certification", cost: 240, effect: "Unlocks brake confidence", unlock: "Brake Certified", accuracy: 0.04 },
  { id: "electrical-training", name: "Electrical Diagnostic Training", cost: 310, effect: "Better battery and diagnostic work", unlock: "Electrical Certified", accuracy: 0.05 },
  { id: "engine-cert", name: "Engine Repair Certification", cost: 500, effect: "Prepares for heavy repairs", unlock: "Engine Repair Certified", accuracy: 0.06 }
];

const randomEvents = [
  {
    title: "Rusted drain plug",
    description: "The plug is fighting back. What is the professional move?",
    choices: ["Force it with a bigger wrench", "Apply penetrant and use the right socket", "Skip the oil change"],
    correct: 1,
    reward: "Saved the pan threads."
  },
  {
    title: "Missing wheel lock key",
    description: "The RO says rotate tires, but the wheel lock key is not in the car.",
    choices: ["Hammer on a socket", "Notify advisor and document delay", "Charge ahead without telling anyone"],
    correct: 1,
    reward: "Advisor looped in. No surprise at pickup."
  },
  {
    title: "Customer waiting",
    description: "The waiting room clock is louder than your impact gun.",
    choices: ["Rush and skip inspection", "Stay accurate and communicate ETA", "Hide in the parts room"],
    correct: 1,
    reward: "Fast is good. Accurate and communicated is better."
  },
  {
    title: "Wrong oil listed on RO",
    description: "The RO says one viscosity, the cap says another.",
    choices: ["Use what the RO says", "Check service information and ask advisor", "Guess based on the last car"],
    correct: 1,
    reward: "Correct fluid verified."
  },
  {
    title: "Tire has a nail",
    description: "You spot a nail during the MPVI.",
    choices: ["Ignore it", "Photo it and recommend repair", "Pull it out and hope"],
    correct: 1,
    reward: "Solid MPVI find."
  },
  {
    title: "Battery fails test",
    description: "The tester says replace battery.",
    choices: ["Document the test result", "Delete the result", "Sell an alternator immediately"],
    correct: 0,
    reward: "Evidence makes recommendations easier."
  },
  {
    title: "Advisor needs video inspection",
    description: "The advisor requests a video for customer trust.",
    choices: ["Record clear MPVI video", "Say the camera is haunted", "Skip it to save time"],
    correct: 0,
    reward: "Customer trust went up."
  },
  {
    title: "Parts delay",
    description: "The filter is not at the parts counter yet.",
    choices: ["Install a random filter", "Update status and stage next step", "Close the RO anyway"],
    correct: 1,
    reward: "Delay managed cleanly."
  },
  {
    title: "Lift safety warning",
    description: "A lift arm looks slightly off before raising.",
    choices: ["Lower and reset the arms", "Keep going slowly", "Ask the customer to hold the car"],
    correct: 0,
    reward: "Safety first, always."
  },
  {
    title: "Comeback from previous bad repair",
    description: "A prior job is back. The customer is already annoyed.",
    choices: ["Blame night shift", "Listen, inspect, document, escalate", "Clear the codes and park it"],
    correct: 1,
    reward: "Professional recovery protected CSI."
  }
];

const mpviFindings = [
  {
    id: "oil-leak",
    title: "Oil leak spotted",
    description: "Fresh oil residue is visible around the oil pan area.",
    recommendation: "Recommend oil leak diagnosis and dye inspection.",
    category: "leaks"
  },
  {
    id: "worn-belt",
    title: "Cracked serpentine belt",
    description: "The belt has visible cracking across multiple ribs.",
    recommendation: "Recommend serpentine belt replacement.",
    category: "belts"
  },
  {
    id: "brake-pads",
    title: "Front brake pads low",
    description: "Pad material is near the service limit.",
    recommendation: "Recommend front brake pads and rotor measurement.",
    category: "brakes"
  },
  {
    id: "tire-wear",
    title: "Uneven tire wear",
    description: "Inside shoulder wear suggests alignment or suspension concern.",
    recommendation: "Recommend alignment check and tire quote.",
    category: "tires"
  },
  {
    id: "dirty-cabin-filter",
    title: "Cabin filter dirty",
    description: "The cabin filter is restricted with dust and debris.",
    recommendation: "Recommend cabin air filter replacement.",
    category: "filters"
  },
  {
    id: "dirty-engine-filter",
    title: "Engine air filter dirty",
    description: "The engine air filter is dark and loaded with debris.",
    recommendation: "Recommend engine air filter replacement.",
    category: "filters"
  },
  {
    id: "weak-battery",
    title: "Battery test marginal",
    description: "Battery reserve is low and may fail in cold weather.",
    recommendation: "Recommend battery replacement quote.",
    category: "electrical"
  },
  {
    id: "coolant-leak",
    title: "Coolant seepage",
    description: "Light crusting is visible near a hose connection.",
    recommendation: "Recommend cooling system pressure test.",
    category: "leaks"
  }
];

const reminders = [
  "Always read the repair order first.",
  "Video MPVI helps build customer trust.",
  "Torque wheels properly and document it.",
  "Check for leaks after fluid service.",
  "Reset maintenance lights before delivery.",
  "Quality control prevents comebacks.",
  "Efficiency matters, but accuracy matters more."
];

const shopStations = {
  ro: { label: "Advisor Desk", x: 9, y: 34 },
  drive: { label: "Driver Seat", x: 38, y: 47 },
  lift: { label: "Lift Controls", x: 52, y: 24 },
  drain: { label: "Drain Pan", x: 52, y: 79 },
  oil: { label: "Oil Cart", x: 89, y: 73 },
  tires: { label: "Vehicle Wheels", x: 12, y: 77 },
  tools: { label: "Toolbox", x: 90, y: 42 },
  scan: { label: "Scan Cart", x: 74, y: 22 },
  qc: { label: "MPVI / QC", x: 25, y: 22 }
};

let state = createNewState();
let currentJob = null;
let currentVehicle = null;
let currentEvent = null;
let currentFinding = null;
let currentStepIndex = 0;
let secondsLeft = 0;
let timerId = null;
let mistakes = [];
let correctClicks = 0;
let totalClicks = 0;
let eventResolved = false;
let eventTriggered = false;
let jobStartedAt = 0;
let movingTech = false;
let jobFinished = false;
let findingsFound = [];
let findingsSent = [];
let findingStepKeys = new Set();

const $ = (id) => document.getElementById(id);

function createNewState(name = "New Tech") {
  return {
    techName: name,
    xp: 0,
    money: 0,
    csi: 100,
    comebacks: 0,
    jobsCompleted: 0,
    totalAccuracy: 0,
    totalEfficiency: 0,
    ownedUpgrades: [],
    certifications: []
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    state = { ...createNewState(), ...JSON.parse(saved) };
  } catch {
    state = createNewState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getLevel() {
  let level = 1;
  xpThresholds.forEach((threshold, index) => {
    if (state.xp >= threshold) level = index + 1;
  });
  return Math.min(level, 8);
}

function getNextLevelXp() {
  const level = getLevel();
  return xpThresholds[level] || xpThresholds[xpThresholds.length - 1];
}

function getLevelStartXp() {
  return xpThresholds[getLevel() - 1] || 0;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  $(id).classList.add("active");
}

function money(amount) {
  return `$${Math.round(amount)}`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function updateDashboard() {
  const level = getLevel();
  const nextXp = getNextLevelXp();
  const startXp = getLevelStartXp();
  const xpRange = Math.max(1, nextXp - startXp);
  const xpProgress = level === 8 ? 100 : ((state.xp - startXp) / xpRange) * 100;

  $("techNameDisplay").textContent = state.techName;
  $("levelTitle").textContent = `Level ${level} ${levelTitles[level - 1]}`;
  $("levelText").textContent = `Level ${level}`;
  $("xpText").textContent = level === 8 ? `${state.xp} XP - top level` : `${state.xp} / ${nextXp} XP`;
  $("xpBar").style.width = `${Math.max(0, Math.min(100, xpProgress))}%`;
  $("moneyText").textContent = money(state.money);
  $("csiText").textContent = state.csi;
  $("comebackText").textContent = state.comebacks;
  $("jobsText").textContent = state.jobsCompleted;
  $("efficiencyText").textContent = `${getAverage("totalEfficiency")}%`;
  $("accuracyText").textContent = `${getAverage("totalAccuracy")}%`;

  const certList = $("certList");
  certList.innerHTML = "";
  const certs = state.certifications.length ? state.certifications : ["No certifications yet"];
  certs.forEach((cert) => {
    const tag = document.createElement("span");
    tag.textContent = cert;
    certList.appendChild(tag);
  });

  renderJobs();
}

function getAverage(key) {
  if (!state.jobsCompleted) return 100;
  return Math.round(state[key] / state.jobsCompleted);
}

function renderJobs() {
  const list = $("availableJobs");
  const level = getLevel();
  list.innerHTML = "";

  jobs.forEach((job) => {
    const locked = job.unlockLevel > level;
    const card = document.createElement("article");
    card.className = `job-card ${locked ? "locked" : ""}`;
    card.innerHTML = `
      <div class="meter-label">
        <h3>${job.name}</h3>
        <span class="difficulty-tag">Level ${job.unlockLevel}</span>
      </div>
      <p>${locked ? "Keep earning XP to unlock this repair order." : reminders[(job.difficulty - 1) % reminders.length]}</p>
      <div class="job-meta">
        <span>Time: ${formatTime(getDisplayTimeLimit(job))}</span>
        <span>Difficulty: ${job.difficulty}/8</span>
        <span>Payout: ${money(job.payout)}</span>
        <span>XP: ${job.xp}</span>
      </div>
      <button class="${locked ? "ghost-btn" : "tool-btn"}" type="button" ${locked ? "disabled" : ""}>
        ${locked ? "Locked" : "Start RO"}
      </button>
    `;
    if (!locked) {
      card.querySelector("button").addEventListener("click", () => startJob(job.id));
    }
    list.appendChild(card);
  });
}

function renderUpgrades() {
  const list = $("upgradeList");
  list.innerHTML = "";
  upgrades.forEach((upgrade) => {
    const owned = state.ownedUpgrades.includes(upgrade.id);
    const affordable = state.money >= upgrade.cost;
    const card = document.createElement("article");
    card.className = `upgrade-card ${owned ? "owned" : ""}`;
    card.innerHTML = `
      <h3>${upgrade.name}</h3>
      <p>${upgrade.effect}</p>
      <div class="price-row">
        <span>${money(upgrade.cost)}</span>
        <button class="${owned ? "ghost-btn" : "tool-btn"}" type="button" ${owned || !affordable ? "disabled" : ""}>
          ${owned ? "Owned" : affordable ? "Buy" : "Need more money"}
        </button>
      </div>
    `;
    if (!owned && affordable) {
      card.querySelector("button").addEventListener("click", () => buyUpgrade(upgrade.id));
    }
    list.appendChild(card);
  });
}

function buyUpgrade(id) {
  const upgrade = upgrades.find((item) => item.id === id);
  if (!upgrade || state.ownedUpgrades.includes(id) || state.money < upgrade.cost) return;
  state.money -= upgrade.cost;
  state.ownedUpgrades.push(id);
  if (upgrade.unlock && !state.certifications.includes(upgrade.unlock)) {
    state.certifications.push(upgrade.unlock);
  }
  saveState();
  updateDashboard();
  renderUpgrades();
}

function startJob(jobId) {
  currentJob = jobs.find((job) => job.id === jobId);
  currentVehicle = randomItem(vehicles);
  currentEvent = Math.random() < 0.72 ? randomItem(randomEvents) : null;
  currentFinding = null;
  currentStepIndex = 0;
  secondsLeft = getAdjustedTimeLimit(currentJob);
  mistakes = [];
  correctClicks = 0;
  totalClicks = 0;
  eventResolved = true;
  eventTriggered = false;
  jobStartedAt = Date.now();
  movingTech = false;
  jobFinished = false;
  findingsFound = [];
  findingsSent = [];
  findingStepKeys = new Set();

  $("roService").textContent = currentJob.name;
  $("roCustomer").textContent = randomItem(customers);
  $("roVehicle").textContent = `${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}`;
  $("roMileage").textContent = currentVehicle.mileage.toLocaleString();
  $("roDifficulty").textContent = `${currentJob.difficulty}/8`;
  $("roPayout").textContent = money(currentJob.payout);
  $("roXp").textContent = currentJob.xp;
  $("activeCar").style.background = `linear-gradient(135deg, ${currentVehicle.color}, #263646)`;
  $("eventPanel").classList.add("hidden");

  moveTechTo("ro", false);
  renderProcess();
  updateTimer();
  updateProgress();
  setFeedback("Click the highlighted shop area to move your tech and perform the next step.", "neutral");
  showScreen("serviceBayScreen");
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
}

function getAdjustedTimeLimit(job) {
  const speedBoost = upgrades
    .filter((upgrade) => state.ownedUpgrades.includes(upgrade.id))
    .reduce((sum, upgrade) => sum + (upgrade.speed || 0), 0);
  return Math.round(getDisplayTimeLimit(job) * (1 + Math.min(0.25, speedBoost)));
}

function getDisplayTimeLimit(job) {
  return Math.round(job.timeLimit * TIME_LIMIT_MULTIPLIER);
}

function getAccuracyBoost() {
  return upgrades
    .filter((upgrade) => state.ownedUpgrades.includes(upgrade.id))
    .reduce((sum, upgrade) => sum + (upgrade.accuracy || 0), 0);
}

function getUpsellBoost() {
  return upgrades
    .filter((upgrade) => state.ownedUpgrades.includes(upgrade.id))
    .reduce((sum, upgrade) => sum + (upgrade.upsell || 0), 0);
}

function renderProcess() {
  const list = $("processList");
  list.innerHTML = "";
  const start = Math.max(0, currentStepIndex - 2);
  const end = Math.min(currentJob.steps.length, currentStepIndex + 5);
  currentJob.steps.slice(start, end).forEach((step, offset) => {
    const index = start + offset;
    const pill = document.createElement("span");
    pill.className = `process-pill ${index < currentStepIndex ? "done" : index === currentStepIndex ? "current" : ""}`;
    const label = index < currentStepIndex ? "Done" : index === currentStepIndex ? "Now" : "Next";
    pill.textContent = `${label}: ${step}`;
    pill.title = getStepTip(step);
    list.appendChild(pill);
  });
  updateCurrentAction();
  $("stepCounter").textContent = `${currentStepIndex} / ${currentJob.steps.length}`;
}

function getStepTip(step) {
  const lower = step.toLowerCase();
  if (lower.includes("repair order")) return "Confirm concern, service, mileage, and special notes first.";
  if (lower.includes("torque")) return "Torque checks prevent wheel-off comebacks and protect the dealership.";
  if (lower.includes("mpvi")) return "Clear photos and videos build trust and help advisors communicate.";
  if (lower.includes("leaks")) return "Leak checks catch small problems before they become big comebacks.";
  if (lower.includes("reset")) return "A maintenance light left on feels unfinished to the customer.";
  if (lower.includes("lift")) return "Lift points and arm locks matter every single time.";
  return "Follow the documented process for speed and accuracy.";
}

function getStationForStep(step) {
  const lower = step.toLowerCase();
  if (
    lower.includes("pull vehicle") ||
    lower.includes("park vehicle") ||
    lower.includes("road test") ||
    lower.includes("drive") ||
    lower.includes("placard") ||
    lower.includes("reset oil life") ||
    lower.includes("maintenance light")
  ) return "drive";
  if (lower.includes("repair order") || lower.includes("advisor") || lower.includes("document") || lower.includes("recommendation") || lower.includes("close")) return "ro";
  if (lower.includes("lift") || lower.includes("raise") || lower.includes("lower")) return "lift";
  if (lower.includes("drain") || lower.includes("plug") || lower.includes("leak")) return "drain";
  if (
    lower.includes("tire") ||
    lower.includes("wheel") ||
    lower.includes("lug") ||
    lower.includes("brake") ||
    lower.includes("rotor") ||
    lower.includes("caliper") ||
    lower.includes("pressure")
  ) return "tires";
  if (lower.includes("oil") || lower.includes("fluid") || lower.includes("dipstick") || lower.includes("refill") || lower.includes("fill")) return "oil";
  if (lower.includes("scan") || lower.includes("code") || lower.includes("diagnostic") || lower.includes("freeze-frame") || lower.includes("pinpoint") || lower.includes("battery") || lower.includes("charging") || lower.includes("register")) return "scan";
  if (lower.includes("mpvi") || lower.includes("inspect") || lower.includes("road test") || lower.includes("retest") || lower.includes("verify root cause")) return "qc";
  return "tools";
}

function updateCurrentAction() {
  const step = currentJob?.steps[currentStepIndex];
  document.querySelectorAll(".shop-station").forEach((station) => station.classList.remove("active-target"));
  if (!step) {
    $("currentActionCard").textContent = "Job complete.";
    return;
  }
  const stationId = getStationForStep(step);
  const station = shopStations[stationId];
  const stationButton = document.querySelector(`[data-station="${stationId}"]`);
  stationButton?.classList.add("active-target");
  $("currentActionCard").textContent = `${step} - go to ${station.label}.`;
}

function moveTechTo(stationId, animate = true) {
  const station = shopStations[stationId];
  const tech = $("techSprite");
  if (!station || !tech) return;
  if (animate) tech.classList.add("walking");
  tech.style.left = `${station.x}%`;
  tech.style.top = `${station.y}%`;
  if (animate) {
    window.setTimeout(() => tech.classList.remove("walking"), 540);
  }
}

function handleStationClick(stationId) {
  if (!currentJob || !eventResolved) {
    setFeedback("Handle the shop curveball before continuing the job.", "bad");
    return;
  }
  if (movingTech) return;

  const expectedStep = currentJob.steps[currentStepIndex];
  const expectedStation = getStationForStep(expectedStep);
  totalClicks += 1;

  if (stationId !== expectedStation) {
    moveTechTo(stationId);
    $("serviceScene").classList.add("wrong-click");
    window.setTimeout(() => $("serviceScene").classList.remove("wrong-click"), 240);
    mistakes.push(`Went to ${shopStations[stationId].label} before "${expectedStep}".`);
    secondsLeft = Math.max(0, secondsLeft - 6);
    setFeedback(`Wrong area. For "${expectedStep}", head to ${shopStations[expectedStation].label}.`, "bad");
    updateTimer();
    return;
  }

  correctClicks += 1;
  movingTech = true;
  moveTechTo(stationId);
  setFeedback(`Moving to ${shopStations[stationId].label} for: ${expectedStep}.`, "neutral");
  window.setTimeout(() => completeCurrentStationStep(expectedStep), 540);
  updateTimer();
}

function completeCurrentStationStep(step) {
  movingTech = false;
  if (jobFinished) return;
  if (!currentJob || currentJob.steps[currentStepIndex] !== step) return;
  currentStepIndex += 1;
  secondsLeft = Math.max(0, secondsLeft - getStepTimeCost());
  setFeedback(getPositiveFeedback(step), "good");
  if (!maybeTriggerMpviFinding(step)) {
    maybeTriggerEvent();
  }
  updateProgress();
  renderProcess();
  if (currentStepIndex >= currentJob.steps.length) finishJob(false);
  updateTimer();
}

function getStepTimeCost() {
  const base = Math.max(3, Math.round(currentJob.timeLimit / (currentJob.steps.length + 8)));
  const speedBoost = upgrades
    .filter((upgrade) => state.ownedUpgrades.includes(upgrade.id))
    .reduce((sum, upgrade) => sum + (upgrade.speed || 0), 0);
  return Math.max(2, Math.round(base * (1 - Math.min(0.3, speedBoost))));
}

function getPositiveFeedback(step) {
  if (step.toLowerCase().includes("torque")) return "Torque documented. Your future self appreciates this.";
  if (step.toLowerCase().includes("mpvi")) return "Good MPVI. Advisors love clear evidence.";
  if (step.toLowerCase().includes("repair order")) return "RO checked. No mystery work today.";
  if (step.toLowerCase().includes("dipstick")) return "Oil level verified. That is comeback prevention.";
  return randomItem(reminders);
}

function maybeTriggerEvent() {
  if (!currentEvent || !eventResolved || eventTriggered || currentStepIndex < 2) return;
  const triggerPoint = Math.floor(currentJob.steps.length / 2);
  if (currentStepIndex === triggerPoint) {
    eventResolved = false;
    eventTriggered = true;
    showEvent();
  }
}

function maybeTriggerMpviFinding(step) {
  if (!eventResolved || findingsFound.length >= 3) return false;
  if (!isInspectionStep(step)) return false;
  const stepKey = `${currentJob.id}-${currentStepIndex}-${step}`;
  if (findingStepKeys.has(stepKey)) return false;
  findingStepKeys.add(stepKey);

  const chance = Math.min(0.72, currentJob.upsellChance + getUpsellBoost() + 0.22);
  if (Math.random() > chance) return false;

  const availableFindings = mpviFindings.filter((finding) => !findingsFound.some((found) => found.id === finding.id));
  if (!availableFindings.length) return false;

  currentFinding = randomItem(availableFindings);
  findingsFound.push(currentFinding);
  eventResolved = false;
  showFinding();
  return true;
}

function isInspectionStep(step) {
  const lower = step.toLowerCase();
  return (
    lower.includes("inspect") ||
    lower.includes("mpvi") ||
    lower.includes("measure") ||
    lower.includes("test") ||
    lower.includes("check for") ||
    lower.includes("visual")
  );
}

function showFinding() {
  $("eventTitle").textContent = `MPVI Finding: ${currentFinding.title}`;
  $("eventDescription").textContent = `${currentFinding.description} ${currentFinding.recommendation}`;
  const choices = $("eventChoices");
  choices.innerHTML = "";
  [
    "Send photos/video to advisor and parts",
    "Ignore it and keep moving",
    "Start the repair without approval"
  ].forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.type = "button";
    button.textContent = choice;
    button.addEventListener("click", () => resolveFinding(index));
    choices.appendChild(button);
  });
  $("eventPanel").classList.remove("hidden");
  setFeedback("MPVI finding found. Document it and send the recommendation for approval.", "neutral");
}

function resolveFinding(index) {
  totalClicks += 1;
  if (index === 0) {
    correctClicks += 1;
    findingsSent.push(currentFinding);
    state.csi = Math.min(100, state.csi + 1);
    setFeedback(`${currentFinding.recommendation} Sent to advisor and parts for approval.`, "good");
  } else if (index === 1) {
    mistakes.push(`Ignored MPVI finding: ${currentFinding.title}.`);
    secondsLeft = Math.max(0, secondsLeft - 10);
    setFeedback("Missed recommendation. Advisors cannot sell what you do not document.", "bad");
  } else {
    mistakes.push(`Started unauthorized work for MPVI finding: ${currentFinding.title}.`);
    secondsLeft = Math.max(0, secondsLeft - 14);
    setFeedback("Unauthorized repair. Recommendations need advisor/customer approval first.", "bad");
  }

  currentFinding = null;
  eventResolved = true;
  $("eventPanel").classList.add("hidden");
  updateTimer();
}

function showEvent() {
  $("eventTitle").textContent = currentEvent.title;
  $("eventDescription").textContent = currentEvent.description;
  const choices = $("eventChoices");
  choices.innerHTML = "";
  currentEvent.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.type = "button";
    button.textContent = choice;
    button.addEventListener("click", () => resolveEvent(index));
    choices.appendChild(button);
  });
  $("eventPanel").classList.remove("hidden");
  setFeedback("A real shop never gives you the perfectly clean version twice.", "neutral");
}

function resolveEvent(index) {
  if (index === currentEvent.correct) {
    correctClicks += 1;
    totalClicks += 1;
    setFeedback(currentEvent.reward, "good");
    state.csi = Math.min(100, state.csi + 1);
  } else {
    totalClicks += 1;
    mistakes.push(`Bad decision on random event: ${currentEvent.title}.`);
    secondsLeft = Math.max(0, secondsLeft - 12);
    setFeedback("That choice cost time and trust. Document, verify, communicate.", "bad");
  }
  eventResolved = true;
  $("eventPanel").classList.add("hidden");
  updateTimer();
}

function tick() {
  secondsLeft -= 1;
  updateTimer();
  if (secondsLeft <= 0) finishJob(true);
}

function updateTimer() {
  $("timerText").textContent = formatTime(Math.max(0, secondsLeft));
  $("timerText").style.color = secondsLeft < 20 ? "var(--red)" : "var(--blue-dark)";
}

function updateProgress() {
  const percent = (currentStepIndex / currentJob.steps.length) * 100;
  $("jobProgressBar").style.width = `${percent}%`;
  $("stepCounter").textContent = `${currentStepIndex} / ${currentJob.steps.length}`;
  if (currentJob) updateCurrentAction();
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function setFeedback(message, type) {
  const card = $("feedbackCard");
  card.textContent = message;
  card.className = `feedback-card ${type === "good" ? "good" : type === "bad" ? "bad" : ""}`;
}

function finishJob(timedOut) {
  if (jobFinished) return;
  jobFinished = true;
  clearInterval(timerId);
  timerId = null;

  if (timedOut) {
    mistakes.push("Ran out of time before closing the repair order.");
  }

  const requiredCritical = currentJob.critical;
  const completedSteps = currentJob.steps.slice(0, currentStepIndex);
  requiredCritical.forEach((step) => {
    if (!completedSteps.includes(step)) {
      mistakes.push(`Missed critical step: ${step}.`);
    }
  });

  const timeLimit = getAdjustedTimeLimit(currentJob);
  const timeUsed = Math.max(0, Math.round((Date.now() - jobStartedAt) / 1000));
  const completedRatio = currentStepIndex / currentJob.steps.length;
  const rawAccuracy = totalClicks ? (correctClicks / totalClicks) * 100 : 0;
  const accuracy = Math.min(100, Math.round(rawAccuracy + getAccuracyBoost() * 100));
  const efficiency = Math.min(120, Math.round((secondsLeft / timeLimit) * 100 + completedRatio * 70));
  const cleanJob = mistakes.length === 0 && completedRatio === 1;
  const comeback = mistakes.some((mistake) =>
    ["critical", "wrong oil", "torque", "oil quantity", "time"].some((keyword) => mistake.toLowerCase().includes(keyword))
  );
  const payoutMultiplier = Math.max(0.25, completedRatio * (accuracy / 100) * (timedOut ? 0.65 : 1));
  const recommendationBonus = findingsSent.length * 12;
  const earnedMoney = Math.round(currentJob.payout * payoutMultiplier + (cleanJob ? 10 : 0) + recommendationBonus);
  const earnedXp = Math.round(currentJob.xp * payoutMultiplier + (cleanJob ? 10 : 0) + findingsSent.length * 8);
  const csiChange = cleanJob ? 3 : comeback ? -8 : timedOut ? -4 : -2;

  state.money += earnedMoney;
  state.xp += earnedXp;
  state.csi = Math.max(0, Math.min(100, state.csi + csiChange));
  state.comebacks += comeback ? 1 : 0;
  state.jobsCompleted += 1;
  state.totalAccuracy += accuracy;
  state.totalEfficiency += efficiency;

  const newLevel = getLevel();
  if (newLevel >= 2 && !state.certifications.includes("Quick Lube Certified")) state.certifications.push("Quick Lube Certified");
  if (newLevel >= 4 && !state.certifications.includes("Light Line Apprentice")) state.certifications.push("Light Line Apprentice");
  if (newLevel >= 8 && !state.certifications.includes("Flat Rate Frenzy Master")) state.certifications.push("Flat Rate Frenzy Master");

  saveState();
  renderCompletion({
    cleanJob,
    timedOut,
    timeUsed,
    accuracy,
    earnedMoney,
    earnedXp,
    csiChange,
    recommendationsSent: findingsSent.length
  });
}

function renderCompletion(result) {
  $("completeTitle").textContent = result.cleanJob
    ? "Clean RO, happy customer, advisor high-five."
    : result.timedOut
      ? "Clock got you this time."
      : "Job closed, but QC has notes.";
  $("resultTime").textContent = formatTime(result.timeUsed);
  $("resultAccuracy").textContent = `${result.accuracy}%`;
  $("resultMoney").textContent = money(result.earnedMoney);
  $("resultXp").textContent = result.earnedXp;
  $("resultCsi").textContent = `${result.csiChange > 0 ? "+" : ""}${result.csiChange}`;
  $("resultUpsells").textContent = result.recommendationsSent ? `${result.recommendationsSent} sent` : "None";

  const list = $("resultMistakes");
  list.innerHTML = "";
  const items = mistakes.length ? mistakes : ["No mistakes. QC signed off clean."];
  items.forEach((mistake) => {
    const li = document.createElement("li");
    li.textContent = mistake;
    list.appendChild(li);
  });
  showScreen("completeScreen");
}

function wireEvents() {
  $("startGameBtn").addEventListener("click", () => {
    const name = $("techNameInput").value.trim() || "New Tech";
    state.techName = name;
    saveState();
    updateDashboard();
    showScreen("dashboardScreen");
  });

  $("resetGameBtn").addEventListener("click", () => {
    if (!confirm("Reset Flat Rate Frenzy progress?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = createNewState();
    clearInterval(timerId);
    updateDashboard();
    showScreen("startScreen");
  });

  $("openUpgradeBtn").addEventListener("click", () => {
    renderUpgrades();
    showScreen("upgradeScreen");
  });

  $("closeUpgradeBtn").addEventListener("click", () => {
    updateDashboard();
    showScreen("dashboardScreen");
  });

  $("backToDashboardBtn").addEventListener("click", () => {
    clearInterval(timerId);
    timerId = null;
    updateDashboard();
    showScreen("dashboardScreen");
  });

  $("continueBtn").addEventListener("click", () => {
    updateDashboard();
    showScreen("dashboardScreen");
  });

  document.querySelectorAll(".shop-station").forEach((station) => {
    station.addEventListener("click", () => handleStationClick(station.dataset.station));
  });
}

loadState();
wireEvents();
updateDashboard();

if (localStorage.getItem(STORAGE_KEY)) {
  showScreen("dashboardScreen");
}
