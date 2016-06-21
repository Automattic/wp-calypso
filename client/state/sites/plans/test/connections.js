
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
import { createWpcomSpy } from 'test/helpers/use-sinon';

describe( 'connections', () => {
	describe( '#connectFetchSitePlans()', () => {
		const dispatchMock = spy();

		it( 'should pass siteId to API call', () => {
			const wpcom = createWpcomSpy(
				[ 'undocumented', 'getSitePlans' ],
				( siteId, callback ) => callback( null, {} )
			);
			connectFetchSitePlans( wpcom )( { siteId: 5 }, dispatchMock );
			expect( wpcom.responseSpy.calledWith( 5 ) ).ok;
		} );

		it( 'should dispatch "SITE_PLANS_FETCH_COMPLETED" upon success', () => {
			const wpcom = createWpcomSpy(
				[ 'undocumented', 'getSitePlans' ],
				( siteId, callback ) => callback( null, {} )
			);
			connectFetchSitePlans( wpcom )( { siteId: 5 }, dispatchMock );
			expect(
				dispatchMock.calledWithMatch( { type: SITE_PLANS_FETCH_COMPLETED, siteId: 5 } )
			).ok;
		} );
		it( 'should dispatch "SITE_PLANS_FETCH_FAILED" upon failure and pass proper error message', () => {
			const wpcom = createWpcomSpy(
				[ 'undocumented', 'getSitePlans' ],
				( siteId, callback ) => callback( { message: 'error message' }, {} )
			);
			connectFetchSitePlans( wpcom )( { siteId: 5 }, dispatchMock );
			expect(
				dispatchMock.calledWithMatch( { type: SITE_PLANS_FETCH_FAILED, siteId: 5, error: 'error message' } )
			).ok;
		} );
	} );
} );