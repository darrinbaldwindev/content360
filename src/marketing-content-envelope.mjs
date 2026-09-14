const EVIDENCE_CLASSES = Object.freeze(['CONCEPT', 'DEMONSTRABLE', 'VALIDATED', 'PRODUCTION']);
const EVIDENCE_RANK = new Map(EVIDENCE_CLASSES.map((value, index) => [value, index]));
const ENVELOPE_KEYS = new Set([
  'source_kind',
  'source_issue',
  'source_receipt',
  'claim_id',
  'evidence_class',
  'content',
  'prohibited_leaps',
  'publication_authority',
  'network_authority',
]);
const SOURCE_RECORD_KEYS = new Set([
  'source_issue',
  'source_receipt',
  'claim_id',
  'evidence_class',
  'content',
  'prohibited_leaps',
]);
const CREDENTIAL_KEY_PATTERN = /(credential|secret|token|api[_-]?key|password|auth)/i;

function envelopeError(message) {
  const error = new Error(message);
  error.code = 'CONTENT360_MARKETING_ENVELOPE_INTEGRITY';
  return error;
}

function requirePlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw envelopeError(`${label} must be an object`);
  }
  return value;
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw envelopeError(`${label} is required`);
  }
  return value.trim();
}

function requireStringArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw envelopeError(`${label} must be a non-empty array`);
  }
  return value.map((entry, index) => requireString(entry, `${label}[${index}]`));
}

function rejectUnknownKeys(value, allowedKeys, label) {
  const keys = Object.keys(value);
  const credentialLike = keys.filter(key => CREDENTIAL_KEY_PATTERN.test(key));
  if (credentialLike.length > 0) {
    throw envelopeError(`${label} contains credential-like fields`);
  }
  const unknown = keys.filter(key => !allowedKeys.has(key));
  if (unknown.length > 0) {
    throw envelopeError(`${label} contains unsupported fields: ${unknown.sort().join(',')}`);
  }
}

function validateEvidenceClass(value, label) {
  const evidenceClass = requireString(value, label).toUpperCase();
  if (!EVIDENCE_RANK.has(evidenceClass)) {
    throw envelopeError(`${label} is unsupported`);
  }
  return evidenceClass;
}

export function parseMarketingContentEnvelope(envelope, sourceRecord) {
  requirePlainObject(envelope, 'envelope');
  requirePlainObject(sourceRecord, 'source record');
  rejectUnknownKeys(envelope, ENVELOPE_KEYS, 'envelope');
  rejectUnknownKeys(sourceRecord, SOURCE_RECORD_KEYS, 'source record');

  if (envelope.source_kind !== 'marketing.evidence_label') {
    throw envelopeError('source_kind must be marketing.evidence_label');
  }

  const source_issue = requireString(envelope.source_issue, 'source_issue');
  const source_receipt = requireString(envelope.source_receipt, 'source_receipt');
  const claim_id = requireString(envelope.claim_id, 'claim_id');
  const content = requireString(envelope.content, 'content');
  const evidence_class = validateEvidenceClass(envelope.evidence_class, 'evidence_class');
  const prohibited_leaps = requireStringArray(envelope.prohibited_leaps, 'prohibited_leaps');

  if (envelope.publication_authority !== false) {
    throw envelopeError('publication authority must remain false');
  }
  if (envelope.network_authority !== false) {
    throw envelopeError('network authority must remain false');
  }

  const sourceEvidenceClass = validateEvidenceClass(sourceRecord.evidence_class, 'source record evidence_class');
  const exactSourceFields = {
    source_issue: requireString(sourceRecord.source_issue, 'source record source_issue'),
    source_receipt: requireString(sourceRecord.source_receipt, 'source record source_receipt'),
    claim_id: requireString(sourceRecord.claim_id, 'source record claim_id'),
  };
  for (const [field, expected] of Object.entries(exactSourceFields)) {
    if ({ source_issue, source_receipt, claim_id }[field] !== expected) {
      throw envelopeError(`${field} does not match source record`);
    }
  }

  if (EVIDENCE_RANK.get(evidence_class) > EVIDENCE_RANK.get(sourceEvidenceClass)) {
    throw envelopeError('evidence_class cannot exceed source record');
  }

  if (sourceRecord.prohibited_leaps !== undefined) {
    const sourceProhibitedLeaps = requireStringArray(sourceRecord.prohibited_leaps, 'source record prohibited_leaps');
    const envelopeRestrictions = new Set(prohibited_leaps);
    const dropped = sourceProhibitedLeaps.filter(value => !envelopeRestrictions.has(value));
    if (dropped.length > 0) {
      throw envelopeError('prohibited_leaps cannot drop source restrictions');
    }
  }

  return Object.freeze({
    kind: 'content360.marketing_content_envelope',
    source_kind: 'marketing.evidence_label',
    source_issue,
    source_receipt,
    claim_id,
    evidence_class,
    content,
    prohibited_leaps: Object.freeze([...prohibited_leaps]),
    publication_authority: false,
    network_authority: false,
    canonical_memory_authority: false,
  });
}
