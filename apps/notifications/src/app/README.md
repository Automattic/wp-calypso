# Notification App

This app is used by the multi-site Dashboard and the standalone notifications panel.

## Dashboard subscriber alerts

Subscriber alerts are best-effort signals from live follow notes, not verified subscriber-count changes. When the account preference and feature flag are enabled, a candidate is emitted only for a live push whose note was hydrated, has type `follow`, and contains a valid target site ID in `note.meta.ids.site`. The notifications client still updates the unseen count immediately; the alert feature makes no `/me/sites` baseline request and no follow-up `/sites/{id}` count request.

Follow notes can aggregate subscribers and can update an existing row keyed by `note.id`. The ID is used only to match a live push to its hydrated note, not as proof of a distinct subscriber event. Repeated references to one note in the same push batch are coalesced to the earliest receipt. The existing server-supplied `note_hash` suppresses a push when it matches that note's cached snapshot; a changed snapshot on a later live push can alert again. Bootstrap, polling, and cache refreshes do not produce candidates. A reconnect replay matching the cached hash is suppressed, but a missing or changed hash cannot reliably distinguish replay from a new update.

`note_hash` is normally a CRC32 fingerprint of serialized rendered note data, not a monotonic version or event ID; the API can return a time-based fallback when its hash cache is missing, and CRC32 can collide. Read state, locale, or rendered content can also change it. When absent, no frontend token is generated. Hash-based suppression is snapshot deduplication only and cannot prove a person or unique subscriber event. Do not derive identity or event certainty from note text, actor IDs, email, avatars, timestamps, note IDs/hashes, or the actor's primary site ID. Missed or unhydrated pushes produce no alert.

Audio and the Dashboard pulse occur only for eligible candidates received while the page is visible and processed while it remains visible. Candidates received before the current enabled subscription epoch and hidden-page candidates are discarded, not queued for later playback. Account, preference, feature-flag, and unmount cleanup invalidate pending subscriptions. Historical note and polling updates are not replayed as live alerts.
