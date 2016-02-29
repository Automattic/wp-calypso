/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
	DESERIALIZE,
	SERIALIZE
} from 'state/action-types';
import {
	fetchingConnections,
	connections
} from '../reducer';

describe( '#fetchingConnections()', () => {
	it( 'should set fetching to true for fetching action', () => {
		const state = fetchingConnections( null, {
			type: PUBLICIZE_CONNECTIONS_REQUEST,
			siteId: 2916284
		} );

		expect( state[ 2916284 ] ).to.be.true;
	} );

	it( 'should set fetching to false for received action', () => {
		const state = fetchingConnections( null, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284
		} );

		expect( state[ 2916284 ] ).to.be.false;
	} );

	it( 'should set fetching to false for failed action', () => {
		const state = fetchingConnections( null, {
			type: PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
			siteId: 2916284
		} );

		expect( state[ 2916284 ] ).to.be.false;
	} );

	describe( 'persistence', () => {
		it( 'never loads persisted data', () => {
			const persistedState = deepFreeze( {
				2916284: false,
				123456: undefined
			} );
			const state = fetchingConnections( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );

		it( 'never persists data', () => {
			const state = deepFreeze( {
				2916284: false,
				123456: undefined
			} );
			const persistedState = fetchingConnections( state, {
				type: SERIALIZE
			} );
			expect( persistedState ).to.eql( {} );
		} );
	} );
} );

describe( '#connections()', () => {
	it( 'should index connections by ID', () => {
		const state = connections( null, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [ { ID: 1, site_ID: 2916284 } ]
			}
		} );

		expect( state ).to.eql( {
			1: { ID: 1, site_ID: 2916284 }
		} );
	} );

	it( 'should not replace previous connections', () => {
		const state = connections( {
			1: { ID: 1, site_ID: 2916284 }
		}, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [ { ID: 2, site_ID: 2916284 } ]
			}
		} );

		expect( state ).to.eql( {
			1: { ID: 1, site_ID: 2916284 },
			2: { ID: 2, site_ID: 2916284 }
		} );
	} );

	it( 'should override previous connections of same ID', () => {
		const connection = { ID: 1, site_ID: 2916284, foo: true };
		const state = connections( {
			1: { ID: 1, site_ID: 2916284 }
		}, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [ connection ]
			}
		} );

		expect( state ).to.eql( {
			1: connection
		} );
	} );

	describe( 'persistence', () => {
		it( 'does not persist data because this is not implemented yet', () => {
			const state = deepFreeze( {
				1: { ID: 1, site_ID: 2916284 },
				2: { ID: 2, site_ID: 2916284 }
			} );
			const persistedState = connections( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( {} );
		} );

		it( 'does not load persisted data because this is not implemented yet', () => {
			const persistedState = deepFreeze( {
				1: { ID: 1, site_ID: 2916284 },
				2: { ID: 2, site_ID: 2916284 }
			} );
			const state = connections( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );
	} );
} );
