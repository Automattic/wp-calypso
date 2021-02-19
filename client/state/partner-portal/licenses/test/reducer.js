/**
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import * as reducers from 'calypso/state/partner-portal/licenses/reducer';
import {
	JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
	JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( '#hasFetched', () => {
		test( 'should return true on request success', () => {
			const { hasFetched } = reducers;

			const state = undefined;
			const action = { type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE };
			expect( hasFetched( state, action ) ).toEqual( true );
		} );
	} );

	describe( '#isFetching', () => {
		test( 'should return true on request start', () => {
			const { isFetching } = reducers;

			const state = undefined;
			const action = { type: JETPACK_PARTNER_PORTAL_LICENSES_REQUEST };
			expect( isFetching( state, action ) ).toEqual( true );
		} );

		test( 'should return false on request success', () => {
			const { isFetching } = reducers;

			const state = undefined;
			const action = { type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE };
			expect( isFetching( state, action ) ).toEqual( false );
		} );
	} );

	describe( '#paginated', () => {
		test( 'should return the value of paginatedLicenses on request success', () => {
			const { paginated } = reducers;

			const state = undefined;
			const action = {
				type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
				paginatedLicenses: [ 'foo' ],
			};
			expect( paginated( state, action ) ).toEqual( action.paginatedLicenses );
		} );
	} );
} );
