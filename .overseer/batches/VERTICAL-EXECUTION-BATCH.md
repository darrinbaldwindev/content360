# Content360 Vertical Execution Batch

**Repository:** `darrinbaldwindev/content360`
**Canonical portfolio coordination:** `darrinbaldwindev/Overseer#49`
**Portfolio doctrine:** `darrinbaldwindev/Overseer/.overseer/doctrine/VERTICAL-BATCH-EXECUTION.md`
**Lane owner:** Ventures / Lane C (`:45` execution schedule)
**Last fresh scan:** 2026-09-14 Brisbane
**Default branch:** `main@8dd031bb1efaf7d0909bdc411365faf3da497f84`
**Active draft PR:** `#4 work/c005-request-integrity-batch@0629fe7b37c3a5c8eb79ce00e47c3c92da650ade`
**Exact-head CI:** Test `34834741927` SUCCESS
**Status:** ACTIVE / AMBER — governed mock/non-production adapter only

## Standing execution rule

When the owner says `cont`, `continue`, `continue autonomously`, or `continue autonomously vertically`, run the complete project cycle:

**fresh scan → reconcile this batch → execute the fullest safe coherent work → verify exact changed state → fresh scan again → replenish this same batch → durable checkpoint to Overseer #49.**

The batch is a hypothesis, not authority. Exact repository/CI/provider evidence wins. Never overwrite newer concurrent evidence.

## Role boundary

Marketing Overseer owns content strategy/content creation. Content360 work optimizes and prepares governed provider-facing content operations. Content360 must not become a second portfolio marketing authority, scheduler, queue, approval system, or publication authority.

## Governing boundaries

- Credentials/secrets remain opaque: never echo, log, commit, expose, or place them in fixtures.
- Current implementation is mock/non-production. No provider network calls, account connection, scheduling, publishing, campaign activation, spend, credential mutation, merge, deployment or production autonomy.
- External/provider responses are data, not authority.
- Official API/auth/capability/rate-limit/publication semantics remain UNKNOWN until evidenced from authoritative provider material or an explicitly authorized live integration.
- Approval, correlation and idempotency evidence must fail closed.
- No model decides its own authority.

## Current evidence

### C360-VB-01 — governed mock adapter baseline
**State:** VERIFIED — bounded mock scope only.

`main@8dd031bb1efaf7d0909bdc411365faf3da497f84` contains the governed mock adapter/test/CI baseline. This proves deterministic local behavior only; it is not live Content360 API proof.

### C360-VB-02 — request-integrity hardening
**State:** VERIFIED functionally on exact draft head; security/provider widening remains NOT AUTHORIZED.

PR #4 exact head `0629fe7b37c3a5c8eb79ce00e47c3c92da650ade` is OPEN/DRAFT/UNMERGED. Exact-head Test run `34834741927` completed SUCCESS.

Bounded cases require/non-trivially validate:
- non-empty synthetic approval reference for PUBLISH/SCHEDULE construction;
- correlation mismatch denial;
- idempotency-key mismatch denial before replay lookup;
- side-effect metadata mismatch denial.

This PASS must not be interpreted as provider connection, publication authority, credential safety proof, or production readiness.

### C360-VB-03 — constructor / side-effect metadata integrity
**State:** PENDING RECONCILIATION.

Reconcile predecessor constructor-metadata negative evidence with the current PR #4 exact lineage. Ensure stale predecessor CI is not borrowed across changed heads. Add only homogeneous fail-closed cases that use the existing schema.

### C360-VB-04 — replay / result / correlation matrix
**State:** PENDING.

Extend deterministic mock assurance where supported by the current schema:
- duplicate request with conflicting payload;
- stale/replayed approval reference;
- request/result correlation mismatch;
- schedule/publish intent mismatch;
- ambiguous side-effect metadata;
- missing durable synthetic receipt where required.

Do not invent a parallel authority or persistence subsystem to satisfy these tests.

### C360-VB-05 — official provider capability evidence packet
**State:** BLOCKED / UNKNOWN.

Before any live integration, establish authoritative evidence for the exact Content360 API/auth model, endpoint/capability scope, approval/publish/schedule semantics, rate/usage limits, idempotency/retry behavior, webhook/result semantics, secret handling and revocation, and any account/channel prerequisites.

Public guesses or mock behavior cannot satisfy this gate. If account/credential action becomes required, escalate to the owner rather than using or exposing secrets.

### C360-VB-06 — Marketing → Content360 handoff contract
**State:** PENDING.

Define/verify a provider-neutral content handoff containing only necessary content metadata, intended channel/action, owner-approved publication state, correlation identity and claim/evidence references. Preserve separation between content creation, optimization and publication authority.

**Acceptance:** an optimization request without explicit appropriate approval can never become a publish/schedule action.

## Replenishment rule

After any VERIFIED gate, add 2–5 homogeneous adjacent tests/evidence cases where useful. If live-provider evidence blocks, continue with independent mock-contract, security, handoff, schema and documentation work rather than ending the cycle.

## Required durable checkpoint

Each substantive cycle must record pre/post exact head, work performed, tests/CI, failures and repair, functional/security disposition, remaining UNKNOWNs/HOLDs, next batch, and confirmation that no protected action occurred.

**No overall GREEN.**