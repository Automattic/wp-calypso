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
 * Sentinel used in the optimistic-update window after a reply-mutation
 * fires but before the server response lands. Mirrors PENDING_LIKE_URI:
 * consumers that parse rkeys must treat this value as "no real rkey yet"
 * and suppress any DELETE that would race the in-flight POST.
 */
export const PENDING_REPLY_URI = '__pending_reply__';

/**
 * Sentinel used in the optimistic-update window after a standalone
 * post-creation mutation fires (no reply, no quote — the connected
 * user's own newly-published post) but before the server response
 * lands. Mirrors PENDING_LIKE_URI: consumers that parse rkeys must
 * treat this value as "no real rkey yet" and suppress any DELETE
 * that would race the in-flight POST.
 */
export const PENDING_POST_URI = '__pending_post__';
