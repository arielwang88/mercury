export const EXAMPLE_SOURCES = {
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

const CATEGORY_RULES = [
  ["blockers", /\b(blocked|blocker|blocking|stuck|waiting on|dependency|cannot proceed)\b/i],
  ["risks", /\b(risk|at risk|concern|slip|delay|late|scope|capacity|regression)\b/i],
  ["decisions", /\b(decision|decide|approved|approval|align|tradeoff|go\/no-go|sign[- ]off)\b/i],
  ["actions", /\b(action|todo|next|follow up|owner|eta|due|by eod|by friday|assigned)\b/i],
  ["updates", /\b(done|shipped|complete|progress|status|merged|launched|updated|resolved)\b/i]
];

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

export function classifyLine(line) {
  for (const [category, pattern] of CATEGORY_RULES) {
    if (pattern.test(line)) {
      return category;
    }
  }
  return "updates";
}

export function parseNotes(rawNotes) {
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

export function formatDateLabel(dateValue) {
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

function formatList(items) {
  if (!items.length) {
    return "- None captured";
  }
  return items.map((item) => `- ${item}`).join("\n");
}

export function buildBriefText(projectName, brief, updateDate = "") {
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

export function calculateHealth(brief) {
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

export function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateFromValue(dateValue) {
  return new Date(`${dateValue || getTodayValue()}T00:00:00`);
}
