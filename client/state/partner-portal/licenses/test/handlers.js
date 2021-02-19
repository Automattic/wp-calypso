/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import * as handlers from 'calypso/state/partner-portal/licenses/handlers';
import {
	WPCOM_HTTP_REQUEST,
	JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
} from 'calypso/state/action-types';
import { LicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/types';

describe( 'handlers', () => {
	describe( '#fetchLicenses()', () => {
		test( 'should return an http request action', () => {
			const { fetchLicenses } = handlers;
			const action = {
				type: 'TEST_ACTION',
				filter: LicenseState.NotRevoked,
				search: '',
				fetcher: 'wpcomJetpackLicensing',
			};
			const expected = {
				type: WPCOM_HTTP_REQUEST,
				body: undefined,
				method: 'GET',
				path: '/jetpack-licensing/licenses',
				query: {
					apiNamespace: 'wpcom/v2',
					filter: action.filter,
				},
				formData: undefined,
				onSuccess: action,
				onFailure: action,
				onProgress: action,
				onStreamRecord: action,
				options: { options: { fetcher: action.fetcher } },
			};

			expect( fetchLicenses( action ) ).toEqual( expected );
		} );

		test( 'should return an http request action for a custom filter', () => {
			const { fetchLicenses } = handlers;
			const action = {
				type: 'TEST_ACTION',
				filter: LicenseState.Revoked,
				search: '',
				fetcher: 'wpcomJetpackLicensing',
			};
			const expected = {
				type: WPCOM_HTTP_REQUEST,
				body: undefined,
				method: 'GET',
				path: '/jetpack-licensing/licenses',
				query: {
					apiNamespace: 'wpcom/v2',
					filter: action.filter,
				},
				formData: undefined,
				onSuccess: action,
				onFailure: action,
				onProgress: action,
				onStreamRecord: action,
				options: { options: { fetcher: action.fetcher } },
			};

			expect( fetchLicenses( action ) ).toEqual( expected );
		} );

		test( 'should return an http request action for a search and ignore filters', () => {
			const { fetchLicenses } = handlers;
			const action = {
				type: 'TEST_ACTION',
				filter: LicenseState.Revoked,
				search: 'foo',
				fetcher: 'wpcomJetpackLicensing',
			};
			const expected = {
				type: WPCOM_HTTP_REQUEST,
				body: undefined,
				method: 'GET',
				path: '/jetpack-licensing/licenses',
				query: {
					apiNamespace: 'wpcom/v2',
					// No filter present intentionally as search overrides it.
					search: action.search,
				},
				formData: undefined,
				onSuccess: action,
				onFailure: action,
				onProgress: action,
				onStreamRecord: action,
				options: { options: { fetcher: action.fetcher } },
			};

			expect( fetchLicenses( action ) ).toEqual( expected );
		} );
	} );

	describe( '#receiveLicenses()', () => {
		test( 'should return a LICENSES_RECEIVE action', () => {
			const { receiveLicenses } = handlers;
			const paginatedLicenses = [ 'foo' ];
			const expected = {
				type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
				paginatedLicenses,
			};

			expect( receiveLicenses( null, paginatedLicenses ) ).toEqual( expected );
		} );
	} );

	describe( '#receiveLicensesError()', () => {
		test( 'should return an error notice action', () => {
			const { receiveLicensesError } = handlers;
			const expected = {
				type: 'NOTICE_CREATE',
				notice: {
					showDismiss: true,
					noticeId: '1',
					status: 'is-error',
					text: translate( 'Failed to retrieve your licenses. Please try again later.' ),
				},
			};

			expect( receiveLicensesError() ).toEqual( expected );
		} );
	} );
} );
