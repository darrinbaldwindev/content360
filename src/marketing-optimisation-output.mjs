const EVIDENCE_CLASSES = Object.freeze(['CONCEPT', 'DEMONSTRABLE', 'VALIDATED', 'PRODUCTION']);
const EVIDENCE_RANK = new Map(EVIDENCE_CLASSES.map((value, index) => [value, index]));
const OUTPUT_KEYS = new Set(['claim_id','source_receipt','source_revision','evidence_class','content','prohibited_leaps','publication_authority','network_authority']);
const CREDENTIAL_KEY_PATTERN = /(^|[_-])(credential|secret|token|api[_-]?key|password|auth|authorization)([_-]|$)/i;

function outputError(message) {
  const error = new Error(message);
  error.code = 'CONTENT360_MARKETING_OUTPUT_INTEGRITY';
  return error;
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw outputError(`${label} must be an object`);
  return value;
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw outputError(`${label} is required`);
  return value.trim();
}

function evidenceClass(value, label) {
  const normalized = requireString(value, label).toUpperCase();
  if (!EVIDENCE_RANK.has(normalized)) throw outputError(`${label} is unsupported`);
  return normalized;
}

function stringArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) throw outputError(`${label} must be a non-empty array`);
  return value.map((entry, index) => requireString(entry, `${label}[${index}]`));
}

export function validateMarketingOptimisationOutput(parsedEnvelope, output) {
  requireObject(parsedEnvelope, 'parsed envelope');
  requireObject(output, 'output');

  const keys = Object.keys(output);
  if (keys.some(key => CREDENTIAL_KEY_PATTERN.test(key))) throw outputError('output contains credential-like fields');
  const unknown = keys.filter(key => !OUTPUT_KEYS.has(key));
  if (unknown.length) throw outputError(`output contains unsupported fields: ${unknown.sort().join(',')}`);

  const sourceClass = evidenceClass(parsedEnvelope.evidence_class, 'parsed envelope evidence_class');
  const outputClass = evidenceClass(output.evidence_class, 'output evidence_class');
  if (EVIDENCE_RANK.get(outputClass) > EVIDENCE_RANK.get(sourceClass)) throw outputError('output evidence_class cannot exceed parsed envelope');

  for (const field of ['claim_id','source_receipt','source_revision']) {
    if (output[field] !== parsedEnvelope[field]) throw outputError(`${field} does not match parsed envelope`);
  }

  const sourceRestrictions = stringArray(parsedEnvelope.prohibited_leaps, 'parsed envelope prohibited_leaps');
  const outputRestrictions = stringArray(output.prohibited_leaps, 'output prohibited_leaps');
  const set = new Set(outputRestrictions);
  if (sourceRestrictions.some(value => !set.has(value))) throw outputError('output prohibited_leaps cannot drop source restrictions');

  requireString(output.content, 'output content');
  if (output.publication_authority !== false) throw outputError('output publication authority must remain false');
  if (output.network_authority !== false) throw outputError('output network authority must remain false');

  return Object.freeze({
    kind: 'content360.marketing_optimisation_output',
    claim_id: output.claim_id,
    source_receipt: output.source_receipt,
    source_revision: output.source_revision,
    evidence_class: outputClass,
    content: output.content.trim(),
    prohibited_leaps: Object.freeze([...outputRestrictions]),
    publication_authority: false,
    network_authority: false,
    canonical_memory_authority: false,
  });
}
