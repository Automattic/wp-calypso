export const readerAtmosphereKeys = {
	all: [ 'reader', 'atmosphere' ] as const,
	connections: () => [ ...readerAtmosphereKeys.all, 'connections' ] as const,
	connection: ( id: number | null ) => [ ...readerAtmosphereKeys.all, 'connection', id ] as const,
	timeline: ( connectionId: number ) =>
		[ ...readerAtmosphereKeys.all, 'timeline', connectionId ] as const,
	thread: ( uri: string ) => [ ...readerAtmosphereKeys.all, 'thread', uri ] as const,
};
