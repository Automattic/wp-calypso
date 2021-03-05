/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getVariationsForProduct } from '../selectors';
import productVariations from './fixtures/variations';

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					products: {},
					productVariations,
				},
			},
		},
	},
};

describe( 'selectors', () => {
	describe( '#getVariationsForProduct', () => {
		test( 'should give the variations when present.', () => {
			const variations15 = getVariationsForProduct( loadedState, 15, 123 );

			expect( variations15 ).to.exist;
			expect( variations15[ 0 ].id ).to.equal( 733 );
			expect( variations15[ 0 ].price ).to.equal( '9.00' );
			expect( variations15[ 0 ].attributes[ 0 ].option ).to.equal( 'Green' );
			expect( variations15[ 1 ].id ).to.equal( 732 );
			expect( variations15[ 1 ].price ).to.equal( '9.00' );
			expect( variations15[ 1 ].attributes[ 0 ].option ).to.equal( 'Black' );
		} );

		test( 'should return undefined if the variations are not present.', () => {
			const nonexistentId = 282220;
			expect( getVariationsForProduct( loadedState, nonexistentId, 123 ) ).to.be.undefined;
		} );
	} );
} );
