(function () {
  "use strict";

  const app = document.getElementById("reference-app");
  if (!app) return;

  const elements = {
    loadStatus: document.getElementById("reference-load-status"),
    eligibilityHeading: document.getElementById("eligibility-heading"),
    eligibilityFacts: document.getElementById("eligibility-facts"),
    eligibilityGuardrail: document.getElementById("eligibility-guardrail"),
    search: document.getElementById("qa-search"),
    category: document.getElementById("qa-category"),
    clear: document.getElementById("qa-clear"),
    emptyClear: document.getElementById("qa-empty-clear"),
    count: document.getElementById("qa-result-count"),
    results: document.getElementById("qa-results"),
    empty: document.getElementById("qa-empty"),
    serviceCatalog: document.getElementById("service-catalog"),
    sourceLibrary: document.getElementById("source-library"),
    sourceDate: document.getElementById("source-date")
  };

  let library = null;
  let referenceById = {};

  function createPill(text, className) {
    const pill = document.createElement("span");
    pill.className = `pill ${className || ""}`.trim();
    pill.textContent = text;
    return pill;
  }

  function sourceLink(reference, compact) {
    const link = document.createElement("a");
    link.href = reference.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = compact ? "source-chip" : "source-card";
    link.setAttribute("aria-label", `${reference.title} (opens authenticated BG source in a new tab)`);

    if (compact) {
      link.textContent = reference.title;
      return link;
    }

    const type = document.createElement("span");
    type.className = "source-card-type";
    type.textContent = reference.type;

    const title = document.createElement("strong");
    title.textContent = reference.title;

    const support = document.createElement("span");
    support.textContent = reference.supports;

    const action = document.createElement("span");
    action.className = "source-card-action";
    action.textContent = "Open authenticated source ↗";

    link.append(type, title, support, action);
    return link;
  }

  function renderEligibility() {
    const summary = library.eligibilitySummary;
    elements.eligibilityHeading.textContent = summary.heading;
    elements.eligibilityFacts.replaceChildren();
    summary.facts.forEach(function (fact) {
      const item = document.createElement("li");
      item.textContent = fact;
      elements.eligibilityFacts.appendChild(item);
    });
    elements.eligibilityGuardrail.textContent = summary.guardrail;
  }

  function confidenceClass(confidence) {
    if (confidence.startsWith("High")) return "pill-green";
    if (confidence.toLowerCase().includes("verify") || confidence.toLowerCase().includes("guardrail")) return "pill-amber";
    return "";
  }

  function createQuestion(item) {
    const details = document.createElement("details");
    details.className = "qa-item";

    const summary = document.createElement("summary");
    const category = document.createElement("span");
    category.className = "qa-category";
    category.textContent = item.category;
    const question = document.createElement("span");
    question.className = "qa-question";
    question.textContent = item.question;
    const marker = document.createElement("span");
    marker.className = "qa-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = "+";
    summary.append(category, question, marker);

    const body = document.createElement("div");
    body.className = "qa-body";

    const meta = document.createElement("div");
    meta.className = "qa-meta";
    meta.append(
      createPill(item.confidence, confidenceClass(item.confidence)),
      createPill(`Source snapshot · ${library.sourceDate}`)
    );

    const answer = document.createElement("p");
    answer.className = "qa-answer";
    answer.textContent = item.answer;

    const wording = document.createElement("div");
    wording.className = "advisor-wording";
    const wordingLabel = document.createElement("span");
    wordingLabel.textContent = "Customer-safe starting point";
    const wordingText = document.createElement("p");
    wordingText.textContent = `“${item.advisorWording}”`;
    wording.append(wordingLabel, wordingText);

    const sources = document.createElement("div");
    sources.className = "qa-sources";
    const sourcesLabel = document.createElement("strong");
    sourcesLabel.textContent = "Grounded in:";
    sources.appendChild(sourcesLabel);
    item.sourceIds.forEach(function (id) {
      if (referenceById[id]) sources.appendChild(sourceLink(referenceById[id], true));
    });

    body.append(meta, answer, wording, sources);
    details.append(summary, body);
    return details;
  }

  function searchableText(item) {
    return [item.category, item.question, item.answer, item.advisorWording, item.confidence]
      .join(" ")
      .toLowerCase();
  }

  function renderQuestions() {
    const query = elements.search.value.trim().toLowerCase();
    const category = elements.category.value;
    const matches = library.items.filter(function (item) {
      const categoryMatches = category === "all" || item.category === category;
      const queryMatches = !query || searchableText(item).includes(query);
      return categoryMatches && queryMatches;
    });

    elements.results.replaceChildren();
    matches.forEach(function (item) { elements.results.appendChild(createQuestion(item)); });
    elements.count.textContent = `${matches.length} of ${library.items.length} questions shown`;
    elements.empty.hidden = matches.length !== 0;
  }

  function renderCategoryOptions() {
    const categories = Array.from(new Set(library.items.map(function (item) { return item.category; }))).sort();
    categories.forEach(function (category) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      elements.category.appendChild(option);
    });
  }

  function renderServiceCatalog() {
    elements.serviceCatalog.replaceChildren();
    library.serviceCatalog.forEach(function (service) {
      const card = document.createElement("article");
      card.className = "service-catalog-card";
      const heading = document.createElement("h3");
      heading.textContent = service.system;
      const titles = document.createElement("p");
      titles.className = "source-titles";
      titles.textContent = service.sourceTitles.join(" · ");
      const focus = document.createElement("p");
      focus.textContent = service.advisorFocus;
      card.append(heading, titles, focus);
      elements.serviceCatalog.appendChild(card);
    });
  }

  function renderSources() {
    elements.sourceDate.textContent = `Source snapshot · ${library.sourceDate}`;
    elements.sourceLibrary.replaceChildren();
    library.references.forEach(function (reference) {
      elements.sourceLibrary.appendChild(sourceLink(reference, false));
    });
  }

  function clearFilters() {
    elements.search.value = "";
    elements.category.value = "all";
    renderQuestions();
    elements.search.focus();
  }

  elements.search.addEventListener("input", renderQuestions);
  elements.category.addEventListener("change", renderQuestions);
  elements.clear.addEventListener("click", clearFilters);
  elements.emptyClear.addEventListener("click", clearFilters);

  fetch("content/qa-reference.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error(`Reference source returned ${response.status}`);
      return response.json();
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.items) || !Array.isArray(data.references)) {
        throw new Error("Reference source is incomplete");
      }
      library = data;
      referenceById = Object.fromEntries(library.references.map(function (reference) {
        return [reference.id, reference];
      }));
      renderEligibility();
      renderCategoryOptions();
      renderQuestions();
      renderServiceCatalog();
      renderSources();
      elements.loadStatus.hidden = true;
      app.hidden = false;
    })
    .catch(function (error) {
      elements.loadStatus.classList.remove("callout-blue");
      elements.loadStatus.classList.add("callout-amber");
      elements.loadStatus.textContent = "The reference library could not be loaded. Return to the module map and try again, or use the current authenticated BG source before advising a customer.";
      console.warn("[bg-reference]", error);
    });
})();
