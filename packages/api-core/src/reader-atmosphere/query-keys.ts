export const readerAtmosphereKeys = {
	all: [ 'reader-atmosphere' ] as const,
	connections: () => [ 'reader-atmosphere', 'connections' ] as const,
	verify: ( id: number | null ) => [ 'reader-atmosphere', 'verify', id ] as const,
};
