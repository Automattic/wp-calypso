/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchSitePlansCompleted } from '../actions';
import { SITE_PLANS_FETCH_COMPLETED } from 'state/action-types';

describe( 'actions', () => {
	describe( '#fetchSitePlansCompleted()', () => {
		it( 'should return an action object with an array of plans', () => {
			const siteId = 2916284,
				action = fetchSitePlansCompleted( siteId, {} );

			expect( action ).to.eql( {
				type: SITE_PLANS_FETCH_COMPLETED,
				siteId,
				plans: []
			} );
		} );
	} );
} );
