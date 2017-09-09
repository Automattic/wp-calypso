/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchReviews } from '../actions';
import {
	WOOCOMMERCE_REVIEWS_REQUEST,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchReviews()', () => {
		const siteId = '123';
		it( 'should return an action', () => {
			const action = fetchReviews( siteId );
			expect( action ).to.eql( { type: WOOCOMMERCE_REVIEWS_REQUEST, siteId, query: {} } );
		} );
	} );
} );
