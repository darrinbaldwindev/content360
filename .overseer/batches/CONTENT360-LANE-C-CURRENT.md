# Content360 Lane C Current Batch

Canonical coordination: `darrinbaldwindev/Overseer#49`.
Active draft PR: `#4 work/c005-request-integrity-batch`.
Security boundary: mock/non-production only; SG-05/06/07/10/14/15 materially apply; no credentials, provider/account mutation, network PUBLISH/SCHEDULE, deployment, merge/ready/rebase, publication or production autonomy.

## Current reconciliation — 2026-09-15 Brisbane

Fresh evidence found the PR branch diverged from current `main@80b7ad1f815421157ae98043074c2195ffc23892` and was `mergeable_state=dirty`. Current main added the canonical `.overseer/batches/VERTICAL-EXECUTION-BATCH.md` after this PR fork, while this PR independently added the same path. GitHub `pull_request` Actions stopped producing exact-head runs after the conflict emerged. The canonical vertical batch path on this branch has therefore been made byte-identical to main without merging or rebasing; this file preserves the current Lane C queue separately.

### ACTIVE / CI REQUIRED
- C360-V3 stale/conflicting Marketing provenance denial — implementation present; exact-head CI required.
- C360-V4 deterministic provenance receipt — implementation present; exact-head CI required.
- C360-V5 optimisation-output claim-strength guard — implementation present; exact-head CI required.

### NEXT, ONLY AFTER EXACT-HEAD GREEN
- C360-V6 source-state replacement/version fixtures: 2–5 homogeneous cases for stale replacement references, source revision rollover, conflicting replacement lineage, and deterministic receipt re-binding.

### BLOCKED / UNKNOWN
- Official provider/API/auth/capability contract remains UNKNOWN.
- Credentials/secrets remain opaque and outside repository fixtures/logs.
- Live provider/account/network publication authority remains OWNER_REQUIRED and disabled.
- Marketing evidence does not imply publication authority.

No predecessor CI may be inherited across changed heads. No overall GREEN.
