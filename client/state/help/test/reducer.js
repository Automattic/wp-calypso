/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { selectedSiteId } from '../reducer';
import { HELP_CONTACT_FORM_SITE_SELECT } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#selectedSiteId()', () => {
		it( 'should default to null', () => {
			const state = selectedSiteId( undefined, {} );

			expect( state ).to.eql( null );
		} );

		it( 'should store the site id received', () => {
			const state = selectedSiteId( {}, {
				type: HELP_CONTACT_FORM_SITE_SELECT,
				siteId: 1,
			} );

			expect( state ).to.eql( 1 );
		} );
	} );
} );
