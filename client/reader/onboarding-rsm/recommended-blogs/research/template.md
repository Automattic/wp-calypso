# Research: <interest>

Issue: READ-<number>

Researcher: <owner>

Reader verification: <owner and check date>

Start with the existing `curated-blogs/` list and record which entries were reused or replaced. Research about 15 candidates initially; replace failures until 12 pass. Keep evidence here for both accepted and dropped candidates. Only accepted blogs belong in the corresponding TypeScript list.

## Candidates

Repeat this record for each candidate:

- Name:
- Site URL:
- RSS/Atom feed URL:
- One-line description:
- Latest published post date observed:
- Activity checked on:
- Popularity claim:
- Public source supporting the popularity claim:
- Real avatar or site icon URL (HTTPS):
- Icon source and HTTP check result:
- Existing curated entry: reused / replaced / new
- Reader feed lookup: checked on / resolved feed_ID / site_ID (0 for external feeds)
- Reader recent posts: checked on / latest published post seen
- Reader icon load: checked on / result
- Reader following: checked on / result / test account authorization reference
- Outcome: accepted / dropped
- Reason if dropped:

## Final list

Record the 12 accepted blogs in their display order. Every blog must pass Reader feed lookup, recent-post, icon-load, and authorized following checks. A blog without a working real icon must be dropped or raised for help sourcing one.

Descriptions in the TypeScript list must call `__()` inside the exported getter. Keep observed publication dates in this research record; the UI reads its latest-post date live.

Use public source links and bare issue keys. Keep account identifiers, credentials, cookies, and private links out of this file.
