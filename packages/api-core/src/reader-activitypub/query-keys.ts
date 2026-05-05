export const readerActivityPubKeys = {
	all: [ 'reader', 'activitypub' ] as const,
	connections: () => [ ...readerActivityPubKeys.all, 'connections' ] as const,
	connection: ( id: number | null ) => [ ...readerActivityPubKeys.all, 'connection', id ] as const,
	capabilities: ( blogId: number | null ) =>
		[ ...readerActivityPubKeys.all, 'capabilities', blogId ] as const,
};
