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

jest.mock( 'calypso/state/partner-portal/partner/selectors', () => ( {
	getActivePartnerKey: () => ( { oauth2_token: 'fake_oauth2_token' } ),
} ) );

describe( 'actions', () => {
	describe( '#fetchLicenses()', () => {
		test( 'should dispatch a request action when called', () => {
			const { fetchLicenses } = actions;

			expect(
				fetchLicenses(
					LicenseState.Detached,
					'bar',
					LicenseSortField.IssuedAt,
					LicenseSortDirection.Descending
				)
			).toEqual( {
				type: JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
				filter: LicenseState.Detached,
				search: 'bar',
				fetcher: 'wpcomJetpackLicensing',
				sortField: LicenseSortField.IssuedAt,
				sortDirection: LicenseSortDirection.Descending,
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
