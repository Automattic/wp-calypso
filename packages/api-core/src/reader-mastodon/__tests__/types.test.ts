import type {
	MastodonConnection,
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
	MastodonProfileCounts,
} from '../types';

describe( 'reader-mastodon types compile', () => {
	it( 'MastodonConnection canonical shape', () => {
		const listItem: MastodonConnection = {
			id: 1,
			handle: 'alice',
			instance: 'mastodon.social',
			display_name: 'Alice',
			avatar: null,
		};
		expect( listItem.display_name ).toBe( 'Alice' );
	} );

	it( 'response + details shapes', () => {
		const list: MastodonConnectionsResponse = { connections: [] };
		const created: MastodonCreateConnectionResponse = {
			connection: {
				id: 101,
				handle: 'alice',
				instance: 'mastodon.social',
				display_name: 'A',
				avatar: null,
			},
		};
		const counts: MastodonProfileCounts = { followers: 0, following: 0, posts: 0 };
		const details: MastodonConnectionDetails = {
			handle: 'alice',
			instance: 'mastodon.social',
			display_name: 'Alice',
			description: '',
			avatar: null,
			header: null,
			counts,
			raw: {},
		};
		expect( [ list, created ] ).toHaveLength( 2 );
		expect( details.counts.followers ).toBe( 0 );
		expect( details.instance ).toBe( 'mastodon.social' );
	} );
} );
