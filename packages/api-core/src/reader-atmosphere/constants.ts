/**
 * Sentinel used in `AtmosphereFeedItem.viewer.like` during the
 * optimistic-update window after a like-mutation fires but before
 * the server response lands. Consumers that parse the rkey out of
 * the at-uri must treat this value as "no real rkey yet" and
 * suppress any DELETE that would race the in-flight POST.
 */
export const PENDING_LIKE_URI = '__pending_like__';

/**
 * Sentinel used in `AtmosphereFeedItem.viewer.repost` during the
 * optimistic-update window after a repost-mutation fires but before
 * the server response lands. Consumers that parse the rkey out of
 * the at-uri must treat this value as "no real rkey yet" and
 * suppress any DELETE that would race the in-flight POST.
 */
export const PENDING_REPOST_URI = '__pending_repost__';

/**
 * Prefix used to stamp a placeholder `AtmosphereFeedItem.uri` for an
 * in-flight reply during the optimistic-update window. Each in-flight
 * reply gets a `${PENDING_REPLY_URI}#<counter>` suffix so siblings can be
 * distinguished. Consumers that need to recognise a placeholder reply
 * should test with `String#startsWith` against this prefix, not equality.
 */
export const PENDING_REPLY_URI = '__pending_reply__';

/**
 * Prefix used to stamp a placeholder `AtmosphereFeedItem.uri` for an
 * in-flight standalone post (no reply, no quote — the connected user's own
 * newly-published post) during the optimistic-update window. Each in-flight
 * post gets a `${PENDING_POST_URI}#<counter>` suffix so siblings can be
 * distinguished. Consumers that need to recognise a placeholder post
 * should test with `String#startsWith` against this prefix, not equality.
 */
export const PENDING_POST_URI = '__pending_post__';
