# Vertical Batch Adoption

This repository adopts the portfolio-wide canonical batch standard maintained in `darrinbaldwindev/Overseer`.

Read in order before every vertical execution cycle:
1. `.overseer/doctrine/PORTFOLIO-BATCH-ENGINE.md`
2. `.overseer/profiles/PROJECT-BATCH-PROFILES.md` — Content360 profile
3. `.overseer/doctrine/VERTICAL-BATCH-EXECUTION.md`
4. `.overseer/communication/PROJECT-CHAT-VERTICAL-BATCH-HANDOFF.md`
5. this repository's live `.overseer/batches/VERTICAL-EXECUTION-BATCH.md`
6. current repo/PR/CI evidence and Overseer #49.

The central engine is the procedure. The project profile is the customization layer. The local batch contains current work only. Central engine/profile changes apply on the next fresh cycle.

Owner `cont` / `continue autonomously` triggers the full fresh-scan → reconcile → execute → verify → fresh-scan → replenish → durable-log cycle.