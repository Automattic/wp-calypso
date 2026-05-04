export const readerMastodonKeys = {
	all: [ 'reader', 'mastodon' ] as const,
	connections: () => [ ...readerMastodonKeys.all, 'connections' ] as const,
	connection: ( id: number | null ) => [ ...readerMastodonKeys.all, 'connection', id ] as const,
	timeline: ( connectionId: number ) =>
		[ ...readerMastodonKeys.all, 'timeline', connectionId ] as const,
	thread: ( connectionId: number, statusId: string ) =>
		[ ...readerMastodonKeys.all, 'thread', connectionId, statusId ] as const,
	authorProfile: ( connectionId: number, actor: string ) =>
		[ ...readerMastodonKeys.all, 'profile', connectionId, actor ] as const,
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
