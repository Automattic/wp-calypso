/**
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import * as selectors from 'calypso/state/partner-portal/licenses/selectors';

describe( 'selectors', () => {
	describe( '#hasFetchedLicenses()', () => {
		test( 'should return the value of hasFetched', () => {
			const { hasFetchedLicenses } = selectors;
			const state = {
				partnerPortal: {
					licenses: {
						hasFetched: false,
					},
				},
			};

			expect( hasFetchedLicenses( state ) ).toEqual( false );

			state.partnerPortal.licenses.hasFetched = true;
			expect( hasFetchedLicenses( state ) ).toEqual( true );
		} );
	} );

	describe( '#isFetchingLicenses()', () => {
		test( 'should return the value of isFetching', () => {
			const { isFetchingLicenses } = selectors;
			const state = {
				partnerPortal: {
					licenses: {
						isFetching: false,
					},
				},
			};

			expect( isFetchingLicenses( state ) ).toEqual( false );

			state.partnerPortal.licenses.isFetching = true;
			expect( isFetchingLicenses( state ) ).toEqual( true );
		} );
	} );

	describe( '#getPaginatedLicenses()', () => {
		test( 'should return the value of paginated', () => {
			const { getPaginatedLicenses } = selectors;
			const state = {
				partnerPortal: {
					licenses: {
						paginated: null,
					},
				},
			};

			expect( getPaginatedLicenses( state ) ).toEqual( null );

			const value = { totalPages: 0 };
			state.partnerPortal.licenses.paginated = value;
			expect( getPaginatedLicenses( state ) ).toEqual( value );
		} );
	} );

	describe( '#getLicenseCounts()', () => {
		test( 'should return the value of counts', () => {
			const { getLicenseCounts } = selectors;
			const expected = { attached: 0 };
			const state = {
				partnerPortal: {
					licenses: {
						counts: expected,
					},
				},
			};

			expect( getLicenseCounts( state ) ).toEqual( expected );
		} );
	} );
} );
