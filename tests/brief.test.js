const assert = require("node:assert/strict");
const { buildBriefText, calculateHealth, classifyLine, parseNotes } = require("../app");

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

const output = buildBriefText("Checkout readiness", brief);
assert.match(output, /Checkout readiness status update/);
assert.match(output, /PAY-1842 is blocked/);
assert.match(output, /confirm beta rollout/);

console.log("Mercury Brief tests passed.");
