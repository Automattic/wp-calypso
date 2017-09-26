/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPromotions,
} from '../promotions';

describe( 'promotions', () => {
	const rootState = {
		extensions: {
			woocommerce: {
				sites: {
					123: {
						promotions: {
							promotions: [
								{ type: 'empty1' },
								{ type: 'empty2' },
								{ type: 'empty3' },
							]
						}
					}
				}
			}
		}
	};

	describe( '#getPromotions', () => {
		it( 'should return promotions for a given site.', () => {
			const promotions = getPromotions( rootState, 123 );

			expect( promotions ).to.exist;
			expect( promotions[ 0 ].type ).to.equal( 'empty1' );
			expect( promotions[ 1 ].type ).to.equal( 'empty2' );
			expect( promotions[ 2 ].type ).to.equal( 'empty3' );
		} );
	} );
} );

