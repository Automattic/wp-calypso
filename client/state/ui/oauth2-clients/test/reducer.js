/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { currentClientId } from '../reducer';
import { ROUTE_SET, SERIALIZE, DESERIALIZE } from 'state/action-types';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'currentClientId',
		] );
	} );

	describe( 'currentClientId', () => {
		it( 'should default to undefined', () => {
			const state = currentClientId( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should be updated on ROUTE_SET when the route starts with /log-in', () => {
			const state = currentClientId( undefined, {
				type: ROUTE_SET,
				path: '/log-in/fr',
				query: {
					client_id: 42,
					retry: 1,
				},
			} );

			expect( state ).to.equal( 42 );
		} );

		it( 'should not persist state', () => {
			const state = currentClientId( true, {
				type: SERIALIZE
			} );
			expect( state ).to.be.null;
		} );

		it( 'should not load persisted state', () => {
			const state = currentClientId( true, {
				type: DESERIALIZE
			} );
			expect( state ).to.be.null;
		} );
	} );
} );
