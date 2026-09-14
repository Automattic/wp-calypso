/**
 * Shared notifications-filter contract for Reader social surfaces
 * (ATmosphere, Mastodon, …). The UI-side chip union, the per-protocol
 * notifications hooks, and the query-key generators all import from
 * here so a chip widening fails type-check at the wire boundary
 * instead of silently mapping to `undefined` (= "all").
 */

export type NotificationsFilter = 'all' | 'conversations' | 'likes' | 'reposts' | 'follows';

export const NOTIFICATIONS_FILTERS: readonly NotificationsFilter[] = [
	'all',
	'conversations',
	'likes',
	'reposts',
	'follows',
] as const;

/**
 * Map a chip filter to the wpcom `types=` query parameter. `undefined`
 * means "no filter — send all canonical types".
 */
export function mapNotificationsFilter( filter: NotificationsFilter ): string | undefined {
	switch ( filter ) {
		case 'all':
			return undefined;
		case 'conversations':
			return 'mention,reply,quote';
		case 'likes':
			return 'like';
		case 'reposts':
			return 'repost';
		case 'follows':
			return 'follow';
		default: {
			const _exhaustive: never = filter;
			void _exhaustive;
			return undefined;
		}
	}
}
