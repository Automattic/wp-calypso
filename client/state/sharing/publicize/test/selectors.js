import {
	getBrokenSiteUserConnectionsForService,
	getConnectionsBySiteId,
	getSiteUserConnections,
	getSiteUserConnectionsForService,
	getRemovableConnections,
	hasFetchedConnections,
	isFetchingConnections,
} from '../selectors';

describe( 'getBrokenSiteUserConnectionsForService()', () => {
	const state = {
		sharing: {
			publicize: {
				connections: {
					1: { ID: 1, site_ID: 2916284, service: 'path', shared: true, status: 'ok' },
					2: {
						ID: 2,
						site_ID: 2916284,
						service: 'twitter',
						keyring_connection_user_ID: 26957695,
						status: 'broken',
					},
				},
			},
		},
	};

	test( 'should return empty array if no connections for site', () => {
		const connections = getBrokenSiteUserConnectionsForService(
			{
				sharing: {
					publicize: {
						connections: {},
					},
				},
			},
			2916284,
			26957695,
			'twitter'
		);

		expect( Object.keys( connections ) ).toHaveLength( 0 );
	} );

	test( 'should return empty array if no connections for service', () => {
		const connections = getBrokenSiteUserConnectionsForService(
			state,
			2916284,
			26957695,
			'facebook'
		);

		expect( Object.keys( connections ) ).toHaveLength( 0 );
	} );

	test( 'should return empty array if all connections ok', () => {
		const connections = getBrokenSiteUserConnectionsForService( state, 2916284, 26957695, 'path' );

		expect( Object.keys( connections ) ).toHaveLength( 0 );
	} );

	test( 'should return connection if any connections broken', () => {
		const connections = getBrokenSiteUserConnectionsForService(
			state,
			2916284,
			26957695,
			'twitter'
		);

		expect( connections ).toEqual( [
			{
				ID: 2,
				site_ID: 2916284,
				service: 'twitter',
				keyring_connection_user_ID: 26957695,
				status: 'broken',
			},
		] );
	} );
} );

describe( '#getConnectionsBySiteId()', () => {
	test( 'should return an empty array for a site which has not yet been fetched', () => {
		const connections = getConnectionsBySiteId(
			{
				sharing: {
					publicize: {
						connections: {},
					},
				},
			},
			2916284
		);

		expect( connections ).toEqual( [] );
	} );

	test( 'should return an array of connection objects received for the site', () => {
		const connections = getConnectionsBySiteId(
			{
				sharing: {
					publicize: {
						connections: {
							1: { ID: 1, site_ID: 2916284 },
							2: { ID: 2, site_ID: 2916284 },
						},
					},
				},
			},
			2916284
		);

		expect( connections ).toEqual( [
			{ ID: 1, site_ID: 2916284 },
			{ ID: 2, site_ID: 2916284 },
		] );
	} );
} );

describe( '#getSiteUserConnections()', () => {
	test( 'should return an empty array for a site which has not yet been fetched', () => {
		const connections = getSiteUserConnections(
			{
				sharing: {
					publicize: {
						connections: {},
					},
				},
			},
			2916284,
			26957695
		);

		expect( connections ).toEqual( [] );
	} );

	test( 'should return an array of connection objects received for the site available to a user', () => {
		const connections = getSiteUserConnections(
			{
				sharing: {
					publicize: {
						connections: {
							1: { ID: 1, site_ID: 2916284, shared: true },
							2: { ID: 2, site_ID: 2916284, keyring_connection_user_ID: 26957695 },
							3: { ID: 2, site_ID: 2916284, keyring_connection_user_ID: 18342963 },
						},
					},
				},
			},
			2916284,
			26957695
		);

		expect( connections ).toEqual( [
			{ ID: 1, site_ID: 2916284, shared: true },
			{ ID: 2, site_ID: 2916284, keyring_connection_user_ID: 26957695 },
		] );
	} );
} );

describe( '#getSiteUserConnectionsForService()', () => {
	test( 'should return an empty array for a site which has not yet been fetched', () => {
		const connections = getSiteUserConnectionsForService(
			{
				sharing: {
					publicize: {
						connectionsBySiteId: {},
						connections: {},
					},
				},
			},
			2916284,
			26957695
		);

		expect( connections ).toEqual( [] );
	} );

	test( 'should return an array of connection objects received for the site that are available to the current user', () => {
		const connections = getSiteUserConnectionsForService(
			{
				sharing: {
					publicize: {
						connectionsBySiteId: {
							2916284: [ 1, 2, 3 ],
						},
						connections: {
							1: { ID: 1, site_ID: 2916284, shared: true, service: 'twitter' },
							2: {
								ID: 2,
								site_ID: 2916284,
								keyring_connection_user_ID: 26957695,
								service: 'twitter',
							},
							3: {
								ID: 2,
								site_ID: 2916284,
								keyring_connection_user_ID: 18342963,
								service: 'facebook',
							},
						},
					},
				},
			},
			2916284,
			26957695,
			'twitter'
		);

		expect( connections ).toEqual( [
			{ ID: 1, site_ID: 2916284, shared: true, service: 'twitter' },
			{ ID: 2, site_ID: 2916284, keyring_connection_user_ID: 26957695, service: 'twitter' },
		] );
	} );
} );

describe( '#getRemovableConnections()', () => {
	const state = {
		currentUser: {
			id: 26957695,
			capabilities: {
				2916284: {
					edit_others_posts: true,
				},
			},
		},
		sharing: {
			publicize: {
				connectionsBySiteId: {
					2916284: [ 1, 2, 3 ],
				},
				connections: {
					1: { ID: 1, site_ID: 2916284, shared: true, service: 'twitter', user_ID: 0 },
					2: {
						ID: 2,
						site_ID: 2916284,
						keyring_connection_user_ID: 26957695,
						service: 'twitter',
						user_ID: 26957695,
					},
					3: { ID: 2, site_ID: 2916284, keyring_connection_user_ID: 18342963, service: 'facebook' },
				},
			},
		},
		sites: {
			items: {
				2916284: {
					ID: 2916284,
					capabilities: {
						edit_others_posts: true,
					},
					name: 'WordPress.com Example Blog',
					options: {
						unmapped_url: 'https://example.wordpress.com',
					},
					URL: 'https://example.com',
				},
			},
		},
		ui: {
			selectedSiteId: 2916284,
		},
	};

	test( 'should return an empty array for a site which has not yet been fetched', () => {
		const connections = getRemovableConnections( state, 'path' );

		expect( connections ).toEqual( [] );
	} );

	test( 'should return an array of connection objects that are removable by the current user', () => {
		const connections = getRemovableConnections( state, 'twitter' );

		expect( connections ).toEqual( [
			{ ID: 1, site_ID: 2916284, shared: true, service: 'twitter', user_ID: 0 },
			{
				ID: 2,
				site_ID: 2916284,
				keyring_connection_user_ID: 26957695,
				service: 'twitter',
				user_ID: 26957695,
			},
		] );
	} );

	test( 'should return an array of connection objects for the current user that are removable by that same user', () => {
		state.currentUser.capabilities[ 2916284 ].edit_others_posts = false;
		const connections = getRemovableConnections( state, 'twitter' );

		expect( connections ).toEqual( [
			{
				ID: 2,
				site_ID: 2916284,
				keyring_connection_user_ID: 26957695,
				service: 'twitter',
				user_ID: 26957695,
			},
		] );
	} );
} );

describe( '#hasFetchedConnections()', () => {
	test( 'should return false if connections have not been fetched for a site', () => {
		const hasFetched = hasFetchedConnections(
			{
				sharing: {
					publicize: {
						fetchedConnections: {},
					},
				},
			},
			2916284
		);

		expect( hasFetched ).toBe( false );
	} );

	test( 'should return true if connections have completed fetching for a site', () => {
		const hasFetched = hasFetchedConnections(
			{
				sharing: {
					publicize: {
						fetchedConnections: {
							2916284: true,
						},
					},
				},
			},
			2916284
		);

		expect( hasFetched ).toBe( true );
	} );
} );

describe( '#isFetchingConnections()', () => {
	test( 'should return false if fetch has never been triggered for site', () => {
		const isFetching = isFetchingConnections(
			{
				sharing: {
					publicize: {
						fetchingConnections: {},
					},
				},
			},
			2916284
		);

		expect( isFetching ).toBe( false );
	} );

	test( 'should return true if connections are currently fetching for a site', () => {
		const isFetching = isFetchingConnections(
			{
				sharing: {
					publicize: {
						fetchingConnections: {
							2916284: true,
						},
					},
				},
			},
			2916284
		);

		expect( isFetching ).toBe( true );
	} );

	test( 'should return false if connections are not currently fetching for a site', () => {
		const isFetching = isFetchingConnections(
			{
				sharing: {
					publicize: {
						fetchingConnections: {
							2916284: false,
						},
					},
				},
			},
			2916284
		);

		expect( isFetching ).toBe( false );
	} );

	test( 'should return false if connections are fetching, but not for the given site', () => {
		const isFetching = isFetchingConnections(
			{
				sharing: {
					publicize: {
						fetchingConnections: {
							77203074: true,
						},
					},
				},
			},
			2916284
		);

		expect( isFetching ).toBe( false );
	} );
} );
