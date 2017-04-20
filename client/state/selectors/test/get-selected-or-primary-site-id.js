/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSelectedOrPrimarySiteId } from '../';

describe( 'getSelectedOrPrimarySiteId()', () => {
	context( 'with no site selected', () => {
		it( 'should return null if there is no current user', ( ) => {
			const siteId = getSelectedOrPrimarySiteId( {
				currentUser: {},
				ui: {},
			} );
			expect( siteId ).to.be.null;
		} );

		it( 'should return current user\'s primary site\'s ID', () => {
			const siteId = getSelectedOrPrimarySiteId( {
				currentUser: { id: 12345678 },
				ui: {},
				users: { items: { 12345678: { primary_blog: 7654321 } } },
			} );
			expect( siteId ).to.equal( 7654321 );
		} );
	} );

	context( 'with a site selected', () => {
		it( 'should return the selected site\'s ID', ( ) => {
			const siteId = getSelectedOrPrimarySiteId( {
				ui: { selectedSiteId: 2916284 }
			} );
			expect( siteId ).to.equal( 2916284 );
		} );
	} );
} );
