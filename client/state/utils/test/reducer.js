/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { UTILS_UNIQUEID_INCREMENT } from 'state/action-types';
import { uniqueId } from '../reducer';

describe( 'reducer', () => {
	describe( 'uniqueId', () => {
		it( 'should default to a number', () => {
			const state = uniqueId( undefined, {} );
			expect( state ).to.be.a( 'number' );
		} );

		it( 'action UTILS_UNIQUEID_INCREMENT should increment previous state', () => {
			const state = uniqueId( 1, { type: UTILS_UNIQUEID_INCREMENT } );
			expect( state ).to.eql( 2 );
		} );
	} );
} );
