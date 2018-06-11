/** @format */

/**
 * Internal dependencies
 */
import { fetchSitePlansCompleted, transferPlanOwnership } from '../actions';
import { SITE_PLANS_FETCH_COMPLETED, SITE_PLAN_OWNERSHIP_TRANSFER } from 'state/action-types';

describe( 'actions', () => {
	describe( '#fetchSitePlansCompleted()', () => {
		test( 'should return an action object with an array of plans', () => {
			const siteId = 2916284,
				action = fetchSitePlansCompleted( siteId, {} );

			expect( action ).toEqual( {
				type: SITE_PLANS_FETCH_COMPLETED,
				siteId,
				plans: [],
			} );
		} );
	} );

	describe( '#transferPlanOwnership()', () => {
		test( 'should return an action object for transferring the plan of a site to a user', () => {
			const siteId = 2916284;
			const newUserId = 123456;
			const action = transferPlanOwnership( siteId, newUserId );

			expect( action ).toEqual( {
				type: SITE_PLAN_OWNERSHIP_TRANSFER,
				newUserId,
				siteId,
			} );
		} );
	} );
} );
