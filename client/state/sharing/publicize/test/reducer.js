import deepFreeze from 'deep-freeze';
import {
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_RECEIVE,
	PUBLICIZE_CONNECTION_UPDATE,
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { fetchingConnections, connections } from '../reducer';

describe( 'reducer', () => {
	describe( '#fetchingConnections()', () => {
		test( 'should set fetching to true for fetching action', () => {
			const state = fetchingConnections( null, {
				type: PUBLICIZE_CONNECTIONS_REQUEST,
				siteId: 2916284,
			} );

			expect( state[ 2916284 ] ).toBe( true );
		} );

		test( 'should set fetching to false for received action', () => {
			const state = fetchingConnections( null, {
				type: PUBLICIZE_CONNECTIONS_RECEIVE,
				siteId: 2916284,
			} );

			expect( state[ 2916284 ] ).toBe( false );
		} );

		test( 'should set fetching to false for failed action', () => {
			const state = fetchingConnections( null, {
				type: PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
				siteId: 2916284,
			} );

			expect( state[ 2916284 ] ).toBe( false );
		} );
	} );

	describe( '#connections()', () => {
		describe( 'PUBLICIZE_CONNECTIONS_RECEIVE', () => {
			test( 'should index connections by ID', () => {
				const state = connections( null, {
					type: PUBLICIZE_CONNECTIONS_RECEIVE,
					siteId: 2916284,
					data: {
						connections: [ { ID: 1, site_ID: 2916284 } ],
					},
				} );

				expect( state ).toEqual( {
					1: { ID: 1, site_ID: 2916284 },
				} );
			} );

			test( 'should accumulate connections for distinct sites', () => {
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 2916284 },
					} ),
					{
						type: PUBLICIZE_CONNECTIONS_RECEIVE,
						siteId: 77203074,
						data: {
							connections: [ { ID: 2, site_ID: 77203074 } ],
						},
					}
				);

				expect( state ).toEqual( {
					1: { ID: 1, site_ID: 2916284 },
					2: { ID: 2, site_ID: 77203074 },
				} );
			} );

			test( 'should discard connections for the same site ID if no longer present', () => {
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 2916284 },
					} ),
					{
						type: PUBLICIZE_CONNECTIONS_RECEIVE,
						siteId: 2916284,
						data: {
							connections: [ { ID: 2, site_ID: 2916284 } ],
						},
					}
				);

				expect( state ).toEqual( {
					2: { ID: 2, site_ID: 2916284 },
				} );
			} );

			test( 'should override previous connections of same ID', () => {
				const connection = { ID: 1, site_ID: 2916284, foo: true };
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 2916284 },
					} ),
					{
						type: PUBLICIZE_CONNECTIONS_RECEIVE,
						siteId: 2916284,
						data: {
							connections: [ connection ],
						},
					}
				);

				expect( state ).toEqual( {
					1: connection,
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_CREATE', () => {
			test( 'should add new connection', () => {
				const existingConnection = { ID: 1, site_ID: 2916284 };
				const newConnection = { ID: 2, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: existingConnection,
					} ),
					{
						type: PUBLICIZE_CONNECTION_CREATE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: existingConnection,
					2: newConnection,
				} );
			} );

			test( 'should update existing connections', () => {
				const newConnection = { ID: 1, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 77203074 },
					} ),
					{
						type: PUBLICIZE_CONNECTION_CREATE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: newConnection,
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_DELETE', () => {
			test( 'should remove deleted connections', () => {
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 2916284 },
						2: { ID: 2, site_ID: 2916284 },
					} ),
					{
						type: PUBLICIZE_CONNECTION_DELETE,
						connection: {
							ID: 2,
							site_ID: 2916284,
						},
					}
				);

				expect( state ).toEqual( {
					1: { ID: 1, site_ID: 2916284 },
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_RECEIVE', () => {
			test( 'should add new connection', () => {
				const existingConnection = { ID: 1, site_ID: 2916284 };
				const newConnection = { ID: 2, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: existingConnection,
					} ),
					{
						type: PUBLICIZE_CONNECTION_RECEIVE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: existingConnection,
					2: newConnection,
				} );
			} );

			test( 'should update existing connections', () => {
				const newConnection = { ID: 1, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 77203074 },
					} ),
					{
						type: PUBLICIZE_CONNECTION_RECEIVE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: newConnection,
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_UPDATE', () => {
			test( 'should add new connection', () => {
				const existingConnection = { ID: 1, site_ID: 2916284 };
				const newConnection = { ID: 2, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: existingConnection,
					} ),
					{
						type: PUBLICIZE_CONNECTION_UPDATE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: existingConnection,
					2: newConnection,
				} );
			} );

			test( 'should update existing connections', () => {
				const newConnection = { ID: 1, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 77203074 },
					} ),
					{
						type: PUBLICIZE_CONNECTION_UPDATE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: newConnection,
				} );
			} );
		} );

		describe( 'persistence', () => {
			jest.spyOn( console, 'warn' ).mockImplementation();

			test( 'should persist data', () => {
				const state = deepFreeze( {
					1: { ID: 1, site_ID: 2916284 },
					2: { ID: 2, site_ID: 2916284 },
				} );
				const persistedState = serialize( connections, state );
				expect( persistedState ).toEqual( state );
			} );

			test( 'should load valid data', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, site_ID: 2916284 },
					2: { ID: 2, site_ID: 2916284 },
				} );
				const state = deserialize( connections, persistedState );
				expect( state ).toEqual( persistedState );
			} );

			test( 'should ignore loading data with invalid keys', () => {
				const persistedState = deepFreeze( {
					foo: { ID: 1, site_ID: 2916284 },
					bar: { ID: 2, site_ID: 2916284 },
				} );
				const state = deserialize( connections, persistedState );
				expect( state ).toEqual( {} );
			} );

			test( 'should ignore loading data with invalid values', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, site_ID: 'foo' },
					2: { ID: 2, site_ID: 2916284 },
				} );
				const state = deserialize( connections, persistedState );
				expect( state ).toEqual( {} );
			} );
		} );
	} );
} );
