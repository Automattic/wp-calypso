/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { CURRENT_USER_ID_SET } from 'state/action-types';
import { id } from '../reducer';

describe( 'reducer', () => {
	describe( '#id()', () => {
		it( 'should default to null', () => {
			const state = id( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the current user ID', () => {
			const state = id( null, {
				type: CURRENT_USER_ID_SET,
				userId: 73705554
			} );

			expect( state ).to.equal( 73705554 );
		} );
	} );
} );
