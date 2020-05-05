/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { updateCurrentReviewsQuery } from '../actions';
import { WOOCOMMERCE_UI_REVIEWS_SET_QUERY } from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#updateCurrentReviewsQuery()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const action = updateCurrentReviewsQuery( siteId, { page: 2, search: 'testing' } );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_UI_REVIEWS_SET_QUERY,
				siteId,
				query: { page: 2, search: 'testing' },
			} );
		} );
	} );
} );
