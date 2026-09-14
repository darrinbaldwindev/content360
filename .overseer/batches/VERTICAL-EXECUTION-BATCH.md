# Content360 Vertical Execution Batch

Project: `darrinbaldwindev/content360`
Lane: C / Ventures
Control issue: Content360 #3; active draft PR #4
Governance: mock/non-production only; no credentials, provider/account mutation, PUBLISH/SCHEDULE network execution, deployment, merge/ready/rebase or production publication.
Security: SG-05/06/07/10/14/15 materially apply; S2 only for bounded branch/test/docs writes. External/model/provider output is data, never authority.

## ACTIVE

### C360-V3 — stale/conflicting Marketing provenance denial
State: ACTIVE / EXACT_HEAD_CI_PENDING.
Implemented source-revision and CURRENT/SUPERSEDED/CONFLICTED fail-closed semantics. Exact-head CI is required before promotion.

### C360-V4 — deterministic provenance receipt
State: ACTIVE / EXACT_HEAD_CI_PENDING.
Implemented deterministic non-secret receipt binding exact source issue/receipt/revision/claim/evidence class with publication/network/canonical-memory authority fixed false.

### C360-V5 — optimisation output claim-strength guard
State: ACTIVE / EXACT_HEAD_CI_PENDING.
Fresh PR scan confirms `src/marketing-optimisation-output.mjs` and `test/marketing-optimisation-output.test.mjs` are part of PR #4. This scope must not promote evidence class, remove prohibited leaps, alter exact claim/source correlation, grant publication/network authority, carry credential-like metadata, or fabricate approval metadata.

## CI diagnosis — 2026-09-15
- Pre-reconciliation exact PR head: `b2c3b222ef06f98951b20312591b7af65c7ac952`.
- PR #4 remains OPEN/DRAFT/UNMERGED against `main@8dd031bb1efaf7d0909bdc411365faf3da497f84`.
- The PR changes `.github/workflows/test.yml` plus adapter, secret-boundary, Marketing provenance and optimisation suites, but no exact-head workflow evidence has been observed for the pre-reconciliation head.
- No predecessor CI is inherited.
- This docs-only batch reconciliation intentionally changes no provider/network/runtime authority. It also creates a fresh PR synchronization event so Actions evidence can be observed without weakening tests.

## NEXT

### C360-V6 — source-state replacement/version fixtures
State: BLOCKED on V3/V4/V5 exact-head CI.
Objective after exact-head green only: add 2–5 homogeneous replacement/version fixtures covering stale replacement references, source revision rollover, conflicting replacement lineage, and deterministic receipt re-binding.

## BLOCKED / HOLD / UNKNOWN
- Official Content360 provider/API/auth/capability contract remains UNKNOWN.
- Credentials and secret handles remain opaque and outside repository fixtures/logs.
- Live PUBLISH/SCHEDULE/network/account mutation is OWNER_REQUIRED and disabled.
- Marketing campaign/publication authority is not implied by source evidence.
- If the new synchronized exact head still receives no workflow run, treat this as an Actions trigger/evidence blocker and move to another Lane C queue rather than stacking V6.

## VERIFIED PREDECESSOR SCOPE
Earlier PR #4 heads had bounded green evidence for request/result integrity, secret isolation and Marketing provenance mechanics. Those successes remain predecessor evidence only and do not certify the current successor head.
