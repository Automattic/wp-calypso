import type {
	AtmosphereConnection,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereProfileCounts,
	AtmosphereVerifyResult,
} from '../types';

describe( 'reader-atmosphere types compile', () => {
	it( 'AtmosphereConnection canonical shape', () => {
		const c: AtmosphereConnection = {
			id: 101,
			handle: 'alice.bsky.social',
			did: 'did:plc:alice',
			avatar: null,
		};
		expect( c.id ).toBe( 101 );
	} );

	it( 'response + verify shapes', () => {
		const list: AtmosphereConnectionsResponse = { connections: [] };
		const created: AtmosphereCreateConnectionResponse = {
			connection: { id: 101, handle: 'a', did: 'did:plc:a', avatar: null },
		};
		const counts: AtmosphereProfileCounts = { followers: 0, follows: 0, posts: 0 };
		const v: AtmosphereVerifyResult = {
			did: 'did:plc:a',
			handle: 'a',
			display_name: '',
			description: '',
			avatar: null,
			banner: null,
			counts,
			raw: {},
		};
		expect( [ list, created, v ] ).toHaveLength( 3 );
	} );
} );
