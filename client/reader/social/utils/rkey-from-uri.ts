import { PENDING_LIKE_URI, PENDING_REPOST_URI } from '@automattic/api-core';

/**
 * Parse the rkey out of an at-uri.
 *
 * `at://did:plc:foo/app.bsky.feed.like/3kabc` → `'3kabc'`
 *
 * Returns null for malformed input, missing rkey segment, or either
 * pending sentinel (used during the optimistic-update window before
 * the server response lands).
 */
export function rkeyFromUri( uri: string ): string | null {
	if ( uri === PENDING_LIKE_URI || uri === PENDING_REPOST_URI ) {
		return null;
	}
	if ( ! uri || ! uri.startsWith( 'at://' ) ) {
		return null;
	}
	const withoutScheme = uri.slice( 'at://'.length );
	const parts = withoutScheme.split( '/' );
	if ( parts.length < 3 ) {
		return null;
	}
	return parts[ 2 ] || null;
}
