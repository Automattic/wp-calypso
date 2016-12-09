/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	DESERIALIZE,
	SERIALIZE
} from 'state/action-types';
import {
	isFetching,
	items
} from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducers', () => {
	describe( 'isFetching()', () => {
		it( 'should set fetching to true for fetching action', () => {
			const state = isFetching( null, {
				type: KEYRING_CONNECTIONS_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should set fetching to false for received action', () => {
			const state = isFetching( null, {
				type: KEYRING_CONNECTIONS_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should set fetching to false for failed action', () => {
			const state = isFetching( null, {
				type: KEYRING_CONNECTIONS_REQUEST_FAILURE,
			} );

			expect( state ).to.be.false;
		} );

		describe( 'persistence', () => {
			it( 'never loads persisted data', () => {
				const persistedState = deepFreeze( true );
				const state = isFetching( persistedState, {
					type: DESERIALIZE,
				} );
				expect( state ).to.eql( false );
			} );

			it( 'never persists data', () => {
				const state = deepFreeze( true );
				const persistedState = isFetching( state, {
					type: SERIALIZE,
				} );
				expect( persistedState ).to.eql( false );
			} );
		} );
	} );

	describe( 'items()', () => {
		it( 'should index connections by ID', () => {
			const state = items( null, {
				type: KEYRING_CONNECTIONS_RECEIVE,
				connections: [ { ID: 1, sites: [ '2916284' ] } ]
			} );

			expect( state ).to.eql( {
				1: { ID: 1, sites: [ '2916284' ] }
			} );
		} );

		it( 'should discard connections for the same site ID if no longer present', () => {
			const state = items( deepFreeze( {
				1: { ID: 1, sites: [ '2916284' ] }
			} ), {
				type: KEYRING_CONNECTIONS_RECEIVE,
				connections: [ { ID: 2, sites: [ '77203074' ] } ]
			} );

			expect( state ).to.eql( {
				2: { ID: 2, sites: [ '77203074' ] }
			} );
		} );

		it( 'should override previous connections of same ID', () => {
			const connection = { ID: 1, sites: [ '2916284' ], foo: true };
			const state = items( deepFreeze( {
				1: { ID: 1, sites: [ '2916284' ] }
			} ), {
				type: KEYRING_CONNECTIONS_RECEIVE,
				connections: [ connection ]
			} );

			expect( state ).to.eql( {
				1: connection
			} );
		} );

		it( 'should accumulate connections for distinct sites', () => {
			const state = items( deepFreeze( {
				1: { ID: 1, sites: [ '2916284' ] }
			} ), {
				type: PUBLICIZE_CONNECTION_CREATE,
				connection: {
					keyring_connection_ID: 1,
					site_ID: '77203074',
				},
			} );

			expect( state ).to.eql( {
				1: { ID: 1, sites: [ '2916284', '77203074' ] },
			} );
		} );

		it( 'should remove connections for distinct sites', () => {
			const state = items( deepFreeze( {
				1: { ID: 1, sites: [ '2916284', '77203074' ] }
			} ), {
				type: PUBLICIZE_CONNECTION_DELETE,
				connection: {
					keyring_connection_ID: 1,
					site_ID: 77203074,
				},
			} );

			expect( state ).to.eql( {
				1: { ID: 1, sites: [ '2916284' ] },
			} );
		} );

		describe( 'persistence', () => {
			useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

			it( 'should persist data', () => {
				const state = deepFreeze( {
					1: { ID: 1, sites: [ '2916284' ] },
					2: { ID: 2, sites: [ '77203074' ] },
				} );
				const persistedState = items( state, {
					type: SERIALIZE,
				} );
				expect( persistedState ).to.eql( state );
			} );

			it( 'should load valid data', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, sites: [ '2916284' ] },
					2: { ID: 2, sites: [ '77203074' ] },
				} );
				const state = items( persistedState, {
					type: DESERIALIZE,
				} );
				expect( state ).to.eql( persistedState );
			} );

			it( 'should ignore loading data with invalid keys', () => {
				const persistedState = deepFreeze( {
					foo: { ID: 1, sites: [ '2916284' ] },
					bar: { ID: 2, sites: [ '77203074' ] },
				} );
				const state = items( persistedState, {
					type: DESERIALIZE,
				} );
				expect( state ).to.eql( {} );
			} );

			it( 'should ignore loading data with invalid values', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, sites: 'foo' },
					2: { ID: 2, sites: [ '77203074' ] }
				} );
				const state = items( persistedState, {
					type: DESERIALIZE,
				} );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
