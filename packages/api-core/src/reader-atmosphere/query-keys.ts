export const readerAtmosphereKeys = {
	all: [ 'reader', 'atmosphere' ] as const,
	connections: () => [ ...readerAtmosphereKeys.all, 'connections' ] as const,
	connection: ( id: number | null ) => [ ...readerAtmosphereKeys.all, 'connection', id ] as const,
};
