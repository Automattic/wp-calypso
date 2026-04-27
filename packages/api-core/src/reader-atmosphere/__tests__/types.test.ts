import type {
	AtmosphereConnection,
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereProfileCounts,
} from '../types';

describe( 'reader-atmosphere types compile', () => {
	it( 'AtmosphereConnection canonical shape', () => {
		const listItem: AtmosphereConnection = {
			id: 1,
			handle: 'a.bsky.social',
			display_name: 'Alice',
			did: 'did:plc:x',
			avatar: null,
		};
		expect( listItem.display_name ).toBe( 'Alice' );
	} );

	it( 'response + details shapes', () => {
		const list: AtmosphereConnectionsResponse = { connections: [] };
		const created: AtmosphereCreateConnectionResponse = {
			connection: {
				id: 101,
				handle: 'a',
				display_name: 'A',
				did: 'did:plc:a',
				avatar: null,
			},
		};
		const counts: AtmosphereProfileCounts = { followers: 0, follows: 0, posts: 0 };
		const details: AtmosphereConnectionDetails = {
			did: 'did:plc:x',
			handle: 'a.bsky.social',
			display_name: 'Alice',
			description: '',
			avatar: null,
			banner: null,
			counts,
			raw: {},
		};
		expect( [ list, created ] ).toHaveLength( 2 );
		expect( details.counts.followers ).toBe( 0 );
	} );
} );
