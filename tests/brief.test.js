const assert = require("node:assert/strict");
const {
  buildBriefText,
  calculateHealth,
  classifyLine,
  EXAMPLE_SOURCES,
  formatDateLabel,
  parseNotes
} = require("../app");

const mockNotes = `Slack: Checkout event mapping is complete and analytics confirmed coverage.
Meeting: Risk that launch slips if legal does not approve tax copy by Friday.
Jira: PAY-1842 is blocked waiting on policy review.
Standup: Action for Maya to follow up with data eng by EOD.
Decision needed: confirm beta rollout remains at 20% traffic.`;

const brief = parseNotes(mockNotes);

assert.equal(classifyLine("Jira says this is blocked on legal review"), "blockers");
assert.equal(classifyLine("Decision needed on rollout size"), "decisions");
assert.equal(classifyLine("Action: follow up by EOD"), "actions");

assert.deepEqual(brief.updates, [
  "Slack: Checkout event mapping is complete and analytics confirmed coverage."
]);
assert.deepEqual(brief.risks, [
  "Meeting: Risk that launch slips if legal does not approve tax copy by Friday."
]);
assert.deepEqual(brief.blockers, [
  "Jira: PAY-1842 is blocked waiting on policy review."
]);
assert.deepEqual(brief.actions, [
  "Standup: Action for Maya to follow up with data eng by EOD."
]);
assert.deepEqual(brief.decisions, [
  "Decision needed: confirm beta rollout remains at 20% traffic."
]);

const [health, detail] = calculateHealth(brief);
assert.equal(health, "Blocked");
assert.match(detail, /1 blocker/);

const output = buildBriefText("Checkout readiness", brief, "2026-05-22");
assert.match(output, /Checkout readiness status update - May 22, 2026/);
assert.match(output, /PAY-1842 is blocked/);
assert.match(output, /confirm beta rollout/);
assert.equal(formatDateLabel("2026-05-22"), "May 22, 2026");

for (const [sourceName, example] of Object.entries(EXAMPLE_SOURCES)) {
  const parsed = parseNotes(example.notes);
  assert.equal(typeof example.projectName, "string");
  assert.ok(example.projectName.length > 0, `${sourceName} has a project name`);
  assert.ok(example.notes.length > 0, `${sourceName} has notes`);
  assert.ok(parsed.updates.length > 0, `${sourceName} includes an update`);
  assert.ok(parsed.actions.length > 0, `${sourceName} includes an action`);
  assert.ok(parsed.risks.length > 0, `${sourceName} includes a risk`);
  assert.ok(parsed.blockers.length > 0, `${sourceName} includes a blocker`);
  assert.ok(parsed.decisions.length > 0, `${sourceName} includes a decision`);
}

console.log("Mercury Brief tests passed.");
