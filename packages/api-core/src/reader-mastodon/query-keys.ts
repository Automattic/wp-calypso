import type { NotificationsFilter } from '../reader-social/notifications-filter';

export const readerMastodonKeys = {
	all: [ 'reader', 'mastodon' ] as const,
	connections: () => [ ...readerMastodonKeys.all, 'connections' ] as const,
	connection: ( id: number | null ) => [ ...readerMastodonKeys.all, 'connection', id ] as const,
	authStatus: ( connectionId: number | null ) =>
		[ ...readerMastodonKeys.all, 'auth-status', connectionId ] as const,
	// Per-connection instance config (max_characters, etc.). Long stale time —
	// instance admins rarely change these values, and getting it wrong only
	// affects the composer's char counter at the cap edge.
	instanceConfig: ( id: number | null ) =>
		[ ...readerMastodonKeys.all, 'instance-config', id ] as const,
	timeline: ( connectionId: number ) =>
		[ ...readerMastodonKeys.all, 'timeline', connectionId ] as const,
	notifications: ( connectionId: number, filter: NotificationsFilter ) =>
		[ ...readerMastodonKeys.all, 'notifications', connectionId, filter ] as const,
	thread: ( connectionId: number, statusId: string ) =>
		[ ...readerMastodonKeys.all, 'thread', connectionId, statusId ] as const,
	authorProfile: ( connectionId: number, actor: string ) =>
		[ ...readerMastodonKeys.all, 'profile', connectionId, actor ] as const,
	actorFollowers: ( connectionId: number, actor: string ) =>
		[ ...readerMastodonKeys.all, 'actor-followers', connectionId, actor ] as const,
	actorFollowing: ( connectionId: number, actor: string ) =>
		[ ...readerMastodonKeys.all, 'actor-following', connectionId, actor ] as const,
	// `filter` is appended only when set so the no-filter cache key matches
	// the slice-6 shape exactly. Wrappers are expected to collapse the
	// no-op filter (`posts_with_replies` for Mastodon) to undefined before
	// keying so equivalent calls dedupe.
	authorFeed: ( connectionId: number, actor: string, filter?: string ) =>
		filter === undefined
			? ( [ ...readerMastodonKeys.all, 'profile-feed', connectionId, actor ] as const )
			: ( [ ...readerMastodonKeys.all, 'profile-feed', connectionId, actor, filter ] as const ),
	// Tag feeds are keyed by connection + hashtag. `filter` appended only when
	// set so the no-filter cache key has a stable shape; wrappers collapse the
	// no-op `all` filter to undefined before keying so equivalent calls dedupe.
	tagFeed: ( connectionId: number, hashtag: string, filter?: string ) =>
		filter === undefined
			? ( [ ...readerMastodonKeys.all, 'tag-feed', connectionId, hashtag ] as const )
			: ( [ ...readerMastodonKeys.all, 'tag-feed', connectionId, hashtag, filter ] as const ),
};
