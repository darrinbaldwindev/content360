# Content360 Vertical Execution Batch

Project: `darrinbaldwindev/content360`
Lane: C / Ventures
Canonical engine: `darrinbaldwindev/Overseer/.overseer/doctrine/PORTFOLIO-BATCH-ENGINE.md`
Profile: Content360 in `darrinbaldwindev/Overseer/.overseer/profiles/PROJECT-BATCH-PROFILES.md`
Control issue: Content360 #3; active draft PR #4
Last reconciled base: `main@8dd031bb1efaf7d0909bdc411365faf3da497f84`
Governance: mock/non-production only; no credentials, provider/account mutation, PUBLISH/SCHEDULE network execution, deployment, merge/ready/rebase or production publication.

## ACTIVE

### C360-V3 — stale/conflicting Marketing provenance denial
- state: ACTIVE
- objective: prevent stale, superseded, or conflicting Marketing evidence from being accepted into the Content360 optimisation envelope.
- implementation: bind envelope to positive `source_revision`; source record carries `CURRENT|SUPERSEDED|CONFLICTED`, `superseded_by`, and `conflict_refs`; only unconflicted CURRENT evidence may parse.
- security_gates: SG-05, SG-06, SG-07, SG-10, SG-14, SG-15
- risk_class: S2 for branch/test writes; runtime contract remains non-production/read-only.
- negative_tests: stale revision; superseded source; conflicted source; hidden supersession/conflict metadata on CURRENT source.
- acceptance: exact-head CI passes adapter, secret-boundary and Marketing-provenance suites; PR remains draft/unmerged; no authority widens.

## NEXT

### C360-V4 — deterministic provenance receipt
- state: PENDING
- objective: emit a deterministic non-secret parsing receipt containing source issue/receipt/revision/claim/evidence class and zero authority flags.
- boundary: receipt is audit evidence only, not approval or canonical memory.

### C360-V5 — optimisation output claim-strength guard
- state: PENDING
- objective: ensure transformed copy cannot remove source prohibited leaps or increase evidence class when an optimisation output is later introduced.
- boundary: mock transform only; no provider/network call.

### C360-V6 — source-state fixture expansion
- state: PENDING
- objective: add 2–5 homogeneous source-version/replacement fixtures after V3 is exact-head green.

## BLOCKED / HOLD / UNKNOWN
- Official Content360 provider/API/auth/capability contract remains UNKNOWN.
- Credentials and secret handles remain opaque and outside repository fixtures.
- Live PUBLISH/SCHEDULE/network/account mutation is OWNER_REQUIRED and disabled.
- Marketing campaign/publication authority is not implied by source evidence.

## VERIFIED PREDECESSOR SCOPE
- Mock request/result integrity, secret-isolation tests, capability-map immutability, Marketing provenance correlation/evidence-class/prohibited-leap gates were previously exact-head green on PR #4 predecessor `b528e55ff0903b386169680ffa3c1f91f9ce585a`; predecessor CI does not transfer to this successor head.
