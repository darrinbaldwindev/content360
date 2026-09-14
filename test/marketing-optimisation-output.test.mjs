import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMarketingOptimisationOutput } from '../src/marketing-optimisation-output.mjs';

const parsed = Object.freeze({
  claim_id: 'agentos-user-control',
  source_receipt: 'Overseer#23:5665976073',
  source_revision: 1,
  evidence_class: 'DEMONSTRABLE',
  content: 'AgentOS keeps the user in control with bounded approvals.',
  prohibited_leaps: Object.freeze(['validated-customer-demand','production-autonomy']),
  publication_authority: false,
  network_authority: false,
  canonical_memory_authority: false,
});

function validOutput(overrides = {}) {
  return {
    claim_id: parsed.claim_id,
    source_receipt: parsed.source_receipt,
    source_revision: parsed.source_revision,
    evidence_class: parsed.evidence_class,
    content: 'AgentOS keeps people in control while coordinating bounded AI work.',
    prohibited_leaps: [...parsed.prohibited_leaps],
    publication_authority: false,
    network_authority: false,
    ...overrides,
  };
}

test('accepts bounded transformed copy without widening authority', () => {
  const result = validateMarketingOptimisationOutput(parsed, validOutput());
  assert.equal(result.evidence_class, 'DEMONSTRABLE');
  assert.equal(result.publication_authority, false);
  assert.equal(result.network_authority, false);
  assert.equal(result.canonical_memory_authority, false);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.prohibited_leaps));
});

test('optimised copy cannot promote evidence class', () => {
  assert.throws(() => validateMarketingOptimisationOutput(parsed, validOutput({ evidence_class: 'VALIDATED' })), /cannot exceed parsed envelope/);
});

test('optimised copy cannot drop source prohibited leaps', () => {
  assert.throws(() => validateMarketingOptimisationOutput(parsed, validOutput({ prohibited_leaps: ['validated-customer-demand'] })), /cannot drop source restrictions/);
});

test('optimised copy cannot change exact source correlation', () => {
  assert.throws(() => validateMarketingOptimisationOutput(parsed, validOutput({ claim_id: 'other-claim' })), /claim_id does not match/);
  assert.throws(() => validateMarketingOptimisationOutput(parsed, validOutput({ source_receipt: 'forged' })), /source_receipt does not match/);
  assert.throws(() => validateMarketingOptimisationOutput(parsed, validOutput({ source_revision: 2 })), /source_revision does not match/);
});

test('optimised copy cannot grant publication or network authority', () => {
  assert.throws(() => validateMarketingOptimisationOutput(parsed, validOutput({ publication_authority: true })), /publication authority must remain false/);
  assert.throws(() => validateMarketingOptimisationOutput(parsed, validOutput({ network_authority: true })), /network authority must remain false/);
});

test('credential-like or unsupported output metadata fails closed', () => {
  assert.throws(() => validateMarketingOptimisationOutput(parsed, validOutput({ api_token: 'opaque' })), /credential-like fields/);
  assert.throws(() => validateMarketingOptimisationOutput(parsed, validOutput({ approval: 'publish-now' })), /unsupported fields/);
});
