export const readerMastodonKeys = {
	all: [ 'reader', 'mastodon' ] as const,
	connections: () => [ ...readerMastodonKeys.all, 'connections' ] as const,
	connection: ( id: number | null ) => [ ...readerMastodonKeys.all, 'connection', id ] as const,
};
