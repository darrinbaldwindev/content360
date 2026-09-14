import assert from 'node:assert/strict';
import test from 'node:test';
import { createContent360Request, MockContent360Adapter, validateContent360Result } from '../src/content360-adapter.mjs';

test('secret-like constructor metadata fails closed instead of entering request state', () => {
  for (const field of ['api_key', 'access_token', 'client_secret']) {
    assert.throws(
      () => createContent360Request({
        mission_id: `secret-meta-${field}`,
        task_id: 't-secret-meta',
        operation: 'OPTIMISE',
        content: 'draft',
        [field]: 'synthetic-placeholder',
      }),
      error => error.code === 'CONTENT360_REQUEST_INTEGRITY' && /unsupported fields/.test(error.message),
    );
  }
});

test('approval metadata cannot carry secret-like fields', () => {
  for (const field of ['api_key', 'access_token', 'client_secret']) {
    assert.throws(
      () => createContent360Request({
        mission_id: `secret-approval-${field}`,
        task_id: 't-secret-approval',
        operation: 'PUBLISH',
        content: 'draft',
        approval: {
          approved: true,
          approval_ref: 'SYNTHETIC-APPROVAL',
          [field]: 'synthetic-placeholder',
        },
      }),
      error => error.code === 'CONTENT360_REQUEST_INTEGRITY' && /approval metadata contains unsupported fields/.test(error.message),
    );
  }
});

test('result metadata cannot carry credential or publication-authority claims', async () => {
  const adapter = new MockContent360Adapter();
  const request = createContent360Request({
    mission_id: 'secret-result',
    task_id: 't-secret-result',
    operation: 'OPTIMISE',
    content: 'draft',
  });
  const result = await adapter.execute(request);
  for (const forgedField of [
    { api_key: 'synthetic-placeholder' },
    { access_token: 'synthetic-placeholder' },
    { publication_authority: true },
  ]) {
    assert.throws(
      () => validateContent360Result({ ...result, ...forgedField }, request),
      error => error.code === 'CONTENT360_RESULT_INTEGRITY' && /unsupported fields/.test(error.message),
    );
  }
});

test('synthetic approval reference is never copied into mock result output', async () => {
  const adapter = new MockContent360Adapter();
  const request = createContent360Request({
    mission_id: 'approval-isolation',
    task_id: 't-approval-isolation',
    operation: 'PUBLISH',
    content: 'draft',
    approval: { approved: true, approval_ref: 'SYNTHETIC-APPROVAL-REF' },
  });
  await assert.rejects(() => adapter.execute(request), error => error.code === 'CONTENT360_SIDE_EFFECT_DISABLED');

  const optimiseRequest = createContent360Request({
    mission_id: 'approval-isolation-read',
    task_id: 't-approval-isolation-read',
    operation: 'OPTIMISE',
    content: 'draft',
  });
  const result = await adapter.execute(optimiseRequest);
  assert.equal(Object.hasOwn(result, 'approval_ref'), false);
  assert.equal(result.output.includes('SYNTHETIC-APPROVAL-REF'), false);
  assert.equal(result.side_effect_performed, false);
});
