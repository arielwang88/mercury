(function () {
  const STORAGE_KEY = "mercury-brief-state";
  const CATEGORY_RULES = [
    ["blockers", /\b(blocked|blocker|blocking|stuck|waiting on|dependency|cannot proceed)\b/i],
    ["risks", /\b(risk|at risk|concern|slip|delay|late|scope|capacity|regression)\b/i],
    ["decisions", /\b(decision|decide|approved|approval|align|tradeoff|go\/no-go|sign[- ]off)\b/i],
    ["actions", /\b(action|todo|next|follow up|owner|eta|due|by eod|by friday|assigned)\b/i],
    ["updates", /\b(done|shipped|complete|progress|status|merged|launched|updated|resolved)\b/i]
  ];

  const EXAMPLE_SOURCES = {
    meeting: {
      projectName: "Partner launch readiness",
      notes: `Meeting: Partner reporting test plan is complete and backend can proceed.
Meeting: Risk that analytics validation slips if event mapping is not ready by Friday.
Decision needed: confirm whether beta launch stays at 20% traffic or moves to 50%.
Action: Jordan owns follow-up with data eng by EOD.
Meeting: Legal sign-off is still waiting on tax disclosure language.`
    },
    jira: {
      projectName: "Checkout quality gate",
      notes: `Jira PAY-1842 is blocked waiting on policy review for tax disclosure language.
Jira PAY-1901 checkout fix is resolved and merged into the release branch.
Jira PAY-1888 risk: capacity is tight for final analytics QA.
Jira PAY-1770 action assigned to Maya with ETA Friday.
Jira decision needed: approve go/no-go criteria for beta expansion.`
    },
    slackThread: {
      projectName: "Onboarding refresh",
      notes: `Slack thread: Design QA is complete and two spacing issues are updated.
Slack thread: Concern that mobile copy review may delay launch readiness.
Slack thread: Backend is blocked by missing final redirect URL from web.
Slack thread: Alex owns follow up with web by EOD.
Slack thread: Decision needed on whether to keep the existing success page.`
    },
    chat: {
      projectName: "Data pipeline handoff",
      notes: `Chat: Daily export job shipped to staging and smoke checks passed.
Chat: Data eng is waiting on source table access before backfill can proceed.
Chat: Risk that the dashboard launch slips if historical counts are late.
Chat: Next action for Sam to file access request by Friday.
Chat: Approval needed from finance on metric naming.`
    }
  };

  const emptyBrief = () => ({
    updates: [],
    actions: [],
    risks: [],
    blockers: [],
    decisions: []
  });

  function getTodayValue() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDateLabel(dateValue) {
    if (!dateValue) {
      return "Today";
    }

    const date = new Date(`${dateValue}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function normalizeLine(line) {
    return line.replace(/^[-*\d.\s]+/, "").replace(/\s+/g, " ").trim();
  }

  function classifyLine(line) {
    for (const [category, pattern] of CATEGORY_RULES) {
      if (pattern.test(line)) {
        return category;
      }
    }
    return "updates";
  }

  function parseNotes(rawNotes) {
    const brief = emptyBrief();
    rawNotes
      .split(/\r?\n/)
      .map(normalizeLine)
      .filter(Boolean)
      .forEach((line) => {
        brief[classifyLine(line)].push(line);
      });
    return brief;
  }

  function formatList(items) {
    if (!items.length) {
      return "- None captured";
    }
    return items.map((item) => `- ${item}`).join("\n");
  }

  function buildBriefText(projectName, brief, updateDate = "") {
    const project = projectName.trim() || "Project";
    return `${project} status update - ${formatDateLabel(updateDate)}

Updates
${formatList(brief.updates)}

Actions
${formatList(brief.actions)}

Risks
${formatList(brief.risks)}

Blockers
${formatList(brief.blockers)}

Decisions needed
${formatList(brief.decisions)}`;
  }

  function calculateHealth(brief) {
    const blockerCount = brief.blockers.length;
    const riskCount = brief.risks.length;
    if (blockerCount > 0) {
      return ["Blocked", `${blockerCount} blocker${blockerCount === 1 ? "" : "s"} need attention.`];
    }
    if (riskCount > 1) {
      return ["Watch", `${riskCount} risks should be tracked today.`];
    }
    if (brief.actions.length || brief.updates.length) {
      return ["On track", "The update has action and progress signal."];
    }
    return ["Ready", "Paste notes to build a project pulse."];
  }

  function renderList(id, items) {
    const list = document.getElementById(id);
    list.innerHTML = "";
    const visibleItems = items.length ? items : ["None captured"];
    visibleItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function renderBrief(projectName, rawNotes, updateDate) {
    const brief = parseNotes(rawNotes);
    const [health, detail] = calculateHealth(brief);

    document.getElementById("briefTitle").textContent = projectName.trim() || "Daily TPM brief";
    document.getElementById("briefDate").textContent = formatDateLabel(updateDate);
    document.getElementById("briefDateInput").value = updateDate || "";
    document.getElementById("healthScore").textContent = health;
    document.getElementById("healthDetail").textContent = detail;
    renderList("updatesList", brief.updates);
    renderList("actionsList", brief.actions);
    renderList("risksList", brief.risks);
    renderList("blockersList", brief.blockers);
    renderList("decisionsList", brief.decisions);
    document.getElementById("briefOutput").value = buildBriefText(projectName, brief, updateDate);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectName, rawNotes, updateDate }));
  }

  function restoreState() {
    const dateInput = document.getElementById("updateDate");
    const briefDateInput = document.getElementById("briefDateInput");
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      dateInput.value = getTodayValue();
      briefDateInput.value = dateInput.value;
      renderBrief("", "", dateInput.value);
      return;
    }

    try {
      const state = JSON.parse(saved);
      document.getElementById("projectName").value = state.projectName || "";
      document.getElementById("rawNotes").value = state.rawNotes || "";
      dateInput.value = state.updateDate || getTodayValue();
      briefDateInput.value = dateInput.value;
      renderBrief(state.projectName || "", state.rawNotes || "", dateInput.value);
    } catch {
      dateInput.value = getTodayValue();
      briefDateInput.value = dateInput.value;
      renderBrief("", "", dateInput.value);
    }
  }

  function wireApp() {
    const form = document.getElementById("briefForm");
    const projectInput = document.getElementById("projectName");
    const dateInput = document.getElementById("updateDate");
    const briefDateInput = document.getElementById("briefDateInput");
    const notesInput = document.getElementById("rawNotes");
    const exampleSelect = document.getElementById("exampleSource");
    const copyStatus = document.getElementById("copyStatus");

    function syncAndRenderFromDate(dateValue) {
      dateInput.value = dateValue;
      briefDateInput.value = dateValue;
      copyStatus.textContent = "";
      renderBrief(projectInput.value, notesInput.value, dateValue);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      copyStatus.textContent = "";
      renderBrief(projectInput.value, notesInput.value, dateInput.value);
    });

    dateInput.addEventListener("change", () => {
      syncAndRenderFromDate(dateInput.value || getTodayValue());
    });

    briefDateInput.addEventListener("change", () => {
      syncAndRenderFromDate(briefDateInput.value || getTodayValue());
    });

    document.getElementById("loadExample").addEventListener("click", () => {
      const example = EXAMPLE_SOURCES[exampleSelect.value] || EXAMPLE_SOURCES.meeting;
      projectInput.value = example.projectName;
      notesInput.value = example.notes;
      if (!dateInput.value) {
        dateInput.value = getTodayValue();
      }
      briefDateInput.value = dateInput.value;
      renderBrief(projectInput.value, notesInput.value, dateInput.value);
    });

    document.getElementById("clearBrief").addEventListener("click", () => {
      projectInput.value = "";
      dateInput.value = getTodayValue();
      briefDateInput.value = dateInput.value;
      notesInput.value = "";
      localStorage.removeItem(STORAGE_KEY);
      copyStatus.textContent = "";
      renderBrief("", "", dateInput.value);
    });

    document.getElementById("copyBrief").addEventListener("click", async () => {
      const output = document.getElementById("briefOutput").value;
      await navigator.clipboard.writeText(output);
      copyStatus.textContent = "Brief copied.";
    });

    restoreState();
  }

  if (typeof module !== "undefined") {
    module.exports = {
      buildBriefText,
      calculateHealth,
      classifyLine,
      EXAMPLE_SOURCES,
      formatDateLabel,
      parseNotes
    };
  }

  if (typeof document !== "undefined") {
    wireApp();
  }
})();
