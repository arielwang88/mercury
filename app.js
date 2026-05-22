(function () {
  const STORAGE_KEY = "mercury-brief-state";
  const CATEGORY_RULES = [
    ["blockers", /\b(blocked|blocker|blocking|stuck|waiting on|dependency|cannot proceed)\b/i],
    ["risks", /\b(risk|at risk|concern|slip|delay|late|scope|capacity|regression)\b/i],
    ["decisions", /\b(decision|decide|approved|approval|align|tradeoff|go\/no-go|sign[- ]off)\b/i],
    ["actions", /\b(action|todo|next|follow up|owner|eta|due|by eod|by friday|assigned)\b/i],
    ["updates", /\b(done|shipped|complete|progress|status|merged|launched|updated|resolved)\b/i]
  ];

  const EXAMPLE_NOTES = `Slack: API contract for checkout metrics is approved by Priya; backend can proceed.
Standup: Onboarding copy refresh is complete and design QA found two small spacing issues.
Jira: PAY-1842 is blocked waiting on legal review for the tax disclosure language.
Meeting: Risk that analytics validation slips if event mapping is not ready by Friday.
Action: Jordan owns follow-up with data eng by EOD.
Decision needed: confirm whether beta launch stays at 20% traffic or moves to 50%.`;

  const emptyBrief = () => ({
    updates: [],
    actions: [],
    risks: [],
    blockers: [],
    decisions: []
  });

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

  function buildBriefText(projectName, brief) {
    const project = projectName.trim() || "Project";
    return `${project} status update

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

  function renderBrief(projectName, rawNotes) {
    const brief = parseNotes(rawNotes);
    const [health, detail] = calculateHealth(brief);

    document.getElementById("briefTitle").textContent = projectName.trim() || "Daily TPM brief";
    document.getElementById("healthScore").textContent = health;
    document.getElementById("healthDetail").textContent = detail;
    renderList("updatesList", brief.updates);
    renderList("actionsList", brief.actions);
    renderList("risksList", brief.risks);
    renderList("blockersList", brief.blockers);
    renderList("decisionsList", brief.decisions);
    document.getElementById("briefOutput").value = buildBriefText(projectName, brief);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectName, rawNotes }));
  }

  function restoreState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      renderBrief("", "");
      return;
    }

    try {
      const state = JSON.parse(saved);
      document.getElementById("projectName").value = state.projectName || "";
      document.getElementById("rawNotes").value = state.rawNotes || "";
      renderBrief(state.projectName || "", state.rawNotes || "");
    } catch {
      renderBrief("", "");
    }
  }

  function wireApp() {
    const form = document.getElementById("briefForm");
    const projectInput = document.getElementById("projectName");
    const notesInput = document.getElementById("rawNotes");
    const copyStatus = document.getElementById("copyStatus");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      copyStatus.textContent = "";
      renderBrief(projectInput.value, notesInput.value);
    });

    document.getElementById("loadExample").addEventListener("click", () => {
      projectInput.value = "Checkout readiness";
      notesInput.value = EXAMPLE_NOTES;
      renderBrief(projectInput.value, notesInput.value);
    });

    document.getElementById("clearBrief").addEventListener("click", () => {
      projectInput.value = "";
      notesInput.value = "";
      localStorage.removeItem(STORAGE_KEY);
      copyStatus.textContent = "";
      renderBrief("", "");
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
      parseNotes
    };
  }

  if (typeof document !== "undefined") {
    wireApp();
  }
})();
