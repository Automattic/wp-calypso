import deepFreeze from 'deep-freeze';
import {
	KEYRING_CONNECTION_DELETE,
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { useSandbox } from 'calypso/test-helpers/use-sinon';
import { isFetching, items } from '../reducer';

describe( 'reducers', () => {
	describe( 'isFetching()', () => {
		test( 'should set fetching to true for fetching action', () => {
			const state = isFetching( null, {
				type: KEYRING_CONNECTIONS_REQUEST,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should set fetching to false for received action', () => {
			const state = isFetching( null, {
				type: KEYRING_CONNECTIONS_REQUEST_SUCCESS,
			} );

			expect( state ).toBe( false );
		} );

		test( 'should set fetching to false for failed action', () => {
			const state = isFetching( null, {
				type: KEYRING_CONNECTIONS_REQUEST_FAILURE,
			} );

			expect( state ).toBe( false );
		} );
	} );

	describe( 'items()', () => {
		test( 'should index connections by ID', () => {
			const state = items( null, {
				type: KEYRING_CONNECTIONS_RECEIVE,
				connections: [ { ID: 1, sites: [ '2916284' ] } ],
			} );

			expect( state ).toEqual( {
				1: { ID: 1, sites: [ '2916284' ] },
			} );
		} );

		test( 'should discard connections for the same site ID if no longer present', () => {
			const state = items(
				deepFreeze( {
					1: { ID: 1, sites: [ '2916284' ] },
				} ),
				{
					type: KEYRING_CONNECTIONS_RECEIVE,
					connections: [ { ID: 2, sites: [ '77203074' ] } ],
				}
			);

			expect( state ).toEqual( {
				2: { ID: 2, sites: [ '77203074' ] },
			} );
		} );

		test( 'should override previous connections of same ID', () => {
			const connection = { ID: 1, sites: [ '2916284' ], foo: true };
			const state = items(
				deepFreeze( {
					1: { ID: 1, sites: [ '2916284' ] },
				} ),
				{
					type: KEYRING_CONNECTIONS_RECEIVE,
					connections: [ connection ],
				}
			);

			expect( state ).toEqual( {
				1: connection,
			} );
		} );

		test( 'should accumulate connections for distinct sites', () => {
			const state = items(
				deepFreeze( {
					1: { ID: 1, sites: [ '2916284' ] },
				} ),
				{
					type: PUBLICIZE_CONNECTION_CREATE,
					connection: {
						keyring_connection_ID: 1,
						site_ID: '77203074',
					},
				}
			);

			expect( state ).toEqual( {
				1: { ID: 1, sites: [ '2916284', '77203074' ] },
			} );
		} );

		test( 'should remove connections for distinct sites', () => {
			const state = items(
				deepFreeze( {
					1: { ID: 1, sites: [ '2916284', '77203074' ] },
				} ),
				{
					type: PUBLICIZE_CONNECTION_DELETE,
					connection: {
						keyring_connection_ID: 1,
						site_ID: 77203074,
					},
				}
			);

			expect( state ).toEqual( {
				1: { ID: 1, sites: [ '2916284' ] },
			} );
		} );

		test( 'should remove deleted connection', () => {
			const state = items(
				deepFreeze( {
					1: { ID: 1, site_ID: 2916284 },
					2: { ID: 2, site_ID: 2916284 },
				} ),
				{
					type: KEYRING_CONNECTION_DELETE,
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

		describe( 'persistence', () => {
			useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

			test( 'should persist data', () => {
				const state = deepFreeze( {
					1: { ID: 1, sites: [ '2916284' ] },
					2: { ID: 2, sites: [ '77203074' ] },
				} );
				const persistedState = serialize( items, state );
				expect( persistedState ).toEqual( state );
			} );

			test( 'should load valid data', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, sites: [ '2916284' ] },
					2: { ID: 2, sites: [ '77203074' ] },
				} );
				const state = deserialize( items, persistedState );
				expect( state ).toEqual( persistedState );
			} );

			test( 'should ignore loading data with invalid keys', () => {
				const persistedState = deepFreeze( {
					foo: { ID: 1, sites: [ '2916284' ] },
					bar: { ID: 2, sites: [ '77203074' ] },
				} );
				const state = deserialize( items, persistedState );
				expect( state ).toEqual( {} );
			} );

			test( 'should ignore loading data with invalid values', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, sites: 'foo' },
					2: { ID: 2, sites: [ '77203074' ] },
				} );
				const state = deserialize( items, persistedState );
				expect( state ).toEqual( {} );
			} );
		} );
	} );
} );
