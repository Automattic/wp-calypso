/**
 * Internal dependencies
 */
import { fetchSiteProductsCompleted } from '../actions';
import { SITE_PRODUCTS_FETCH_COMPLETED } from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( '#fetchSiteProductsCompleted()', () => {
		test( 'should return an action object with an array of products', () => {
			const siteId = 2916284;
			const action = fetchSiteProductsCompleted( siteId, {} );

			expect( action ).toEqual( {
				type: SITE_PRODUCTS_FETCH_COMPLETED,
				siteId,
				products: {},
			} );
		} );
	} );
} );
