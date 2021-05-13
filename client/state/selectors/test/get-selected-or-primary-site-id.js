/**
 * Internal dependencies
 */
import getSelectedOrPrimarySiteId from 'calypso/state/selectors/get-selected-or-primary-site-id';

describe( 'getSelectedOrPrimarySiteId()', () => {
	describe( 'with no current user', () => {
		test( 'should return null if there is no site selected', () => {
			const siteId = getSelectedOrPrimarySiteId( {
				currentUser: {},
				ui: {},
			} );
			expect( siteId ).toBeNull();
		} );

		test( "should return the selected site's ID if there is one", () => {
			const siteId = getSelectedOrPrimarySiteId( {
				ui: { selectedSiteId: 2916284 },
			} );
			expect( siteId ).toBe( 2916284 );
		} );
	} );

	describe( 'with a current user', () => {
		test( "should return the current user's primary site's ID if there is no site selected", () => {
			const siteId = getSelectedOrPrimarySiteId( {
				currentUser: {
					id: 12345678,
					user: { ID: 12345678, primary_blog: 7654321 },
				},
				ui: {},
			} );
			expect( siteId ).toBe( 7654321 );
		} );

		test( "should return the selected site's ID if there is one", () => {
			const siteId = getSelectedOrPrimarySiteId( {
				currentUser: {
					id: 12345678,
					user: { ID: 12345678, primary_blog: 7654321 },
				},
				ui: { selectedSiteId: 2916284 },
			} );
			expect( siteId ).toBe( 2916284 );
		} );
	} );
} );
