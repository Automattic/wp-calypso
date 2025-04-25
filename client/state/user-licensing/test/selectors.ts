/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import * as selectors from 'calypso/state/user-licensing/selectors';

const userLicensingState = {
	userLicensing: {
		licensesFetching: false,
		hasFetchedLicenses: false,
		licenses: null,
		countsFetching: false,
		hasFetchedLicenseCounts: true,
		counts: null,
	},
};

const licensesResponse = {
	currentPage: 1,
	itemsPerPage: 50,
	totalPages: 1,
	currentItems: 0,
	totalItems: 0,
	items: [],
};

const countsResponse = {
	attached: 0,
	detached: 0,
	revoked: 0,
	not_revoked: 0,
};

describe( 'selectors', () => {
	describe( '#hasFetchedUserLicenses()', () => {
		test( 'should return the value of hasFetchedLicenses', () => {
			const { hasFetchedUserLicenses } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( hasFetchedUserLicenses( state ) ).toEqual( false );

			state.userLicensing.hasFetchedLicenses = true;
			expect( hasFetchedUserLicenses( state ) ).toEqual( true );
		} );
	} );

	describe( '#isFetchingUserLicenses()', () => {
		test( 'should return the value of licensesFetching', () => {
			const { isFetchingUserLicenses } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( isFetchingUserLicenses( state ) ).toEqual( false );

			state.userLicensing.licensesFetching = true;
			expect( isFetchingUserLicenses( state ) ).toEqual( true );
		} );
	} );

	describe( '#getUserLicenses()', () => {
		test( 'should return null if licenses have not been fetched yet.', () => {
			const { getUserLicenses } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( getUserLicenses( state ) ).toEqual( null );
		} );

		test( 'should return the value of state.userLicensing.licenses', () => {
			const { getUserLicenses } = selectors;
			const state = {
				...userLicensingState,
				userLicensing: {
					...userLicensingState.userLicensing,
					licenses: {
						...licensesResponse,
					},
				},
			};

			expect( getUserLicenses( state ) ).toEqual( state.userLicensing.licenses );

			const licenses = {
				currentPage: 2,
				itemsPerPage: 50,
				totalPages: 2,
				currentItems: 1,
				totalItems: 1,
				items: [
					{
						licenseId: 1252244,
						licenseKey: 'jetpack_scan_fdsgfdbcv5of34i7hCG5rE',
						issuedAt: '2021-10-15 18:40:44',
						attachedAt: null,
						revokedAt: null,
						productId: 2106,
						blogId: 123456789,
						userId: 87654321,
						product: 'Jetpack Scan Daily',
						username: null,
						siteurl: null,
					},
				],
			};
			state.userLicensing.licenses = licenses;
			expect( getUserLicenses( state ) ).toEqual( licenses );
		} );
	} );

	describe( '#getLicensesCounts()', () => {
		test( 'should return null if licenses counts have not been fetched yet.', () => {
			const { getUserLicensesCounts } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( getUserLicensesCounts( state ) ).toEqual( null );
		} );

		test( 'should return the value of state.userLicensing.counts', () => {
			const { getUserLicensesCounts } = selectors;
			const state = {
				...userLicensingState,
				userLicensing: {
					...userLicensingState.userLicensing,
					counts: {
						...countsResponse,
					},
				},
			};

			expect( getUserLicensesCounts( state ) ).toEqual( state.userLicensing.counts );

			const counts = {
				attached: 1,
				detached: 1,
				revoked: 0,
				not_revoked: 2,
			};
			state.userLicensing.counts = counts;
			expect( getUserLicensesCounts( state ) ).toEqual( counts );
		} );
	} );

	describe( '#hasFetchedUserLicensesCounts()', () => {
		test( 'should return the value of hasFetchedLicenseCounts', () => {
			const { hasFetchedUserLicensesCounts } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( hasFetchedUserLicensesCounts( state ) ).toEqual(
				userLicensingState.userLicensing.hasFetchedLicenseCounts
			);

			state.userLicensing.hasFetchedLicenseCounts = true;
			expect( hasFetchedUserLicensesCounts( state ) ).toEqual( true );
		} );
	} );

	describe( '#isFetchingUserLicensesCounts()', () => {
		test( 'should return the value of countsFetching', () => {
			const { isFetchingUserLicensesCounts } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( isFetchingUserLicensesCounts( state ) ).toEqual(
				userLicensingState.userLicensing.countsFetching
			);

			state.userLicensing.countsFetching = true;
			expect( isFetchingUserLicensesCounts( state ) ).toEqual( true );
		} );
	} );
} );
