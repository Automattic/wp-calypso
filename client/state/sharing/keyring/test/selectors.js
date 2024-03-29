import {
	getKeyringConnections,
	getKeyringConnectionById,
	getKeyringConnectionsByName,
	getBrokenKeyringConnectionsByName,
	getUserConnections,
	isKeyringConnectionsFetching,
} from '../selectors';

describe( 'selectors', () => {
	const defaultState = {
		sharing: {
			keyring: {
				items: {},
				isFetching: false,
			},
		},
	};
	const activeState = {
		sharing: {
			keyring: {
				items: {
					1: { ID: 1, service: 'twitter', sites: [ '2916284' ] },
					2: { ID: 2, service: 'insta', sites: [ '77203074' ], keyring_connection_user_ID: 1 },
					3: { ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true },
				},
				isFetching: true,
			},
		},
	};

	describe( 'getKeyringConnections()', () => {
		test( 'should return false if connections have not been fetched', () => {
			const connections = getKeyringConnections( defaultState );

			expect( Object.keys( connections ) ).toHaveLength( 0 );
		} );

		test( 'should return the keyring connections', () => {
			const connections = getKeyringConnections( activeState );

			expect( connections ).toEqual( [
				{ ID: 1, service: 'twitter', sites: [ '2916284' ] },
				{ ID: 2, service: 'insta', sites: [ '77203074' ], keyring_connection_user_ID: 1 },
				{ ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true },
			] );
		} );
	} );

	describe( 'getKeyringConnectionById()', () => {
		test( 'should return null for a connection which has not yet been fetched', () => {
			const connections = getKeyringConnectionById( activeState, 4 );

			expect( connections ).toBeNull();
		} );

		test( 'should return the connection object for the ID', () => {
			const connections = getKeyringConnectionById( activeState, 1 );

			expect( connections ).toEqual( { ID: 1, service: 'twitter', sites: [ '2916284' ] } );
		} );
	} );

	describe( 'getKeyringConnectionsByName()', () => {
		test( 'should return null for a connection which has not yet been fetched', () => {
			const connections = getKeyringConnectionsByName( activeState, 'tumblr' );

			expect( Object.keys( connections ) ).toHaveLength( 0 );
		} );

		test( 'should return the connection object for the ID', () => {
			const connections = getKeyringConnectionsByName( activeState, 'facebook' );

			expect( connections ).toEqual( [
				{ ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true },
			] );
		} );
	} );

	describe( 'getUserConnections()', () => {
		test( 'should return an empty array for a site which has not yet been fetched', () => {
			activeState.sharing.keyring.items[ 3 ].shared = false;
			const connections = getUserConnections( activeState, 3 );
			activeState.sharing.keyring.items[ 3 ].shared = true;

			expect( connections ).toEqual( [] );
		} );

		test( 'should return an array of connection objects that are available to any user', () => {
			const connections = getUserConnections( activeState, 3 );

			expect( connections ).toEqual( [
				{ ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true },
			] );
		} );

		test( 'should return an array of connection objects that are available to a specific user', () => {
			const connections = getUserConnections( activeState, 1 );

			expect( connections ).toEqual( [
				{ ID: 2, service: 'insta', sites: [ '77203074' ], keyring_connection_user_ID: 1 },
				{ ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true },
			] );
		} );
	} );

	describe( 'isKeyringConnectionsFetching()', () => {
		test( 'should return false if fetch has never been triggered', () => {
			const isFetching = isKeyringConnectionsFetching( defaultState );

			expect( isFetching ).toBe( false );
		} );

		test( 'should return true if connections are currently fetching', () => {
			const isFetching = isKeyringConnectionsFetching( activeState );

			expect( isFetching ).toBe( true );
		} );

		test( 'should return false if connections are not currently fetching', () => {
			const isFetching = isKeyringConnectionsFetching( defaultState );

			expect( isFetching ).toBe( false );
		} );
	} );

	const brokenState = {
		sharing: {
			keyring: {
				items: {
					1: { ID: 1, service: 'twitter', sites: [ '2916284' ] },
					2: { ID: 2, service: 'insta', sites: [ '77203074' ], keyring_connection_user_ID: 1 },
					3: {
						ID: 3,
						service: 'facebook',
						sites: [ '2916284', '77203074' ],
						shared: true,
						status: 'broken',
					},
				},
				isFetching: true,
			},
		},
	};

	describe( 'getBrokenKeyringConnectionsByName()', () => {
		test( 'should return null for a connection which has not yet been fetched', () => {
			const connections = getBrokenKeyringConnectionsByName( brokenState, 'twitter' );

			expect( Object.keys( connections ) ).toHaveLength( 0 );
		} );

		test( 'should return the connection object for the ID', () => {
			const connections = getBrokenKeyringConnectionsByName( brokenState, 'facebook' );

			expect( connections ).toEqual( [
				{
					ID: 3,
					service: 'facebook',
					sites: [ '2916284', '77203074' ],
					shared: true,
					status: 'broken',
				},
			] );
		} );
	} );
} );
