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
	authorFeed: ( connectionId: number, actor: string ) =>
		[ ...readerMastodonKeys.all, 'profile-feed', connectionId, actor ] as const,
};
