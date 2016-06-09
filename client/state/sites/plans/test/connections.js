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

/**
 * Creates a sinon spy out of responseFunction and wraps it in layers of function calls, like wpcom does.
 * Returned object stubs wpcom.
 * responseSpy attribute of returned object provides reference to sinon spy.
 * @param {Array} path
 * @param {Function} responseFunction
 * @returns {Object} wpcom-like wrapped object
 */
function createWpcomSpy( path, responseFunction ) {
	const responseSpy = spy( responseFunction );
	const wpcom =  path.reverse().reduce( ( prev, current, index ) => ( { [ current ]: index ? () => prev : prev } ), responseSpy );
	wpcom.responseSpy = responseSpy;
	return wpcom;
}

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
