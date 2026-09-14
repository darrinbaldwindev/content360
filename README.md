# Content360 integration workspace

This repository contains the non-production integration boundary for governed AgentOS / ChatGPT Overseer use of Content360.

## Role boundary

Marketing Overseer owns content creation. AgentOS/ChatGPT Overseer may optimise approved content through a Content360 capability adapter. Content360 is an external capability only; it is not an AgentOS scheduler, mission ledger, authority engine, Green/PRS system, or source of truth.

## Current slice

The current implementation is mock-only and has no network side effects.

Supported operation classes:

- `READ`
- `OPTIMISE`
- `PUBLISH`
- `SCHEDULE`

`PUBLISH` and `SCHEDULE` require explicit approval and remain disabled in the mock implementation.

## Secret handling

No Content360 credential belongs in this repository. Future live adapters must obtain credentials only through an injected secret/environment reference such as `CONTENT360_API_KEY`; tests must use synthetic placeholders and must never log secret values.

## Test

```bash
node --test test/content360-adapter.test.mjs
```

## Governance

No live publishing, scheduling, account mutation, credentials, campaigns, spend, deployment, or production autonomy is authorised by this repository.
