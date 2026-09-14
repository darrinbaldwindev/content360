import crypto from 'node:crypto';

const ALLOWED_OPERATIONS = new Set(['READ', 'OPTIMISE', 'PUBLISH', 'SCHEDULE']);
const REQUEST_KEYS = new Set([
  'kind',
  'mission_id',
  'task_id',
  'correlation_id',
  'idempotency_key',
  'operation',
  'side_effecting',
  'content',
  'approval_ref',
]);

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${name} is required`);
  }
  return value.trim();
}

function stableId(parts) {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

function integrityError(message) {
  const error = new Error(message);
  error.code = 'CONTENT360_REQUEST_INTEGRITY';
  return error;
}

function validateRequestIntegrity(request) {
  if (!request || request.kind !== 'content360.request') throw new TypeError('invalid request');

  const unknownKeys = Object.keys(request).filter(key => !REQUEST_KEYS.has(key));
  if (unknownKeys.length > 0) {
    throw integrityError(`request contains unsupported fields: ${unknownKeys.sort().join(',')}`);
  }

  const mission_id = requireString(request.mission_id, 'mission_id');
  const task_id = requireString(request.task_id, 'task_id');
  const operation = requireString(request.operation, 'operation').toUpperCase();
  if (!ALLOWED_OPERATIONS.has(operation)) throw new TypeError('unsupported operation');

  const expected_side_effecting = operation === 'PUBLISH' || operation === 'SCHEDULE';
  if (request.side_effecting !== expected_side_effecting) {
    throw integrityError('request side-effect metadata mismatch');
  }

  if (expected_side_effecting) {
    try {
      requireString(request.approval_ref, 'approval_ref');
    } catch {
      throw integrityError('side-effecting request approval metadata mismatch');
    }
  } else if (request.approval_ref !== null) {
    throw integrityError('non-side-effecting request must not carry approval metadata');
  }

  const expected_correlation_id = stableId([mission_id, task_id, operation]);
  if (request.correlation_id !== expected_correlation_id) {
    throw integrityError('request correlation mismatch');
  }

  const expected_idempotency_key = stableId([expected_correlation_id, request.content ?? '']);
  if (request.idempotency_key !== expected_idempotency_key) {
    throw integrityError('request idempotency mismatch');
  }
}

export function createContent360Request({ mission_id, task_id, operation, content, approval = null }) {
  mission_id = requireString(mission_id, 'mission_id');
  task_id = requireString(task_id, 'task_id');
  operation = requireString(operation, 'operation').toUpperCase();
  if (!ALLOWED_OPERATIONS.has(operation)) throw new TypeError('unsupported operation');

  if ((operation === 'OPTIMISE' || operation === 'PUBLISH' || operation === 'SCHEDULE') &&
      (typeof content !== 'string' || content.trim() === '')) {
    throw new TypeError('content is required');
  }

  const side_effecting = operation === 'PUBLISH' || operation === 'SCHEDULE';
  let approval_ref = null;
  if (side_effecting) {
    if (approval?.approved !== true) {
      const error = new Error('explicit approval required');
      error.code = 'CONTENT360_APPROVAL_REQUIRED';
      throw error;
    }
    approval_ref = requireString(approval.approval_ref, 'approval_ref');
  }

  const correlation_id = stableId([mission_id, task_id, operation]);
  const idempotency_key = stableId([correlation_id, content ?? '']);

  return Object.freeze({
    kind: 'content360.request',
    mission_id,
    task_id,
    correlation_id,
    idempotency_key,
    operation,
    side_effecting,
    content: content ?? null,
    approval_ref,
  });
}

export class MockContent360Adapter {
  #results = new Map();

  probeCapabilities() {
    const operations = Object.freeze({
      READ: true,
      OPTIMISE: true,
      PUBLISH: false,
      SCHEDULE: false,
    });
    return Object.freeze({
      kind: 'content360.capabilities',
      network_enabled: false,
      operations,
    });
  }

  async execute(request) {
    validateRequestIntegrity(request);

    const existing = this.#results.get(request.idempotency_key);
    if (existing) return existing;

    if (request.operation === 'PUBLISH' || request.operation === 'SCHEDULE') {
      const error = new Error('side-effecting operations disabled in mock adapter');
      error.code = 'CONTENT360_SIDE_EFFECT_DISABLED';
      throw error;
    }

    if (request.content?.includes('[SIMULATE_API_FAILURE]')) {
      const error = new Error('simulated Content360 API failure');
      error.code = 'CONTENT360_API_FAILURE';
      throw error;
    }

    const result = Object.freeze({
      kind: 'content360.result',
      mission_id: request.mission_id,
      task_id: request.task_id,
      correlation_id: request.correlation_id,
      idempotency_key: request.idempotency_key,
      operation: request.operation,
      status: 'SUCCEEDED',
      side_effect_performed: false,
      output: request.operation === 'OPTIMISE'
        ? `MOCK_OPTIMISED:${request.content}`
        : 'MOCK_READ_OK',
    });

    this.#results.set(request.idempotency_key, result);
    return result;
  }
}
