export const readerFediverseKeys = {
	all: [ 'reader', 'fediverse' ] as const,
	connections: () => [ ...readerFediverseKeys.all, 'connections' ] as const,
	connection: ( id: number | null ) => [ ...readerFediverseKeys.all, 'connection', id ] as const,
};
