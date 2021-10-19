/**
 * @jest-environment jsdom
 */

import * as selectors from 'calypso/state/user-licensing/selectors';

const userLicensingState = {
	userLicensing: {
		licensesFetching: false,
		hasFetchedLicenses: false,
		licenses: {
			currentPage: 1,
			itemsPerPage: 50,
			totalPages: 1,
			currentItems: 0,
			totalItems: 0,
			items: [],
		},
		countsFetching: false,
		hasFetchedLicenseCounts: true,
		counts: {
			attached: 0,
			detached: 0,
			revoked: 0,
			not_revoked: 0,
		},
	},
};

describe( 'selectors', () => {
	describe( '#hasFetchedLicenses()', () => {
		test( 'should return the value of hasFetched', () => {
			const { hasFetchedLicenses } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( hasFetchedLicenses( state ) ).toEqual( false );

			state.userLicensing.hasFetchedLicenses = true;
			expect( hasFetchedLicenses( state ) ).toEqual( true );
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
		test( 'should return the value of licenses', () => {
			const { getUserLicenses } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( getUserLicenses( state ) ).toEqual( userLicensingState.userLicensing.licenses );

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
		test( 'should return the value of counts', () => {
			const { getUserLicensesCounts } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( getUserLicensesCounts( state ) ).toEqual( userLicensingState.userLicensing.counts );

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

	describe( '#hasFetchedLicenseCounts()', () => {
		test( 'should return the value of hasFetchedLicenseCounts', () => {
			const { hasFetchedLicenseCounts } = selectors;
			const state = {
				...userLicensingState,
			};

			expect( hasFetchedLicenseCounts( state ) ).toEqual(
				userLicensingState.userLicensing.hasFetchedLicenseCounts
			);

			state.userLicensing.hasFetchedLicenseCounts = true;
			expect( hasFetchedLicenseCounts( state ) ).toEqual( true );
		} );
	} );
} );
