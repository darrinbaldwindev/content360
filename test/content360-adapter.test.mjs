import assert from 'node:assert/strict';
import test from 'node:test';
import { createContent360Request, MockContent360Adapter } from '../src/content360-adapter.mjs';

test('mock optimise preserves mission/task correlation', async () => {
  const adapter = new MockContent360Adapter();
  const req = createContent360Request({ mission_id: 'm-1', task_id: 't-1', operation: 'OPTIMISE', content: 'draft' });
  const result = await adapter.execute(req);
  assert.equal(result.mission_id, 'm-1');
  assert.equal(result.task_id, 't-1');
  assert.equal(result.correlation_id, req.correlation_id);
  assert.equal(result.side_effect_performed, false);
  assert.equal(result.status, 'SUCCEEDED');
});

test('duplicate optimise retry is idempotent', async () => {
  const adapter = new MockContent360Adapter();
  const req = createContent360Request({ mission_id: 'm-2', task_id: 't-2', operation: 'OPTIMISE', content: 'same' });
  const first = await adapter.execute(req);
  const second = await adapter.execute(req);
  assert.equal(second, first);
});

test('publish requires explicit approval before adapter invocation', () => {
  assert.throws(
    () => createContent360Request({ mission_id: 'm-3', task_id: 't-3', operation: 'PUBLISH', content: 'x' }),
    error => error.code === 'CONTENT360_APPROVAL_REQUIRED'
  );
});

test('publish requires non-empty approval reference when approval is asserted', () => {
  assert.throws(
    () => createContent360Request({
      mission_id: 'm-3b', task_id: 't-3b', operation: 'PUBLISH', content: 'x',
      approval: { approved: true, approval_ref: '   ' }
    }),
    error => error instanceof TypeError && error.message === 'approval_ref is required'
  );
});

test('publish remains disabled even with synthetic approval', async () => {
  const adapter = new MockContent360Adapter();
  const req = createContent360Request({
    mission_id: 'm-4', task_id: 't-4', operation: 'PUBLISH', content: 'x',
    approval: { approved: true, approval_ref: 'TEST-APPROVAL' }
  });
  await assert.rejects(() => adapter.execute(req), error => error.code === 'CONTENT360_SIDE_EFFECT_DISABLED');
});

test('API failure cannot become completion', async () => {
  const adapter = new MockContent360Adapter();
  const req = createContent360Request({
    mission_id: 'm-5', task_id: 't-5', operation: 'OPTIMISE', content: '[SIMULATE_API_FAILURE]'
  });
  await assert.rejects(() => adapter.execute(req), error => error.code === 'CONTENT360_API_FAILURE');
});

test('capability probe declares no network and no publish/schedule capability', () => {
  const caps = new MockContent360Adapter().probeCapabilities();
  assert.equal(caps.network_enabled, false);
  assert.equal(caps.operations.OPTIMISE, true);
  assert.equal(caps.operations.PUBLISH, false);
  assert.equal(caps.operations.SCHEDULE, false);
});

test('forged correlation id fails closed before execution', async () => {
  const adapter = new MockContent360Adapter();
  const req = createContent360Request({ mission_id: 'm-6', task_id: 't-6', operation: 'OPTIMISE', content: 'draft' });
  const forged = { ...req, correlation_id: 'forged-correlation' };
  await assert.rejects(() => adapter.execute(forged), error => error.code === 'CONTENT360_REQUEST_INTEGRITY');
});

test('forged idempotency key fails closed before replay lookup', async () => {
  const adapter = new MockContent360Adapter();
  const req = createContent360Request({ mission_id: 'm-7', task_id: 't-7', operation: 'OPTIMISE', content: 'draft' });
  const forged = { ...req, idempotency_key: 'forged-idempotency' };
  await assert.rejects(() => adapter.execute(forged), error => error.code === 'CONTENT360_REQUEST_INTEGRITY');
});

test('forged side-effect metadata fails closed', async () => {
  const adapter = new MockContent360Adapter();
  const req = createContent360Request({ mission_id: 'm-8', task_id: 't-8', operation: 'OPTIMISE', content: 'draft' });
  const forged = { ...req, side_effecting: true };
  await assert.rejects(() => adapter.execute(forged), error => error.code === 'CONTENT360_REQUEST_INTEGRITY');
});
