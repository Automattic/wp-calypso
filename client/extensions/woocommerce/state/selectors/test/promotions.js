/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPromotions,
	getPromotionsPage,
	getPromotionsCurrentPage,
	getPromotionsPerPage,
} from '../promotions';

describe( 'promotions', () => {
	const rootState = {
		extensions: {
			woocommerce: {
				ui: {
					promotions: {
						list: {
							currentPage: 12,
							perPage: 30,
						},
					},
				},
				sites: {
					123: {
						promotions: {
							promotions: [ { type: 'empty1' }, { type: 'empty2' }, { type: 'empty3' } ],
						},
					},
				},
			},
		},
	};

	describe( '#getPromotions', () => {
		test( 'should return promotions for a given site.', () => {
			const promotions = getPromotions( rootState, 123 );

			expect( promotions ).to.exist;
			expect( promotions[ 0 ].type ).to.equal( 'empty1' );
			expect( promotions[ 1 ].type ).to.equal( 'empty2' );
			expect( promotions[ 2 ].type ).to.equal( 'empty3' );
		} );
	} );

	describe( '#getPromotionsPage', () => {
		test( 'should return only promotions for a given page.', () => {
			const page = getPromotionsPage( rootState, 123, 1, 2 );

			expect( page ).to.exist;
			expect( page.length ).to.equal( 2 );
			expect( page[ 0 ].type ).to.equal( 'empty1' );
			expect( page[ 1 ].type ).to.equal( 'empty2' );
		} );

		test( 'should advance the offset for pages > 1.', () => {
			const page = getPromotionsPage( rootState, 123, 2, 2 );

			expect( page ).to.exist;
			expect( page.length ).to.equal( 1 );
			expect( page[ 0 ].type ).to.equal( 'empty3' );
		} );
	} );

	describe( '#getPromotionsCurrentPage', () => {
		test( 'should return the current viewing page.', () => {
			const page = getPromotionsCurrentPage( rootState );
			expect( page ).to.equal( 12 );
		} );
	} );

	describe( '#getPromotionsPerPage', () => {
		test( 'should return the per-page setting for promotions.', () => {
			const perPage = getPromotionsPerPage( rootState );
			expect( perPage ).to.equal( 30 );
		} );
	} );
} );
