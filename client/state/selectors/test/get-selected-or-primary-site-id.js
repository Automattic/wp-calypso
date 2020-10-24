/**
 * External dependencies
 */
import { expect } from 'chai';

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
			expect( siteId ).to.be.null;
		} );

		test( "should return the selected site's ID if there is one", () => {
			const siteId = getSelectedOrPrimarySiteId( {
				ui: { selectedSiteId: 2916284 },
			} );
			expect( siteId ).to.equal( 2916284 );
		} );
	} );

	describe( 'with a current user', () => {
		test( "should return the current user's primary site's ID if there is no site selected", () => {
			const siteId = getSelectedOrPrimarySiteId( {
				currentUser: { id: 12345678 },
				ui: {},
				users: { items: { 12345678: { primary_blog: 7654321 } } },
			} );
			expect( siteId ).to.equal( 7654321 );
		} );

		test( "should return the selected site's ID if there is one", () => {
			const siteId = getSelectedOrPrimarySiteId( {
				currentUser: { id: 12345678 },
				ui: { selectedSiteId: 2916284 },
				users: { items: { 12345678: { primary_blog: 7654321 } } },
			} );
			expect( siteId ).to.equal( 2916284 );
		} );
	} );
} );
