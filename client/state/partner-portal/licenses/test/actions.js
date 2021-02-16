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
} from 'calypso/state/action-types';
import { LicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/types';

jest.mock( 'calypso/state/partner-portal/partner/selectors', () => ( {
	getActivePartnerKey: () => ( { oauth2_token: 'fake_oauth2_token' } ),
} ) );

describe( 'actions', () => {
	describe( '#fetchLicenses()', () => {
		test( 'should dispatch a request action when called', () => {
			const { fetchLicenses } = actions;

			expect( fetchLicenses( LicenseState.Detached, 'bar' ) ).toEqual( {
				type: JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
				filter: LicenseState.Detached,
				search: 'bar',
				fetcher: 'wpcomJetpackLicensing',
			} );
		} );
	} );

	describe( '#receiveLicenses()', () => {
		test( 'should return an action when called', () => {
			const { receiveLicenses } = actions;
			const licenses = [];

			expect( receiveLicenses( licenses ) ).toEqual( {
				type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
				licenses,
			} );
		} );
	} );
} );
