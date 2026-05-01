/**
 * Sentinel used in `AtmosphereFeedItem.viewer.like` during the
 * optimistic-update window after a like-mutation fires but before
 * the server response lands. Consumers that parse the rkey out of
 * the at-uri must treat this value as "no real rkey yet" and
 * suppress any DELETE that would race the in-flight POST.
 */
export const PENDING_LIKE_URI = '__pending_like__';
