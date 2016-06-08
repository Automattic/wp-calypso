/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { SITE_PLANS_FETCH_COMPLETED, SITE_PLANS_FETCH_FAILED } from 'state/action-types';
import { connectFetchSitePlans } from '../connections';

describe( 'connections', () => {
	describe( '#connectFetchSitePlans()', () => {
		let apiError = null;
		const dispatchMock = spy();
		const getSitePlansMock = spy( ( siteId, callback ) => callback( apiError, {} ) );
		const connectedFetchSitePlans = connectFetchSitePlans( { undocumented: () => ( {
			getSitePlans: getSitePlansMock
		} ) } );

		it( 'should pass siteId to API call', () => {
			connectedFetchSitePlans( { siteId: 5 }, dispatchMock );
			expect(
				getSitePlansMock.calledWith( 5 )
			).ok;
		} );

		it( 'should dispatch "SITE_PLANS_FETCH_COMPLETED" upon success', () => {
			apiError = null;
			connectedFetchSitePlans( { siteId: 5 }, dispatchMock );
			expect(
				dispatchMock.calledWithMatch( { type: SITE_PLANS_FETCH_COMPLETED, siteId: 5 } )
			).ok;
		} );
		it( 'should dispatch "SITE_PLANS_FETCH_FAILED" upon failure and pass proper error message', () => {
			apiError = { message: 'error message' };
			connectedFetchSitePlans( { siteId: 5 }, dispatchMock );
			expect(
				dispatchMock.calledWithMatch( { type: SITE_PLANS_FETCH_FAILED, siteId: 5, error: 'error message' } )
			).ok;
		} );
	} );
} );
