/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { fetchingConnection, fetchingConnections, connections } from '../reducer';
import {
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_RECEIVE,
	PUBLICIZE_CONNECTION_REQUEST,
	PUBLICIZE_CONNECTION_REQUEST_FAILURE,
	PUBLICIZE_CONNECTION_REQUEST_SUCCESS,
	PUBLICIZE_CONNECTION_UPDATE,
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
	DESERIALIZE,
	SERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	describe( 'fetchConnection()', () => {
		test( 'should set fetching to true for fetching action', () => {
			const state = fetchingConnection( null, {
				type: PUBLICIZE_CONNECTION_REQUEST,
				connectionId: 2,
				siteId: 2916284,
			} );

			expect( state[ 2 ] ).to.be.true;
		} );

		test( 'should set fetching to false for received action', () => {
			const state = fetchingConnection( null, {
				type: PUBLICIZE_CONNECTION_REQUEST_SUCCESS,
				connectionId: 2,
				siteId: 2916284,
			} );

			expect( state[ 2 ] ).to.be.false;
		} );

		test( 'should set fetching to false for failed action', () => {
			const state = fetchingConnection( null, {
				type: PUBLICIZE_CONNECTION_REQUEST_FAILURE,
				connectionId: 2,
				siteId: 2916284,
			} );

			expect( state[ 2 ] ).to.be.false;
		} );

		describe( 'persistence', () => {
			test( 'never loads persisted data', () => {
				const persistedState = deepFreeze( {
					2: false,
					123456: undefined,
				} );
				const state = fetchingConnection( persistedState, {
					type: DESERIALIZE,
				} );
				expect( state ).to.eql( {} );
			} );

			test( 'never persists data', () => {
				const state = deepFreeze( {
					2: false,
					123456: undefined,
				} );
				const persistedState = fetchingConnection( state, {
					type: SERIALIZE,
				} );
				expect( persistedState ).to.be.undefined;
			} );
		} );
	} );

	describe( '#fetchingConnections()', () => {
		test( 'should set fetching to true for fetching action', () => {
			const state = fetchingConnections( null, {
				type: PUBLICIZE_CONNECTIONS_REQUEST,
				siteId: 2916284,
			} );

			expect( state[ 2916284 ] ).to.be.true;
		} );

		test( 'should set fetching to false for received action', () => {
			const state = fetchingConnections( null, {
				type: PUBLICIZE_CONNECTIONS_RECEIVE,
				siteId: 2916284,
			} );

			expect( state[ 2916284 ] ).to.be.false;
		} );

		test( 'should set fetching to false for failed action', () => {
			const state = fetchingConnections( null, {
				type: PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
				siteId: 2916284,
			} );

			expect( state[ 2916284 ] ).to.be.false;
		} );

		describe( 'persistence', () => {
			test( 'never loads persisted data', () => {
				const persistedState = deepFreeze( {
					2916284: false,
					123456: undefined,
				} );
				const state = fetchingConnections( persistedState, {
					type: DESERIALIZE,
				} );
				expect( state ).to.eql( {} );
			} );

			test( 'never persists data', () => {
				const state = deepFreeze( {
					2916284: false,
					123456: undefined,
				} );
				const persistedState = fetchingConnections( state, {
					type: SERIALIZE,
				} );
				expect( persistedState ).to.be.undefined;
			} );
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

				expect( state ).to.eql( {
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

				expect( state ).to.eql( {
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

				expect( state ).to.eql( {
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

				expect( state ).to.eql( {
					1: connection,
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_CREATE', () => {
			test( 'should add new connection', () => {
				const existingConnection = { ID: 1, site_ID: 2916284 },
					newConnection = { ID: 2, site_ID: 2916284 },
					state = connections(
						deepFreeze( {
							1: existingConnection,
						} ),
						{
							type: PUBLICIZE_CONNECTION_CREATE,
							connection: newConnection,
						}
					);

				expect( state ).to.eql( {
					1: existingConnection,
					2: newConnection,
				} );
			} );

			test( 'should update existing connections', () => {
				const newConnection = { ID: 1, site_ID: 2916284 },
					state = connections(
						deepFreeze( {
							1: { ID: 1, site_ID: 77203074 },
						} ),
						{
							type: PUBLICIZE_CONNECTION_CREATE,
							connection: newConnection,
						}
					);

				expect( state ).to.eql( {
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

				expect( state ).to.eql( {
					1: { ID: 1, site_ID: 2916284 },
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_RECEIVE', () => {
			test( 'should add new connection', () => {
				const existingConnection = { ID: 1, site_ID: 2916284 },
					newConnection = { ID: 2, site_ID: 2916284 },
					state = connections(
						deepFreeze( {
							1: existingConnection,
						} ),
						{
							type: PUBLICIZE_CONNECTION_RECEIVE,
							connection: newConnection,
						}
					);

				expect( state ).to.eql( {
					1: existingConnection,
					2: newConnection,
				} );
			} );

			test( 'should update existing connections', () => {
				const newConnection = { ID: 1, site_ID: 2916284 },
					state = connections(
						deepFreeze( {
							1: { ID: 1, site_ID: 77203074 },
						} ),
						{
							type: PUBLICIZE_CONNECTION_RECEIVE,
							connection: newConnection,
						}
					);

				expect( state ).to.eql( {
					1: newConnection,
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_UPDATE', () => {
			test( 'should add new connection', () => {
				const existingConnection = { ID: 1, site_ID: 2916284 },
					newConnection = { ID: 2, site_ID: 2916284 },
					state = connections(
						deepFreeze( {
							1: existingConnection,
						} ),
						{
							type: PUBLICIZE_CONNECTION_UPDATE,
							connection: newConnection,
						}
					);

				expect( state ).to.eql( {
					1: existingConnection,
					2: newConnection,
				} );
			} );

			test( 'should update existing connections', () => {
				const newConnection = { ID: 1, site_ID: 2916284 },
					state = connections(
						deepFreeze( {
							1: { ID: 1, site_ID: 77203074 },
						} ),
						{
							type: PUBLICIZE_CONNECTION_UPDATE,
							connection: newConnection,
						}
					);

				expect( state ).to.eql( {
					1: newConnection,
				} );
			} );
		} );

		describe( 'persistence', () => {
			useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

			test( 'should persist data', () => {
				const state = deepFreeze( {
					1: { ID: 1, site_ID: 2916284 },
					2: { ID: 2, site_ID: 2916284 },
				} );
				const persistedState = connections( state, { type: SERIALIZE } );
				expect( persistedState ).to.eql( state );
			} );

			test( 'should load valid data', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, site_ID: 2916284 },
					2: { ID: 2, site_ID: 2916284 },
				} );
				const state = connections( persistedState, {
					type: DESERIALIZE,
				} );
				expect( state ).to.eql( persistedState );
			} );

			test( 'should ignore loading data with invalid keys', () => {
				const persistedState = deepFreeze( {
					foo: { ID: 1, site_ID: 2916284 },
					bar: { ID: 2, site_ID: 2916284 },
				} );
				const state = connections( persistedState, {
					type: DESERIALIZE,
				} );
				expect( state ).to.eql( {} );
			} );

			test( 'should ignore loading data with invalid values', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, site_ID: 'foo' },
					2: { ID: 2, site_ID: 2916284 },
				} );
				const state = connections( persistedState, {
					type: DESERIALIZE,
				} );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
