/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getAvailableProductsBySiteId,
	getProductsBySiteId,
	isRequestingSiteProducts,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getProductsBySiteId()', () => {
		test( 'should return products by site id', () => {
			const products1 = {
				data: { first_product: { available: true }, second_product: { available: false } },
			};
			const products2 = {
				data: { first_product: { available: false }, second_product: { available: true } },
			};
			const state = {
				sites: {
					products: {
						2916284: products1,
						77203074: products2,
					},
				},
			};
			const products = getProductsBySiteId( state, 2916284 );

			expect( products ).to.eql( products1 );
		} );
	} );

	describe( '#getAvailableProductsBySiteId()', () => {
		test( 'should return available products by site id', () => {
			const state = {
				sites: {
					products: {
						2916284: {
							data: {
								first_product: { available: true },
								second_product: { available: false },
								third_product: { available: true },
								fourth_product: {},
							},
						},
					},
				},
			};
			const products = getAvailableProductsBySiteId( state, 2916284 );

			expect( products ).to.eql( {
				data: { first_product: { available: true }, third_product: { available: true } },
			} );
		} );
	} );

	describe( '#isRequestingSiteProducts()', () => {
		test( 'should return true if we are fetching products', () => {
			const state = {
				sites: {
					products: {
						2916284: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: true,
						},
						77203074: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: false,
						},
					},
				},
			};

			expect( isRequestingSiteProducts( state, 2916284 ) ).to.equal( true );
			expect( isRequestingSiteProducts( state, 77203074 ) ).to.equal( false );
			expect( isRequestingSiteProducts( state, 'unknown' ) ).to.equal( false );
		} );
	} );
} );
