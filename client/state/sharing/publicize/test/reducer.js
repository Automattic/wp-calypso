/**
 * External dependencies
 */
import { expect } from 'chai';

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
	connections,
	connectionsBySiteId
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
		it( 'should load valid persisted data', () => {
			const persistedState = Object.freeze( {
				2916284: false,
				123456: undefined
			} );
			const state = fetchingConnections( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( { 2916284: false, 123456: undefined } );
		} );

		it.skip( 'should ignore loading data with invalid keys', () => {
			const persistedState = Object.freeze( { foo: false } );
			const state = fetchingConnections( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );

		it.skip( 'should ignore loading data with invalid values', () => {
			const persistedState = Object.freeze( { 2916284: 'foo' } );
			const state = fetchingConnections( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );

		it( 'should persists data', () => {
			const state = Object.freeze( {
				2916284: false,
				123456: undefined
			} );
			const persistedState = fetchingConnections( state, {
				type: SERIALIZE
			} );
			expect( persistedState ).to.eql( state );
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
		it( 'should persist data', () => {
			const state = Object.freeze( {
				1: { ID: 1, site_ID: 2916284 },
				2: { ID: 2, site_ID: 2916284 }
			} );
			const persistedState = connections( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( state );
		} );

		it( 'should load valid data', () => {
			const persistedState = Object.freeze( {
				1: { ID: 1, site_ID: 2916284 },
				2: { ID: 2, site_ID: 2916284 }
			} );
			const state = connections( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( persistedState );
		} );

		it.skip( 'should ignore loading data with invalid keys', () => {
			const persistedState = Object.freeze( {
				foo: { ID: 1, site_ID: 2916284 },
				bar: { ID: 2, site_ID: 2916284 }
			} );
			const state = connections( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );

		it.skip( 'should ignore loading data with invalid values', () => {
			const persistedState = Object.freeze( {
				1: { ID: 1, site_ID: 'foo' },
				2: { ID: 2, site_ID: 2916284 }
			} );
			const state = connections( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );
	} );
} );

describe( '#connectionsBySiteId()', () => {
	it( 'should map site ID to connection IDs', () => {
		const state = connectionsBySiteId( null, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [
					{ ID: 1, site_ID: 2916284 },
					{ ID: 2, site_ID: 2916284 }
				]
			}
		} );

		expect( state ).to.eql( {
			2916284: [ 1, 2 ]
		} );
	} );

	it( 'should replace previous known connections for site', () => {
		const state = connectionsBySiteId( {
			2916284: [ 1, 2 ]
		}, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [
					{ ID: 1, site_ID: 2916284 }
				]
			}
		} );

		expect( state ).to.eql( {
			2916284: [ 1 ]
		} );
	} );

	it( 'should not replace known connections for unrelated sites', () => {
		const state = connectionsBySiteId( {
			77203074: [ 1, 2 ]
		}, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [
					{ ID: 1, site_ID: 2916284 }
				]
			}
		} );

		expect( state ).to.eql( {
			77203074: [ 1, 2 ],
			2916284: [ 1 ]
		} );
	} );

	describe( 'persistence', () => {
		it( 'should persist data', () => {
			const state = Object.freeze( {
				77203074: [ 1, 2 ],
				2916284: [ 1 ]
			} );
			const persistedState = connectionsBySiteId( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( state );
		} );

		it( 'should load valid data', () => {
			const persistedState = Object.freeze( {
				77203074: [ 1, 2 ],
				2916284: [ 1 ]
			} );
			const state = connectionsBySiteId( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( persistedState );
		} );

		it.skip( 'should ignore loading data with invalid keys', () => {
			const persistedState = Object.freeze( {
				77203074: [ 1, 2 ],
				foo: [ 1 ]
			} );
			const state = connectionsBySiteId( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );

		it.skip( 'should ignore loading data with invalid values', () => {
			const persistedState = Object.freeze( {
				77203074: [ 1, 'bar' ],
				2916284: [ 1 ]
			} );
			const state = connectionsBySiteId( persistedState, {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( {} );
		} );
	} );
} );
