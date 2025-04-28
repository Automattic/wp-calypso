/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import {
	USER_LICENSES_REQUEST,
	USER_LICENSES_RECEIVE,
	USER_LICENSES_COUNTS_REQUEST,
	USER_LICENSES_COUNTS_RECEIVE,
} from 'calypso/state/action-types';
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';
import * as actions from 'calypso/state/user-licensing/actions';

jest.mock( 'calypso/state/partner-portal/partner/selectors', () => ( {
	getActivePartnerKey: () => ( { oAuth2Token: 'fake_oauth2_token' } ),
} ) );

describe( 'actions', () => {
	describe( '#requestLicenses()', () => {
		test( 'should return a thunk which dispatches 2 actions when called', () => {
			const { requestLicenses } = actions;
			const dispatch = jest.fn();

			const thunk = requestLicenses(
				LicenseFilter.Detached,
				'bar',
				LicenseSortField.IssuedAt,
				LicenseSortDirection.Descending,
				2
			);

			thunk( dispatch );

			expect( dispatch.mock.calls[ 0 ][ 0 ] ).toEqual( {
				type: USER_LICENSES_REQUEST,
				filter: LicenseFilter.Detached,
				search: 'bar',
				sortField: LicenseSortField.IssuedAt,
				sortDirection: LicenseSortDirection.Descending,
				page: 2,
				perPage: LICENSES_PER_PAGE,
			} );

			expect( dispatch.mock.calls[ 1 ][ 0 ] ).toEqual( {
				type: USER_LICENSES_COUNTS_REQUEST,
			} );
		} );
	} );

	describe( '#receiveLicensesAction()', () => {
		test( 'should return an action when called', () => {
			const { licensesReceiveAction } = actions;
			const licenses = {
				currentPage: 1,
				itemsPerPage: 50,
				totalPages: 1,
				currentItems: 0,
				totalItems: 0,
				items: [],
			};

			expect( licensesReceiveAction( licenses ) ).toEqual( {
				type: USER_LICENSES_RECEIVE,
				licenses,
			} );
		} );
	} );

	describe( '#requestLicensesCounts()', () => {
		test( 'should dispatch a request action when called', () => {
			const { requestLicensesCounts } = actions;

			expect( requestLicensesCounts() ).toEqual( {
				type: USER_LICENSES_COUNTS_REQUEST,
			} );
		} );
	} );

	describe( '#licensesCountsReceiveAction()', () => {
		test( 'should return an action when called', () => {
			const { licensesCountsReceiveAction } = actions;
			const counts = {
				attached: 1,
				detached: 1,
				revoked: 0,
				not_revoked: 2,
			};

			expect( licensesCountsReceiveAction( counts ) ).toEqual( {
				type: USER_LICENSES_COUNTS_RECEIVE,
				counts,
			} );
		} );
	} );
} );
