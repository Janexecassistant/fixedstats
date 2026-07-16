(function () {
  "use strict";

  const STORAGE_KEY = "dyer_bg_services_roleplay_lab_v2";
  const SCORE_KEYS = ["acknowledge", "clarify", "connect", "ask"];
  const SCORE_LABELS = {
    acknowledge: "Acknowledge",
    clarify: "Clarify",
    connect: "Connect",
    ask: "Ask"
  };

  const app = document.getElementById("roleplay-app");
  if (!app) return;

  const elements = {
    loadStatus: document.getElementById("roleplay-load-status"),
    panel: document.getElementById("scenario-panel"),
    select: document.getElementById("scenario-select"),
    count: document.getElementById("roleplay-count"),
    progress: document.getElementById("roleplay-progress"),
    position: document.getElementById("scenario-position"),
    title: document.getElementById("scenario-title"),
    difficulty: document.getElementById("scenario-difficulty"),
    vehicle: document.getElementById("scenario-vehicle"),
    service: document.getElementById("scenario-service"),
    context: document.getElementById("scenario-context"),
    quote: document.getElementById("scenario-quote"),
    goal: document.getElementById("scenario-goal"),
    response: document.getElementById("advisor-response"),
    responseCount: document.getElementById("response-count"),
    saveStatus: document.getElementById("local-save-status"),
    saveButton: document.getElementById("save-response"),
    coachingToggle: document.getElementById("coaching-toggle"),
    coachingPanel: document.getElementById("coaching-panel"),
    framework: document.getElementById("framework-grid"),
    coachFor: document.getElementById("coach-for"),
    avoid: document.getElementById("scenario-avoid"),
    scoreGrid: document.getElementById("self-score-grid"),
    scoreSummary: document.getElementById("scenario-score-summary"),
    completionNote: document.getElementById("scenario-completion-note"),
    completeButton: document.getElementById("complete-scenario"),
    previous: document.getElementById("previous-scenario"),
    random: document.getElementById("random-scenario"),
    next: document.getElementById("next-scenario")
  };

  let scenarios = [];
  let currentIndex = 0;
  let saveTimer = null;
  let storageAvailable = true;
  let practiceState = loadState();

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        version: 2,
        scenarios: parsed && parsed.scenarios && typeof parsed.scenarios === "object" ? parsed.scenarios : {}
      };
    } catch (error) {
      storageAvailable = false;
      return { version: 2, scenarios: {} };
    }
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(practiceState));
      storageAvailable = true;
      return true;
    } catch (error) {
      storageAvailable = false;
      return false;
    }
  }

  function scenarioState(id) {
    if (!practiceState.scenarios[id]) {
      practiceState.scenarios[id] = {
        response: "",
        scores: {},
        completed: false,
        updatedAt: null
      };
    }
    return practiceState.scenarios[id];
  }

  function setSaveStatus(message, isError) {
    elements.saveStatus.textContent = message;
    elements.saveStatus.classList.toggle("is-error", !!isError);
  }

  function saveCurrent(message) {
    if (!scenarios.length) return;
    const current = scenarios[currentIndex];
    const saved = scenarioState(current.id);
    saved.response = elements.response.value;
    saved.updatedAt = new Date().toISOString();
    if (saved.response.trim().length < 20) saved.completed = false;

    if (persistState()) {
      const time = new Date(saved.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      setSaveStatus(message || `Saved in this browser at ${time}.`, false);
    } else {
      setSaveStatus("This browser blocked local storage. Your response will remain only until you leave this page.", true);
    }
    updatePracticeProgress();
    updateCompletionState();
  }

  function scheduleSave() {
    window.clearTimeout(saveTimer);
    setSaveStatus("Saving in this browser…", false);
    saveTimer = window.setTimeout(function () { saveCurrent(); }, 350);
  }

  function updateResponseCount() {
    elements.responseCount.textContent = `${elements.response.value.length} / 1600`;
  }

  function buildScenarioSelect() {
    const selectedId = scenarios[currentIndex] ? scenarios[currentIndex].id : "";
    elements.select.replaceChildren();
    scenarios.forEach(function (scenario, index) {
      const option = document.createElement("option");
      option.value = scenario.id;
      option.textContent = `${scenarioState(scenario.id).completed ? "✓ " : ""}${index + 1}. ${scenario.title}`;
      option.selected = scenario.id === selectedId;
      elements.select.appendChild(option);
    });
  }

  function updatePracticeProgress() {
    const completed = scenarios.filter(function (scenario) {
      return scenarioState(scenario.id).completed;
    }).length;
    const total = scenarios.length || 15;
    elements.count.textContent = `${completed} of ${total} complete`;
    elements.progress.max = total;
    elements.progress.value = completed;
    elements.progress.textContent = `${completed} of ${total} complete`;
    buildScenarioSelect();
  }

  function buildFramework(scenario) {
    elements.framework.replaceChildren();
    SCORE_KEYS.forEach(function (key, index) {
      const item = document.createElement("div");
      item.className = "framework-card";

      const step = document.createElement("span");
      step.className = "framework-step";
      step.textContent = String(index + 1);

      const heading = document.createElement("h4");
      heading.textContent = SCORE_LABELS[key];

      const copy = document.createElement("p");
      copy.textContent = scenario.framework[key];

      item.append(step, heading, copy);
      elements.framework.appendChild(item);
    });
  }

  function buildScoreControls(scenario) {
    const saved = scenarioState(scenario.id);
    elements.scoreGrid.replaceChildren();

    SCORE_KEYS.forEach(function (key) {
      const group = document.createElement("fieldset");
      group.className = "self-score-group";

      const legend = document.createElement("legend");
      legend.textContent = SCORE_LABELS[key];
      group.appendChild(legend);

      const scale = document.createElement("div");
      scale.className = "self-score-scale";
      scale.setAttribute("aria-label", `${SCORE_LABELS[key]} score`);

      for (let value = 1; value <= 5; value += 1) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        const pill = document.createElement("span");
        input.type = "radio";
        input.name = `roleplay-${scenario.id}-${key}`;
        input.value = String(value);
        input.checked = Number(saved.scores[key]) === value;
        input.setAttribute("aria-label", `${SCORE_LABELS[key]} ${value} out of 5`);
        pill.textContent = String(value);
        label.append(input, pill);
        scale.appendChild(label);
      }

      group.appendChild(scale);
      elements.scoreGrid.appendChild(group);
    });
  }

  function updateCompletionState() {
    if (!scenarios.length) return;
    const scenario = scenarios[currentIndex];
    const saved = scenarioState(scenario.id);
    const responseReady = (saved.response || "").trim().length >= 20;
    const scores = SCORE_KEYS.map(function (key) { return Number(saved.scores[key]) || 0; });
    const scoresReady = scores.every(function (score) { return score >= 1 && score <= 5; });
    const average = scoresReady ? (scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length) : null;

    elements.scoreSummary.textContent = average === null
      ? "Add all four self-scores."
      : `Self-score average: ${average.toFixed(1)} / 5`;

    if (saved.completed) {
      elements.completionNote.textContent = "Completed. You can still edit your response and scores in this browser.";
      elements.completeButton.textContent = "Scenario complete ✓";
      elements.completeButton.disabled = true;
    } else {
      const needs = [];
      if (!responseReady) needs.push("a response of at least 20 characters");
      if (!scoresReady) needs.push("all four self-scores");
      elements.completionNote.textContent = needs.length
        ? `To complete: add ${needs.join(" and ")}.`
        : "Ready to mark complete.";
      elements.completeButton.textContent = "Mark scenario complete";
      elements.completeButton.disabled = !(responseReady && scoresReady);
    }
  }

  function closeCoachingGuide() {
    elements.coachingPanel.hidden = true;
    elements.coachingToggle.setAttribute("aria-expanded", "false");
    elements.coachingToggle.textContent = "Reveal coaching guide";
  }

  function renderScenario(options) {
    if (!scenarios.length) return;
    const scenario = scenarios[currentIndex];
    const saved = scenarioState(scenario.id);

    elements.position.textContent = `Scenario ${currentIndex + 1} of ${scenarios.length}`;
    elements.title.textContent = scenario.title;
    elements.difficulty.textContent = scenario.difficulty;
    elements.vehicle.textContent = scenario.vehicle;
    elements.service.textContent = scenario.service;
    elements.context.textContent = scenario.customerContext;
    elements.quote.textContent = `“${scenario.customerQuote}”`;
    elements.goal.textContent = scenario.practiceGoal;
    elements.response.value = saved.response || "";
    elements.coachFor.textContent = scenario.coachFor;
    elements.avoid.textContent = scenario.avoid;

    buildFramework(scenario);
    buildScoreControls(scenario);
    updateResponseCount();
    updatePracticeProgress();
    updateCompletionState();
    closeCoachingGuide();

    elements.previous.disabled = currentIndex === 0;
    elements.next.disabled = currentIndex === scenarios.length - 1;
    setSaveStatus(storageAvailable && saved.updatedAt
      ? `Saved in this browser ${new Date(saved.updatedAt).toLocaleString()}.`
      : "Ready for your response.", false);

    if (options && options.focusTitle) elements.title.focus({ preventScroll: true });
  }

  function goToIndex(index) {
    window.clearTimeout(saveTimer);
    saveCurrent("Saved before moving to the next scenario.");
    currentIndex = Math.max(0, Math.min(index, scenarios.length - 1));
    renderScenario();
    elements.panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  elements.response.addEventListener("input", function () {
    const current = scenarios[currentIndex];
    if (!current) return;
    scenarioState(current.id).response = elements.response.value;
    updateResponseCount();
    updateCompletionState();
    scheduleSave();
  });

  elements.saveButton.addEventListener("click", function () {
    window.clearTimeout(saveTimer);
    saveCurrent("Saved in this browser.");
  });

  elements.coachingToggle.addEventListener("click", function () {
    const willOpen = elements.coachingPanel.hidden;
    elements.coachingPanel.hidden = !willOpen;
    elements.coachingToggle.setAttribute("aria-expanded", String(willOpen));
    elements.coachingToggle.textContent = willOpen ? "Hide coaching guide" : "Reveal coaching guide";
    if (willOpen) elements.coachingPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  elements.scoreGrid.addEventListener("change", function (event) {
    if (!event.target.matches('input[type="radio"]') || !scenarios.length) return;
    const scenario = scenarios[currentIndex];
    const key = SCORE_KEYS.find(function (scoreKey) {
      return event.target.name.endsWith(`-${scoreKey}`);
    });
    if (!key) return;
    const saved = scenarioState(scenario.id);
    saved.scores[key] = Number(event.target.value);
    saved.updatedAt = new Date().toISOString();
    persistState();
    updateCompletionState();
    setSaveStatus("Self-score saved in this browser.", false);
  });

  elements.completeButton.addEventListener("click", function () {
    const scenario = scenarios[currentIndex];
    if (!scenario) return;
    const saved = scenarioState(scenario.id);
    saved.response = elements.response.value;
    const scoresReady = SCORE_KEYS.every(function (key) { return Number(saved.scores[key]) >= 1; });
    if (saved.response.trim().length < 20 || !scoresReady) {
      updateCompletionState();
      return;
    }
    saved.completed = true;
    saved.updatedAt = new Date().toISOString();
    persistState();
    updatePracticeProgress();
    updateCompletionState();
    setSaveStatus("Scenario marked complete and saved in this browser.", false);
  });

  elements.select.addEventListener("change", function () {
    const nextIndex = scenarios.findIndex(function (scenario) { return scenario.id === elements.select.value; });
    if (nextIndex >= 0) goToIndex(nextIndex);
  });

  elements.previous.addEventListener("click", function () { goToIndex(currentIndex - 1); });
  elements.next.addEventListener("click", function () { goToIndex(currentIndex + 1); });
  elements.random.addEventListener("click", function () {
    const incomplete = scenarios
      .map(function (scenario, index) { return { scenario: scenario, index: index }; })
      .filter(function (item) { return !scenarioState(item.scenario.id).completed && item.index !== currentIndex; });
    const pool = incomplete.length
      ? incomplete
      : scenarios.map(function (scenario, index) { return { scenario: scenario, index: index }; })
        .filter(function (item) { return item.index !== currentIndex; });
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) goToIndex(pick.index);
  });

  fetch("content/roleplays.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error(`Scenario source returned ${response.status}`);
      return response.json();
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.scenarios) || !data.scenarios.length) {
        throw new Error("Scenario source is empty");
      }
      scenarios = data.scenarios;
      elements.loadStatus.hidden = true;
      elements.panel.hidden = false;
      renderScenario();
    })
    .catch(function (error) {
      elements.loadStatus.classList.remove("callout-blue");
      elements.loadStatus.classList.add("callout-amber");
      elements.loadStatus.textContent = "The practice scenarios could not be loaded. Return to the module map and try again, or contact the training manager.";
      console.warn("[bg-roleplay]", error);
    });
})();
