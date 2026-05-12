/**
 * Prefix used to stamp a placeholder `FediverseFeedItem.id` for an
 * in-flight standalone post during the optimistic-update window after
 * `createFediversePost` fires but before the server response lands.
 * Each in-flight post gets a `${PENDING_FEDIVERSE_POST_URI}#<counter>`
 * suffix so siblings (back-to-back submits) can be distinguished.
 * Consumers that need to recognise a placeholder should test with
 * `String#startsWith` against this prefix, not equality. Mirrors the
 * ATmosphere `PENDING_POST_URI` sentinel.
 */
export const PENDING_FEDIVERSE_POST_URI = '__pending_fediverse_post__';
