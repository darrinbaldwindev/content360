import crypto from 'node:crypto';

const ALLOWED_OPERATIONS = new Set(['READ', 'OPTIMISE', 'PUBLISH', 'SCHEDULE']);
const REQUEST_INPUT_KEYS = new Set(['mission_id', 'task_id', 'operation', 'content', 'approval']);
const APPROVAL_KEYS = new Set(['approved', 'approval_ref']);
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
const RESULT_KEYS = new Set([
  'kind',
  'mission_id',
  'task_id',
  'correlation_id',
  'idempotency_key',
  'operation',
  'status',
  'side_effect_performed',
  'output',
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

function resultIntegrityError(message) {
  const error = new Error(message);
  error.code = 'CONTENT360_RESULT_INTEGRITY';
  return error;
}

function rejectUnknownKeys(value, allowedKeys, label, errorFactory = integrityError) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const unknownKeys = Object.keys(value).filter(key => !allowedKeys.has(key));
  if (unknownKeys.length > 0) {
    throw errorFactory(`${label} contains unsupported fields: ${unknownKeys.sort().join(',')}`);
  }
}

function validateRequestIntegrity(request) {
  if (!request || request.kind !== 'content360.request') throw new TypeError('invalid request');

  rejectUnknownKeys(request, REQUEST_KEYS, 'request');

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

export function validateContent360Result(result, request) {
  validateRequestIntegrity(request);
  if (!result || typeof result !== 'object' || Array.isArray(result) || result.kind !== 'content360.result') {
    throw resultIntegrityError('invalid result');
  }
  rejectUnknownKeys(result, RESULT_KEYS, 'result', resultIntegrityError);

  for (const field of ['mission_id', 'task_id', 'correlation_id', 'idempotency_key', 'operation']) {
    if (result[field] !== request[field]) {
      throw resultIntegrityError(`result ${field} mismatch`);
    }
  }
  if (result.status !== 'SUCCEEDED') {
    throw resultIntegrityError('result status is not supported by the mock success contract');
  }
  if (result.side_effect_performed !== false) {
    throw resultIntegrityError('mock result cannot claim a side effect');
  }
  if (typeof result.output !== 'string') {
    throw resultIntegrityError('result output must be a string');
  }
  return true;
}

export function createContent360Request(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('request input is required');
  }
  rejectUnknownKeys(input, REQUEST_INPUT_KEYS, 'request input');

  let { mission_id, task_id, operation, content, approval = null } = input;
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
  if (approval !== null) {
    if (typeof approval !== 'object' || Array.isArray(approval)) {
      throw integrityError('approval metadata must be an object');
    }
    rejectUnknownKeys(approval, APPROVAL_KEYS, 'approval metadata');
  }
  if (side_effecting) {
    if (approval?.approved !== true) {
      const error = new Error('explicit approval required');
      error.code = 'CONTENT360_APPROVAL_REQUIRED';
      throw error;
    }
    approval_ref = requireString(approval.approval_ref, 'approval_ref');
  } else if (approval !== null) {
    throw integrityError('non-side-effecting request must not carry approval metadata');
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
    if (existing) {
      validateContent360Result(existing, request);
      return existing;
    }

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

    validateContent360Result(result, request);
    this.#results.set(request.idempotency_key, result);
    return result;
  }
}
