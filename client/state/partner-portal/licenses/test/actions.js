/**
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import * as actions from 'calypso/state/partner-portal/licenses/actions';
import {
	JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
	JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
	JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_REQUEST,
	JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_RECEIVE,
} from 'calypso/state/action-types';
import {
	LicenseState,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';

jest.mock( 'calypso/state/partner-portal/partner/selectors', () => ( {
	getActivePartnerKey: () => ( { oAuth2Token: 'fake_oauth2_token' } ),
} ) );

describe( 'actions', () => {
	describe( '#fetchLicenses()', () => {
		test( 'should return a thunk which dispatches 2 actions when called', () => {
			const { fetchLicenses } = actions;
			const dispatch = jest.fn();

			const thunk = fetchLicenses(
				LicenseState.Detached,
				'bar',
				LicenseSortField.IssuedAt,
				LicenseSortDirection.Descending,
				2
			);

			thunk( dispatch );

			expect( dispatch.mock.calls[ 0 ][ 0 ] ).toEqual( {
				type: JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
				filter: LicenseState.Detached,
				search: 'bar',
				sortField: LicenseSortField.IssuedAt,
				sortDirection: LicenseSortDirection.Descending,
				page: 2,
				perPage: LICENSES_PER_PAGE,
				fetcher: 'wpcomJetpackLicensing',
			} );

			expect( dispatch.mock.calls[ 1 ][ 0 ] ).toEqual( {
				type: JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_REQUEST,
				fetcher: 'wpcomJetpackLicensing',
			} );
		} );
	} );

	describe( '#receiveLicenses()', () => {
		test( 'should return an action when called', () => {
			const { receiveLicenses } = actions;
			const paginatedLicenses = [ 'foo' ];

			expect( receiveLicenses( paginatedLicenses ) ).toEqual( {
				type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
				paginatedLicenses,
			} );
		} );
	} );

	describe( '#fetchLicenseCounts()', () => {
		test( 'should dispatch a request action when called', () => {
			const { fetchLicenseCounts } = actions;

			expect( fetchLicenseCounts() ).toEqual( {
				type: JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_REQUEST,
				fetcher: 'wpcomJetpackLicensing',
			} );
		} );
	} );

	describe( '#receiveLicenseCounts()', () => {
		test( 'should return an action when called', () => {
			const { receiveLicenseCounts } = actions;
			const counts = [ 'foo' ];

			expect( receiveLicenseCounts( counts ) ).toEqual( {
				type: JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_RECEIVE,
				counts,
			} );
		} );
	} );
} );
