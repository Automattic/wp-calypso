/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_TERM_ADDED_SET } from 'state/action-types';
import reducer, { added } from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'added'
		] );
	} );

	describe( '#added()', () => {
		it( 'should default to null', () => {
			const state = added( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should track last added term site, post, taxonomy combo', () => {
			const state = added( undefined, {
				type: EDITOR_TERM_ADDED_SET,
				siteId: 2916284,
				postId: 841,
				taxonomy: 'category',
				termId: 111
			} );

			expect( state ).to.eql( {
				2916284: {
					841: {
						category: 111
					}
				}
			} );
		} );
	} );
} );
